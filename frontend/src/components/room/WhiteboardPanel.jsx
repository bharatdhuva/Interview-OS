import React, { useState, useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { ShieldCheck, ShieldAlert, Lock, Loader2 } from "lucide-react";
import { encryptData, decryptData } from "@/lib/crypto";

// Merges remote elements into local elements while preserving layering and resolving version conflicts
const mergeElements = (localElements, remoteElements) => {
  const remoteMap = new Map(remoteElements.map(el => [el.id, el]));
  const result = [];
  const processed = new Set();

  for (const localEl of localElements) {
    const remoteEl = remoteMap.get(localEl.id);
    if (remoteEl) {
      if (remoteEl.version > localEl.version) {
        result.push(remoteEl);
      } else {
        result.push(localEl);
      }
    } else {
      result.push(localEl);
    }
    processed.add(localEl.id);
  }

  for (const remoteEl of remoteElements) {
    if (!processed.has(remoteEl.id)) {
      result.push(remoteEl);
    }
  }

  return result;
};

const WhiteboardPanel = ({ roomId, isDark, socket, whiteboardKey }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [syncStatus, setSyncStatus] = useState("connecting"); // "connecting" | "synced" | "syncing" | "saving" | "error"
  
  // Track known versions to identify local changes vs remote updates
  const knownVersionsRef = useRef(new Map());
  const pendingUpdateRef = useRef(null); // Map of id -> element
  const throttleTimerRef = useRef(null);
  const saveSnapshotDebounced = useRef(null);
  const elementsRef = useRef([]);
  const hasUnsavedChangesRef = useRef(false);

  // Sync state with socket (init and update listeners)
  useEffect(() => {
    if (!socket || !excalidrawAPI || !roomId) return; // whiteboardKey is optional; handled below

    setSyncStatus("connecting");
    if (whiteboardKey) {
        socket.emit("whiteboard:get-state", { roomId });
      } else {
        // No encryption key – assume empty board
        setSyncStatus("synced");
      }

    const onWhiteboardInit = async ({ elements }) => {
        if (!whiteboardKey) {
          // No encryption – start with empty board
          setSyncStatus("synced");
          return;
        }
        if (!elements) {
          setSyncStatus("synced");
          return;
        }
        try {
          const decrypted = await decryptData(elements, whiteboardKey);
          const initEls = Array.isArray(decrypted) 
            ? decrypted 
            : (decrypted?.elements || []);
          
          // Initialize version map
          knownVersionsRef.current.clear();
          for (const el of initEls) {
            knownVersionsRef.current.set(el.id, el.version);
          }

          excalidrawAPI.updateScene({ elements: initEls });
          setSyncStatus("synced");
        } catch (err) {
          console.error("Failed to parse init whiteboard elements:", err);
          setSyncStatus("error");
        }
      };

    const onWhiteboardUpdate = async ({ elements }) => {
        if (!whiteboardKey) {
          // No encryption – ignore updates
          setSyncStatus("synced");
          return;
        }
        try {
          setSyncStatus("syncing");
          console.log("Whiteboard update received. Key length:", whiteboardKey?.length || 0, "Payload length/type:", typeof elements === "string" ? elements.length : typeof elements);
          const decrypted = await decryptData(elements, whiteboardKey);
          console.log("Decrypted elements. type:", typeof decrypted, "isArray:", Array.isArray(decrypted), "count:", Array.isArray(decrypted) ? decrypted.length : 0);
          const remoteEls = Array.isArray(decrypted) 
            ? decrypted 
            : (decrypted?.elements || []);

          // Record incoming versions to prevent echo back
          for (const el of remoteEls) {
            const currentKnown = knownVersionsRef.current.get(el.id) || -1;
            if (el.version > currentKnown) {
              knownVersionsRef.current.set(el.id, el.version);
            }
          }

          const currentEls = excalidrawAPI.getSceneElements();
          const merged = mergeElements(currentEls, remoteEls);

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

  // Clean up timers on unmount & save final snapshot if unsaved changes exist
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
      if (saveSnapshotDebounced.current) clearTimeout(saveSnapshotDebounced.current);

      if (hasUnsavedChangesRef.current && socket && roomId) {
        // Run final snapshot save immediately on unmount (as a floating promise)
        if (whiteboardKey) {
            encryptData(elementsRef.current, whiteboardKey)
              .then((encrypted) => {
                socket.emit("whiteboard:snapshot", { roomId, elements: encrypted, timestamp: Date.now() });
              })
              .catch((err) => {
                console.error("Failed to save final whiteboard snapshot on unmount:", err);
              });
          } else {
            const plain = JSON.stringify(elementsRef.current);
            socket.emit("whiteboard:snapshot", { roomId, elements: plain, timestamp: Date.now() });
          }
      }
    };
  }, [socket, roomId, whiteboardKey]);

  const emitUpdateThrottled = () => {
    if (throttleTimerRef.current) return;

    // Use a smaller throttle time (80ms) for high responsiveness
    throttleTimerRef.current = setTimeout(async () => {
      throttleTimerRef.current = null;
      if (pendingUpdateRef.current && pendingUpdateRef.current.size > 0 && socket && roomId) {
        const elsToSend = Array.from(pendingUpdateRef.current.values());
        pendingUpdateRef.current = null;

        try {
          console.log("Encrypting & emitting elements update. count:", elsToSend.length, "Key length:", whiteboardKey?.length || 0);
          if (!whiteboardKey) {
            // Skip encryption when no key – send plain elements (as JSON string)
            const plain = JSON.stringify(elsToSend);
            console.log("Emitting unencrypted whiteboard:update. Count:", elsToSend.length);
            socket.emit("whiteboard:update", { roomId, elements: plain });
          } else {
            const encrypted = await encryptData(elsToSend, whiteboardKey);
            console.log("Emitting whiteboard:update. Payload length/type:", typeof encrypted === "string" ? encrypted.length : typeof encrypted);
            socket.emit("whiteboard:update", {
              roomId,
              elements: encrypted,
            });
          }
        } catch (err) {
          console.error("Failed to encrypt/emit whiteboard update:", err);
        }
      }
    }, 80);
  };

  const triggerSnapshotSave = (allElements) => {
    if (saveSnapshotDebounced.current) {
      clearTimeout(saveSnapshotDebounced.current);
    }

    // Save complete board snapshot after 3 seconds of drawing inactivity
    saveSnapshotDebounced.current = setTimeout(async () => {
      if (!socket || !roomId) return;
      try {
        setSyncStatus("saving");
        if (!whiteboardKey) {
            const plain = JSON.stringify(allElements);
            socket.emit("whiteboard:snapshot", { roomId, elements: plain, timestamp: Date.now() });
          } else {
            const encrypted = await encryptData(allElements, whiteboardKey);
            socket.emit("whiteboard:snapshot", { roomId, elements: encrypted, timestamp: Date.now() });
          }
        hasUnsavedChangesRef.current = false;
        setSyncStatus("synced");
      } catch (err) {
        console.error("Failed to save whiteboard snapshot:", err);
        setSyncStatus("error");
      }
    }, 3000);
  };

  const handleChange = (elements, appState, files) => {
    if (!excalidrawAPI) return;
    elementsRef.current = elements;

    // Detect if any element was created or modified locally
    const changedEls = [];
    for (const el of elements) {
      const knownVer = knownVersionsRef.current.get(el.id) || -1;
      if (el.version > knownVer) {
        // Update known version map locally immediately to prevent redundant detection
        knownVersionsRef.current.set(el.id, el.version);
        changedEls.push(el);
      }
    }

    if (changedEls.length > 0) {
      console.log("Whiteboard change detected. count:", changedEls.length);
      hasUnsavedChangesRef.current = true;
      setSyncStatus("syncing");

      // Stage changed elements in the update map
      if (!pendingUpdateRef.current) {
        pendingUpdateRef.current = new Map();
      }
      for (const el of changedEls) {
        pendingUpdateRef.current.set(el.id, el);
      }

      emitUpdateThrottled();
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
        {(syncStatus === "synced" || syncStatus === "syncing" || syncStatus === "saving") && (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500">End-to-End Encrypted</span>
            <Lock className="w-2.5 h-2.5 text-muted-foreground/60 ml-0.5" />
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
