import React, { useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
const WhiteboardPanel = ({ roomId, isDark, }) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    // Sync state with socket (to be implemented)
    const handleChange = (elements, appState, files) => {
        // console.log("Whiteboard change:", elements);
        // socket.emit('whiteboard:change', { elements, roomId });
    };
    return (<div className="w-full h-full relative">
      <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} onChange={handleChange} theme={isDark ? "dark" : "light"} gridModeEnabled={true} UIOptions={{
            canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: {
                    saveFileToDisk: true,
                },
                themeSelection: false,
            },
        }}/>
    </div>);
};
export default WhiteboardPanel;
