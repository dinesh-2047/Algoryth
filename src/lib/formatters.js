"use client";

let clangInitialized = false;
let ruffInitialized = false;

export async function formatCode(code, language) {
  if (typeof window === "undefined") {
    return code;
  }

  try {
    switch (language) {
      case "cpp":
      case "java": {
        const clangModule = await import("@wasm-fmt/clang-format");
        
        if (!clangInitialized) {
          if (typeof clangModule.default === 'function') {
            await clangModule.default();
          } else if (typeof clangModule.init === 'function') {
            await clangModule.init();
          }
          clangInitialized = true;
        }
        
        const filename = language === "java" ? "Main.java" : "main.cpp";
        
        // clang-format expects: format(code, filename, style_string)
        return clangModule.format(code, filename, "Google");
      }

      case "python": {
        const ruffModule = await import("@wasm-fmt/ruff_fmt");
        
        if (!ruffInitialized) {
          if (typeof ruffModule.default === 'function') {
            await ruffModule.default();
          } else if (typeof ruffModule.init === 'function') {
            await ruffModule.init();
          }
          ruffInitialized = true;
        }
        
        return ruffModule.format(code);
      }

      case "javascript": {
        const prettier = await import("prettier/standalone");
        
        let parserBabel;
        try {
          parserBabel = await import("prettier/plugins/babel");
        } catch {
          parserBabel = await import("prettier/plugins/babel.js");
        }
        
        let estree;
        try {
          estree = await import("prettier/plugins/estree");
        } catch {
          estree = await import("prettier/plugins/estree.js");
        }
        
        return prettier.format(code, {
          parser: "babel",
          plugins: [parserBabel, estree],
          semi: true,
          singleQuote: true,
          trailingComma: "es5",
        });
      }

      case "go":
      default:
        console.warn('Could not format', language);
        return code;
    }
  } catch (error) {
    console.warn('Could not format', language, error);
    return code;
  }
}