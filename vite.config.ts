import { defineConfig } from "vite";
import path from "path";

// Server build configuration

export default defineConfig({
  
  // FIX FOR 403 RESTRICTED ERROR
  server: {
    fs: {
      // 1. Allow the directory that contains the 'glow-space' folder
      // 2. Allow the current directory (the project root)
      allow: [
        '/Users/gantavya/Downloads', 
        __dirname, 
      ],
      // Set strict to false as a temporary test to see if it bypasses the error
      // Note: This is less secure and should ideally be 'true' later.
      strict: false 
    },
  },
  
  // ... (rest of your build and resolve configuration)
  build: {
    // ...
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // ...
});