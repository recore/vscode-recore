'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace, ExtensionContext } from 'vscode';
import { TagManager } from './tagManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

  const config = workspace.getConfiguration();

  // add associations
  config.update('files.associations', {
    "*.vx": "visionx",
    "*.vsx": "visionx"
  }, true);
  config.update('workbench.iconTheme', 'recore-icons', true);

  const tagManager = new TagManager();
  tagManager.run();
}

// this method is called when your extension is deactivated
export function deactivate() {
}
