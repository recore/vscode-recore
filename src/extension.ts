'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CompNodeProvider } from './components';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const config = vscode.workspace.getConfiguration();

  // add associations
  config.update('files.associations', {
    "*.vx": "visionx",
    "*.vsx": "visionx",
    ...config.get('files.associations'),
  }, true);

  // change iconTheme
  config.update('workbench.iconTheme', 'recore-icons', true);

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "recore" is now active!');

	const componentsProvider = new CompNodeProvider();
  vscode.window.registerTreeDataProvider('recore-ui-library-uxcore', componentsProvider);
  vscode.commands.registerCommand('extension.openComponentList', component => {
    // current editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection : vscode.Selection = editor.selection;
      const { displayName, props } = component;

      let line = selection.active.line;
      const length = selection.active.character || 0;
      let insertPos = new vscode.Position(line, length);
      const prefix = `<${displayName}`;

      const insertProps = (props: any, line: number) => {
        Object.keys(props).map((key, index) => {
          const insertPos = new vscode.Position(line + index + 1, 0);
          editor.insertSnippet(new vscode.SnippetString(`${key}="${props[key]}"\n`), insertPos);
        });
      };

      // 换行
      if (length > 0) {
        // 插入标签
        editor.insertSnippet(new vscode.SnippetString('\n'), insertPos);
        line = line + 1;
      }

      const propStartInsertPos = new vscode.Position(line, length);
      editor.insertSnippet(new vscode.SnippetString(`${prefix}\n`), propStartInsertPos);
      insertProps(props, line);
      const sufixInsertPos = new vscode.Position(line + Object.keys(props).length + 1, 0);
      editor.insertSnippet(new vscode.SnippetString('/>'), sufixInsertPos);

      // 格式化
      vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', editor.document.uri);
      console.log(editor.document.uri);
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {
}
