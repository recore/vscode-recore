// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate() {
  const conf = vscode.workspace.getConfiguration();
  conf.update('files.associations', {
    "*.vx": "visionx",
    "*.vsx": "visionx"
  }, true);
  conf.update('workbench.iconTheme', 'recore-icons', true);
  console.log('Congratulations, your extension "recore" is now active!');
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
