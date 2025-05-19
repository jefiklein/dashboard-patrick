import { defineConfig, Plugin, HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Keep the plugin definition, but don't include it in the main plugins array for now
export function devErrorAndNavigationPlugin(): Plugin {
  let stacktraceJsContent: string | null = null;
  let dyadShimContent: string | null = null;

  return {
    name: "dev-error-and-navigation-handler",
    apply: "serve", // Explicitly only for dev server

    configResolved() {
      // This runs during config resolution for both serve and build,
      // but the file reading logic is fine.
      const stackTraceLibPath = path.join(
        "node_modules",
        "stacktrace-js",
        "dist",
        "stacktrace.min.js",
      );
      if (stackTraceLibPath) {
        try {
          stacktraceJsContent = fs.readFileSync(stackTraceLibPath, "utf-8");
        } catch (error) {
          console.error(
            `[dyad-shim] Failed to read stacktrace.js from ${stackTraceLibPath}:`,
            error,
          );
          stacktraceJsContent = null;
        }
      } else {
        console.error(`[dyad-shim] stacktrace.js not found.`);
      }

      const dyadShimPath = path.join("dyad-shim.js");
      if (dyadShimPath) {
        try {
          dyadShimContent = fs.readFileSync(dyadShimPath, "utf-8");
        } catch (error) {
          console.error(
            `[dyad-shim] Failed to read dyad-shim from ${dyadShimPath}:`,
            error,
          );
          dyadShimContent = null;
        }
      } else {
        console.error(`[dyad-shim] stacktrace.js not found.`);
      }
    },

    transformIndexHtml(html) {
      // This hook should only run during 'serve' due to apply: 'serve'
      const tags: HtmlTagDescriptor[] = [];

      // 1. Inject stacktrace.js
      if (stacktraceJsContent) {
        tags.push({
          tag: "script",
          injectTo: "head-prepend",
          children: stacktraceJsContent,
        });
      } else {
        tags.push({
          tag: "script",
          injectTo: "head-prepend",
          children:
            "console.warn('[dyad-shim] stacktrace.js library was not injected.');",
        });
      }

      // 2. Inject dyad shim
      if (dyadShimContent) {
        tags.push({
          tag: "script",
          injectTo: "head-prepend",
          children: dyadShimContent,
        });
      } else {
        tags.push({
          tag: "script",
          injectTo: "head-prepend",
          children: "console.warn('[dyad-shim] dyad shim was not injected.');",
        });
      }

      return { html, tags };
    },
  };
}

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Remove devErrorAndNavigationPlugin from here for the build test
  plugins: [react()], // Only include react() plugin for now
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist', // Ensure output directory is 'dist'
    // Vite by default handles injecting script tags into index.html
    // based on the entry point defined in index.html itself.
    // The <script type="module" src="/src/main.tsx"></script> in the *source* index.html
    // is used by Vite during dev and build to find the entry point.
    // The *output* index.html in 'dist' will have the correct bundled script tag.
  },
}));