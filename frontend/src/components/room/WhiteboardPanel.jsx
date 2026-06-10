import React, { useState, useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { ShieldCheck, ShieldAlert, Lock, Loader2 } from "lucide-react";
import { encryptData, decryptData } from "@/lib/crypto";

const mergeElements = (localElements, remoteElements) => {
  const localMap = new Map(localElements.map(el => [el.id, el]));
  const remoteMap = new Map(remoteElements.map(el => [el.id, el]));
  const mergedMap = new Map();

  for (const [id, localEl] of localMap.entries()) {
    const remoteEl = remoteMap.get(id);
    if (!remoteEl) {
      mergedMap.set(id, localEl);
    } else {
      if (localEl.version >= remoteEl.version) {
        mergedMap.set(id, localEl);
      } else {
        mergedMap.set(id, remoteEl);
      }
    }
  }

  for (const [id, remoteEl] of remoteMap.entries()) {
    if (!mergedMap.has(id)) {
      mergedMap.set(id, remoteEl);
    }
  }

  return Array.from(mergedMap.values());
};

const elementsChanged = (newEls, oldEls) => {
  if (newEls.length !== oldEls.length) return true;
  for (let i = 0; i < newEls.length; i++) {
    if (newEls[i].id !== oldEls[i].id || newEls[i].version !== oldEls[i].version) {
      return true;
    }
  }
  return false;
};

const WhiteboardPanel = ({ roomId, isDark, socket, whiteboardKey }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [syncStatus, setSyncStatus] = useState("connecting"); // "connecting" | "synced" | "syncing" | "saving" | "error"
  
  const isRemoteUpdateRef = useRef(false);
  const localElementsRef = useRef([]);
  const pendingUpdateRef = useRef(null);
  const throttleTimerRef = useRef(null);
  const saveSnapshotDebounced = useRef(null);

  // Request latest whiteboard state on mount or when API is ready
  useEffect(() => {
    if (!socket || !excalidrawAPI || !roomId) return;

    setSyncStatus("connecting");
    socket.emit("whiteboard:get-state", { roomId });

    const onWhiteboardInit = async ({ elements }) => {
      if (!elements) {
        setSyncStatus("synced");
        return;
      }
      try {
        const decrypted = await decryptData(elements, whiteboardKey);
        if (decrypted && Array.isArray(decrypted)) {
          isRemoteUpdateRef.current = true;
          localElementsRef.current = decrypted;
          excalidrawAPI.updateScene({ elements: decrypted });
        } else if (decrypted && decrypted.elements) {
          isRemoteUpdateRef.current = true;
          localElementsRef.current = decrypted.elements;
          excalidrawAPI.updateScene({ elements: decrypted.elements });
        }
        setSyncStatus("synced");
      } catch (err) {
        console.error("Failed to parse init whiteboard elements:", err);
        setSyncStatus("error");
      }
    };

    const onWhiteboardUpdate = async ({ elements }) => {
      try {
        setSyncStatus("syncing");
        const decrypted = await decryptData(elements, whiteboardKey);
        const remoteEls = Array.isArray(decrypted) 
          ? decrypted 
          : (decrypted?.elements || []);

        const currentEls = excalidrawAPI.getSceneElements();
        const merged = mergeElements(currentEls, remoteEls);

        isRemoteUpdateRef.current = true;
        localElementsRef.current = merged;
        excalidrawAPI.updateScene({ elements: merged });
        setSyncStatus("synced");
      } catch (err) {
        console.error("Failed to handle whiteboard update:", err);
        setSyncStatus("error");
      }
    };

    socket.on("whiteboard:init", onWhiteboardInit);
    socket.on("whiteboard:update", onWhiteboardUpdate);

    // If no data received after 1.5s, assume new room and set to synced
    const fallbackTimer = setTimeout(() => {
      setSyncStatus((prev) => (prev === "connecting" ? "synced" : prev));
    }, 1500);

    return () => {
      socket.off("whiteboard:init", onWhiteboardInit);
      socket.off("whiteboard:update", onWhiteboardUpdate);
      clearTimeout(fallbackTimer);
    };
  }, [socket, excalidrawAPI, roomId, whiteboardKey]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
      if (saveSnapshotDebounced.current) clearTimeout(saveSnapshotDebounced.current);
    };
  }, []);

  const emitUpdateThrottled = (elements) => {
    pendingUpdateRef.current = elements;
    if (throttleTimerRef.current) return;

    throttleTimerRef.current = setTimeout(async () => {
      throttleTimerRef.current = null;
      if (pendingUpdateRef.current && socket && roomId) {
        const els = pendingUpdateRef.current;
        pendingUpdateRef.current = null;

        try {
          const encrypted = await encryptData(els, whiteboardKey);
          socket.emit("whiteboard:update", {
            roomId,
            elements: encrypted,
          });
        } catch (err) {
          console.error("Failed to encrypt/emit whiteboard update:", err);
        }
      }
    }, 150);
  };

  const triggerSnapshotSave = (elements) => {
    if (saveSnapshotDebounced.current) {
      clearTimeout(saveSnapshotDebounced.current);
    }

    saveSnapshotDebounced.current = setTimeout(async () => {
      if (!socket || !roomId) return;
      try {
        setSyncStatus("saving");
        const encrypted = await encryptData(elements, whiteboardKey);
        socket.emit("whiteboard:snapshot", {
          roomId,
          elements: encrypted,
          timestamp: Date.now(),
        });
        setSyncStatus("synced");
      } catch (err) {
        console.error("Failed to save whiteboard snapshot:", err);
        setSyncStatus("error");
      }
    }, 3000);
  };

  const handleChange = (elements, appState, files) => {
    if (!excalidrawAPI) return;
    
    // Check if change was triggered by remote socket update
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    // Check if drawing elements actually changed to avoid syncing zoom/scrolls
    if (elementsChanged(elements, localElementsRef.current)) {
      localElementsRef.current = elements;
      setSyncStatus("syncing");
      emitUpdateThrottled(elements);
      triggerSnapshotSave(elements);
    }
  };

  return (
    <div className="w-full h-full relative border border-border rounded-xl overflow-hidden bg-background">
      {/* Floating Status Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/80 backdrop-blur-md text-xs font-medium shadow-lg select-none border-border">
        {syncStatus === "connecting" && (
          <>
            <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span className="text-muted-foreground">Initializing Security...</span>
          </>
        )}
        {syncStatus === "synced" && (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500">End-to-End Encrypted</span>
            <Lock className="w-2.5 h-2.5 text-muted-foreground/60 ml-0.5" />
          </>
        )}
        {syncStatus === "syncing" && (
          <>
            <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            <span className="text-blue-500">Syncing drawings...</span>
          </>
        )}
        {syncStatus === "saving" && (
          <>
            <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
            <span className="text-violet-500">Saving snapshot...</span>
          </>
        )}
        {syncStatus === "error" && (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
            <span className="text-destructive">Sync Error</span>
          </>
        )}
      </div>

      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={handleChange}
        theme={isDark ? "dark" : "light"}
        gridModeEnabled={true}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
            export: {
              saveFileToDisk: true,
            },
            themeSelection: false,
          },
        }}
      />
    </div>
  );
};

export default WhiteboardPanel;
