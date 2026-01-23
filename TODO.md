# TODO for Adding Keyboard Shortcuts and Buttons to CodeEditor.jsx

- [x] Add imports for KeyMod and KeyCode from 'monaco-editor'
- [x] Add resetCode function to reset code to initialCode
- [x] Add handleEditorDidMount function with keybindings for Run, Submit, and Reset
- [x] Add onMount prop to Monaco component
- [x] Test the implementation (Critical-path: shortcuts work; Thorough: full component interaction)
- [x] Add Reset button next to Run and Submit buttons
- [x] Add cursor: pointer to all buttons (Run, Submit, Reset, Auto)
- [x] Update button labels to show shortcuts (Ctrl+Enter, Ctrl+Shift+Enter, Ctrl+B)
- [x] Add title attributes for tooltips on shortcut buttons
- [x] Enhance Run/Submit buttons in ProblemWorkspace.jsx with proper styling, hover effects, and tooltips
- [x] Restore Reset button in CodeEditor.jsx toolbar with tooltip
- [x] Fix Reset button functionality to use onReset prop when provided
