import type { Monaco } from "@monaco-editor/react";

export const EDULANG_ID = "edulang";

// Syntax highlighting for EduLang (a Monarch tokenizer).
export function registerEduLang(monaco: Monaco): void {
  if (monaco.languages.getLanguages().some((l) => l.id === EDULANG_ID)) return;

  monaco.languages.register({ id: EDULANG_ID });
  monaco.languages.setLanguageConfiguration(EDULANG_ID, {
    comments: { lineComment: "//" },
    brackets: [
      ["(", ")"],
      ["{", "}"],
    ],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "{", close: "}" },
      { open: '"', close: '"', notIn: ["string"] },
    ],
  });
  monaco.languages.setMonarchTokensProvider(EDULANG_ID, {
    keywords: ["int", "float", "string", "bool", "print", "if", "else"],
    booleans: ["true", "false"],
    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],
        [/\d+\.\d+/, "number.float"],
        [/\d+/, "number"],
        [
          /[a-zA-Z_]\w*/,
          { cases: { "@keywords": "keyword", "@booleans": "constant", "@default": "identifier" } },
        ],
        [/[=!<>]=?|[+\-*/]/, "operator"],
        [/[;(){}]/, "delimiter"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
      ],
    },
  });
}
