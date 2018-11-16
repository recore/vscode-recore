import * as vscode from 'vscode';
import * as fs from 'fs';

export function getCamelName(name: string) {
  const Name = (name || '').replace(/[-_\s]+(\w)/ig, (_, p) => {
    return p.toUpperCase();
  });
  return Name[0].toUpperCase() + Name.slice(1);
}

export function showMessage(message: any, type?: string): void {
  // vscode api
  if (type === 'error') {
    vscode.window.showErrorMessage(message);
  } else {
    vscode.window.showInformationMessage(message);
  }
}

export async function showInputBox(): Promise<string | undefined> {
  let input;
  try {
    input = await vscode
      .window
      .showInputBox({
        prompt: 'Enter name of Recore Page or Component',
        placeHolder: `Recore Page or Component Name`
      });  
  } catch (e) {
    showMessage(e, 'error');
  }
  return input;
}

export function readFile(filePath: string): Promise<any> {
  return new Promise((res, rej) => {
    fs.readFile(filePath, function (err, data) {
      if (err) {
        showMessage(err);
        rej(err);
      } else {
        res(data);
      }
    });
  });
}

export function writeFile(filePath: string, data: any) {
  return new Promise((res, rej) => {
    fs.writeFile(filePath, data, function (err) {
      if (err) {
        showMessage(err);
        rej(err);
      } else {
        res();
      }
    });
  });
}
