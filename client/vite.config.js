var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
export default (function (_a) {
    var mode = _a.mode;
    process.env = __assign(__assign({}, process.env), loadEnv(mode, process.cwd()));
    return defineConfig({
        server: {
            port: 5173, // Adjusted for Vite dev server
            open: true, // Automatically open the browser on startup
            proxy: {
                "/api": {
                    target: "http://localhost:3001/", // Express backend server
                    changeOrigin: true,
                    secure: false, // HTTPS?
                },
                "/auth": {
                    target: "http://localhost:3001/", // Proxy auth routes to Express
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        plugins: [react()],
        css: {
            postcss: {
                plugins: [tailwindcss()],
            },
        },
    });
});
