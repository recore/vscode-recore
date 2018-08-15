import * as vscode from 'vscode';

interface IComponent {
  id: string;
  rev: string;
  name: string;
  description: string;
  lastest: string;
  users: any;
  author: any;
  repository: any;
  displayName: string;
  props: any;
  license: any;
}

export function importComponent(component: IComponent) {
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
}