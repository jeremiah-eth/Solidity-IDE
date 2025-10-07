import React, { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText,
  Palette,
  Type
} from 'lucide-react';

// Editor props interface
interface EditorProps {
  fileName: string;
  value: string;
  onChange: (value: string) => void;
  onCompile: () => void;
  isCompiling: boolean;
  compilationStatus: 'idle' | 'compiling' | 'success' | 'failed';
}

// Settings interface
interface EditorSettings {
  fontSize: number;
  theme: string;
  minimap: boolean;
  lineNumbers: boolean;
}

// Editor component
export function EditorComponent({
  fileName,
  value,
  onChange,
  onCompile,
  isCompiling,
  compilationStatus
}: EditorProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 14,
    theme: 'vs-dark',
    minimap: true,
    lineNumbers: true
  });

  const editorRef = useRef<any>(null);

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onCompile();
    });

    // Add Solidity language configuration
    monaco.languages.register({ id: 'solidity' });
    
    // Configure Solidity language
    monaco.languages.setMonarchTokensProvider('solidity', {
      tokenizer: {
        root: [
          // Keywords
          [/\b(pragma|contract|function|modifier|event|struct|enum|mapping|address|uint|int|bool|string|bytes|array|memory|storage|calldata|public|private|internal|external|view|pure|payable|returns|return|if|else|for|while|do|break|continue|throw|require|assert|revert|emit|new|delete|this|super|constructor|fallback|receive|library|interface|abstract|virtual|override|import|using|from|as|is|in|out|ref|var|let|const|static|final|sealed|virtual|abstract|override|new|delete|this|super|constructor|fallback|receive|library|interface|abstract|virtual|override|import|using|from|as|is|in|out|ref|var|let|const|static|final|sealed|virtual|abstract|override)\b/, 'keyword'],
          
          // Types
          [/\b(address|bool|string|bytes|uint|int|fixed|ufixed)\b/, 'type'],
          
          // Numbers
          [/\b\d+\.?\d*([eE][+-]?\d+)?\b/, 'number'],
          
          // Strings
          [/"[^"]*"/, 'string'],
          [/'[^']*'/, 'string'],
          
          // Comments
          [/\/\/.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment'],
          
          // Operators
          [/[+\-*/%=<>!&|^~]/, 'operator'],
          
          // Punctuation
          [/[{}()\[\];,.]/, 'punctuation']
        ]
      }
    });

    // Set theme
    monaco.editor.defineTheme('solidity-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'type', foreground: '4ec9b0' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'operator', foreground: 'd4d4d4' },
        { token: 'punctuation', foreground: 'd4d4d4' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#aeafad',
        'editorWhitespace.foreground': '#404040'
      }
    });
  };

  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  // Handle format
  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Handle settings change
  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get compilation status badge
  const getCompilationBadge = () => {
    switch (compilationStatus) {
      case 'compiling':
        return (
          <div className="flex items-center space-x-1 text-yellow-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Compiling...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-1 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Success</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-1 text-red-400">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Get keyboard shortcut hint
  const getShortcutHint = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? 'Cmd+S to compile' : 'Ctrl+S to compile';
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          {/* File name */}
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">{fileName || 'Untitled.sol'}</span>
          </div>

          {/* Compilation status */}
          {getCompilationBadge()}
        </div>

        <div className="flex items-center space-x-2">
          {/* Compile button */}
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
            title={getShortcutHint()}
          >
            <Play className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isCompiling ? 'Compiling...' : 'Compile'}
            </span>
          </button>

          {/* Format button */}
          <button
            onClick={handleFormat}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
            title="Format code (Shift+Alt+F)"
          >
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">Format</span>
          </button>

          {/* Settings dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>

            {/* Settings dropdown */}
            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <h3 className="text-white font-medium mb-3">Editor Settings</h3>
                  
                  {/* Font size */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-300 mb-2">Font Size</label>
                    <div className="flex items-center space-x-2">
                      <Type className="h-4 w-4 text-gray-400" />
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={settings.fontSize}
                        onChange={(e) => handleSettingsChange({ fontSize: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-300 w-8">{settings.fontSize}px</span>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-300 mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingsChange({ theme: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="vs-dark">Dark</option>
                      <option value="vs-light">Light</option>
                      <option value="hc-black">High Contrast</option>
                    </select>
                  </div>

                  {/* Minimap */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.minimap}
                        onChange={(e) => handleSettingsChange({ minimap: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-300">Show Minimap</span>
                    </label>
                  </div>

                  {/* Line numbers */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.lineNumbers}
                        onChange={(e) => handleSettingsChange({ lineNumbers: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-300">Show Line Numbers</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="solidity"
          theme={settings.theme === 'vs-dark' ? 'solidity-dark' : settings.theme}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: settings.fontSize,
            minimap: { enabled: settings.minimap },
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            renderWhitespace: 'selection',
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            contextmenu: true,
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            fontLigatures: true,
            fontFamily: 'Fira Code, Consolas, "Courier New", monospace',
            fontWeight: 'normal',
            letterSpacing: 0,
            lineHeight: 0,
            disableLayerHinting: false,
            renderLineHighlight: 'all',
            renderValidationDecorations: 'on',
            bracketPairColorization: {
              enabled: true
            },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
      </div>

      {/* Click outside to close settings */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

// Standalone editor settings component
export function EditorSettings({
  settings,
  onSettingsChange
}: {
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
}) {
  return (
    <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
      <h3 className="text-white font-medium mb-4">Editor Settings</h3>
      
      <div className="space-y-4">
        {/* Font size */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Font Size</label>
          <input
            type="range"
            min="10"
            max="24"
            value={settings.fontSize}
            onChange={(e) => onSettingsChange({ ...settings, fontSize: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10px</span>
            <span>{settings.fontSize}px</span>
            <span>24px</span>
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => onSettingsChange({ ...settings, theme: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          >
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => onSettingsChange({ ...settings, minimap: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Show Minimap</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.lineNumbers}
              onChange={(e) => onSettingsChange({ ...settings, lineNumbers: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Show Line Numbers</span>
          </label>
        </div>
      </div>
    </div>
  );
}
