import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: "::",
        port: 8080,
        hmr: {
            overlay: false,
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        'process.env.IS_PREACT': JSON.stringify('false')
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("@monaco-editor") || id.includes("monaco-editor")) {
                            return "monaco-editor";
                        }
                        if (id.includes("react-markdown") || id.includes("markdown")) {
                            return "react-markdown";
                        }
                        if (id.includes("excalidraw") || id.includes("@excalidraw")) {
                            return "excalidraw";
                        }
                        if (id.includes("framer-motion")) {
                            return "motion";
                        }
                        if (id.includes("lucide-react")) {
                            return "icons";
                        }
                        if (id.includes("recharts") || id.includes("d3-")) {
                            return "charts";
                        }
                        if (id.includes("socket.io-client") || id.includes("engine.io-client")) {
                            return "socket";
                        }
                        if (id.includes("three")) {
                            return "three-vendor";
                        }
                        if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
                            return "react-vendor";
                        }
                    }
                }
            }
        }
    }
});
