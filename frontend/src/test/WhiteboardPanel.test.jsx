import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import WhiteboardPanel from "../components/room/WhiteboardPanel";
import { Excalidraw } from "@excalidraw/excalidraw";
import { encryptData, decryptData } from "../lib/crypto";

// Mock @excalidraw/excalidraw
vi.mock("@excalidraw/excalidraw", () => {
  return {
    Excalidraw: vi.fn(({ excalidrawAPI, onChange }) => {
      // Expose the API trigger in a way tests can retrieve
      window.lastExcalidrawProps = { excalidrawAPI, onChange };
      return <div data-testid="mock-excalidraw" />;
    }),
  };
});

// Mock lucide-react to avoid styling issues in test
vi.mock("lucide-react", () => {
  return {
    ShieldCheck: () => <span>ShieldCheck</span>,
    ShieldAlert: () => <span>ShieldAlert</span>,
    Lock: () => <span>Lock</span>,
    Loader2: () => <span>Loader2</span>,
  };
});

describe("WhiteboardPanel Component", () => {
  let container;
  let root;
  const hexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const roomId = "test-room-123";

  beforeAll(() => {
    // Polyfill window.crypto if not present
    if (!window.crypto) {
      window.crypto = globalThis.crypto;
    }
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
      root = null;
    }
    document.body.removeChild(container);
    container = null;
    vi.restoreAllMocks();
    delete window.lastExcalidrawProps;
  });

  it("should mount and fetch initial state from socket", async () => {
    const socket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <WhiteboardPanel
          roomId={roomId}
          isDark={false}
          socket={socket}
          whiteboardKey={hexKey}
        />
      );
    });

    // Excalidraw api setup to trigger sync
    const mockAPI = {
      updateScene: vi.fn(),
      getSceneElements: vi.fn(() => []),
    };

    act(() => {
      window.lastExcalidrawProps.excalidrawAPI(mockAPI);
    });

    // Check that get-state was emitted
    expect(socket.emit).toHaveBeenCalledWith("whiteboard:get-state", { roomId });
    expect(socket.on).toHaveBeenCalledWith("whiteboard:init", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("whiteboard:update", expect.any(Function));
  });

  it("should handle whiteboard:init event and decrypt elements", async () => {
    const socket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <WhiteboardPanel
          roomId={roomId}
          isDark={false}
          socket={socket}
          whiteboardKey={hexKey}
        />
      );
    });

    // Simulate Excalidraw ref setup
    const mockUpdateScene = vi.fn();
    const mockGetSceneElements = vi.fn(() => []);
    const mockAPI = {
      updateScene: mockUpdateScene,
      getSceneElements: mockGetSceneElements,
    };

    act(() => {
      window.lastExcalidrawProps.excalidrawAPI(mockAPI);
    });

    // Get the init listener registered
    const initListener = socket.on.mock.calls.find(call => call[0] === "whiteboard:init")[1];

    const testElements = [
      { id: "el1", type: "rectangle", version: 5 }
    ];
    const encryptedElements = await encryptData(testElements, hexKey);

    await act(async () => {
      await initListener({ elements: encryptedElements });
    });

    expect(mockUpdateScene).toHaveBeenCalledWith({ elements: testElements });
  });

  it("should handle whiteboard:update event and merge remote changes", async () => {
    const socket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <WhiteboardPanel
          roomId={roomId}
          isDark={false}
          socket={socket}
          whiteboardKey={hexKey}
        />
      );
    });

    const mockUpdateScene = vi.fn();
    const localElements = [
      { id: "el1", type: "rectangle", version: 2 },
      { id: "el2", type: "ellipse", version: 1 }
    ];
    const mockGetSceneElements = vi.fn(() => localElements);
    const mockAPI = {
      updateScene: mockUpdateScene,
      getSceneElements: mockGetSceneElements,
    };

    act(() => {
      window.lastExcalidrawProps.excalidrawAPI(mockAPI);
    });

    const updateListener = socket.on.mock.calls.find(call => call[0] === "whiteboard:update")[1];

    // Remote contains el1 updated (version 3) and new el3 (version 1)
    const remoteElements = [
      { id: "el1", type: "rectangle", version: 3 },
      { id: "el3", type: "diamond", version: 1 }
    ];
    const encryptedRemote = await encryptData(remoteElements, hexKey);

    await act(async () => {
      await updateListener({ elements: encryptedRemote });
    });

    // The merge should result in: el1 (v3), el2 (v1), el3 (v1)
    expect(mockUpdateScene).toHaveBeenCalled();
    const mergedPassed = mockUpdateScene.mock.calls[0][0].elements;
    expect(mergedPassed.find(el => el.id === "el1").version).toBe(3);
    expect(mergedPassed.find(el => el.id === "el2").version).toBe(1);
    expect(mergedPassed.find(el => el.id === "el3").version).toBe(1);
  });

  it("should detect local changes and emit throttled socket updates", async () => {
    const socket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <WhiteboardPanel
          roomId={roomId}
          isDark={false}
          socket={socket}
          whiteboardKey={hexKey}
        />
      );
    });

    const mockUpdateScene = vi.fn();
    const mockGetSceneElements = vi.fn(() => []);
    const mockAPI = {
      updateScene: mockUpdateScene,
      getSceneElements: mockGetSceneElements,
    };

    act(() => {
      window.lastExcalidrawProps.excalidrawAPI(mockAPI);
    });

    // Simulate local user drawing an element
    const localElements = [
      { id: "elLocal", type: "line", version: 1 }
    ];

    await act(async () => {
      window.lastExcalidrawProps.onChange(localElements);
    });

    // Since socket emits are throttled (80ms), verify that no emit happened immediately
    const updateEmits = socket.emit.mock.calls.filter(call => call[0] === "whiteboard:update");
    expect(updateEmits.length).toBe(0);

    // Fast-forward throttle timer (80ms)
    await act(async () => {
      vi.advanceTimersByTime(80);
    });

    // Flush async microtasks because encryptData runs asynchronously inside setTimeout callback
    await act(async () => {
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
      }
    });

    // Now verified that a whiteboard:update is emitted with encrypted content
    const postThrottleEmits = socket.emit.mock.calls.filter(call => call[0] === "whiteboard:update");
    expect(postThrottleEmits.length).toBe(1);
    expect(postThrottleEmits[0][1].roomId).toBe(roomId);

    // Decrypt the emitted data and check if it has the local element
    const decrypted = await decryptData(postThrottleEmits[0][1].elements, hexKey);
    expect(decrypted).toEqual(localElements);
  });
});
