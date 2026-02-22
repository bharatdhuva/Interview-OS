import React, { useState, useEffect } from "react";
import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";

interface WhiteboardPanelProps {
  roomId?: string;
  isDark?: boolean;
}

const WhiteboardPanel: React.FC<WhiteboardPanelProps> = ({
  roomId,
  isDark,
}) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  // Sync state with socket (to be implemented)
  const handleChange = (elements: any, appState: any, files: any) => {
    // console.log("Whiteboard change:", elements);
    // socket.emit('whiteboard:change', { elements, roomId });
  };

  return (
    <div className="w-full h-full relative">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={handleChange}
        theme={isDark ? "dark" : "light"}
        gridModeEnabled={true}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
            export: true,
            themeSelection: false,
          },
        }}
      />
    </div>
  );
};

export default WhiteboardPanel;
