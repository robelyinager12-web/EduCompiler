import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import type { Diagnostic } from "../../types/compiler.types";
import { EDULANG_ID, registerEduLang } from "./edulangLanguage";

type EditorApi = Parameters<OnMount>[0];
type MonacoApi = Parameters<OnMount>[1];

interface Props {
  value: string;
  onChange: (value: string) => void;
  diagnostics: Diagnostic[];
  onRun: () => void;
}

export default function CodeEditor({ value, onChange, diagnostics, onRun }: Props) {
  const { theme } = useTheme();
  const [instance, setInstance] = useState<{ editor: EditorApi; monaco: MonacoApi } | null>(null);

  // The Ctrl+Enter shortcut is registered once, so it must call the latest onRun.
  const runRef = useRef(onRun);
  useEffect(() => {
    runRef.current = onRun;
  });

  const handleBeforeMount: BeforeMount = (monaco) => registerEduLang(monaco);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
    setInstance({ editor, monaco });
  };

  // Show compiler errors and warnings as squiggles in the editor.
  useEffect(() => {
    if (!instance) return;
    const { editor, monaco } = instance;
    const model = editor.getModel();
    if (!model) return;

    const markers = diagnostics.map((d) => {
      const line = Math.min(Math.max(1, d.line), model.getLineCount());
      const startColumn = Math.min(Math.max(1, d.column), model.getLineMaxColumn(line));
      const word = model.getWordAtPosition({ lineNumber: line, column: startColumn });
      return {
        severity:
          d.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        message: d.message,
        startLineNumber: line,
        endLineNumber: line,
        startColumn,
        endColumn: Math.max(startColumn + 1, word?.endColumn ?? startColumn + 1),
      };
    });
    monaco.editor.setModelMarkers(model, "edulang", markers);
  }, [instance, diagnostics]);

  return (
    <Editor
      height="100%"
      language={EDULANG_ID}
      theme={theme === "dark" ? "vs-dark" : "vs"}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        ariaLabel: "EduLang source code",
      }}
    />
  );
}
