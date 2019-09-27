import { exec } from 'child_process';
import Uri from 'vscode-uri';
import { dirname, extname } from 'path';
import { getCamelName, showInputBox, showMessage, readFile, writeFile } from './utils';

async function populateTemplate(srcName: string, targetName: string, pathToStore: string) {
  try {
    const outDirPath = dirname(__dirname);
    const srcDirPath = dirname(outDirPath);
    const ext = extname(srcName);
    const content = await readFile(`${srcDirPath}/template/${srcName.replace(/\.ts/, '.js')}`);
    // file content
    let folderName = targetName;
    if (ext === '.ts') {
      folderName = getCamelName(folderName);
    }
    const fileContent = String(content).replace(/<%= Name %>/igm, folderName);
    // write file
    await writeFile(`${pathToStore}/${srcName}`, fileContent);
  } catch (err) {
    console.log('populateTemplate', err);
  }
}

export default function generateTemplate() {
  return async (file: Uri) => {
    if (file) {
      const dir = file.fsPath;
      // Display a message box to the user
      const targetName = await showInputBox();
      if (targetName) {
        exec(`cd ${dir} && mkdir ${targetName} && cd ${targetName}`, (error) => {
          ['index.vx', 'index.ts', 'index.less'].forEach((srcName) => {
            populateTemplate(srcName, targetName, `${dir}/${targetName}`);
          });
          if (error) {
            showMessage(error, 'error');
          } else {
            showMessage(`${targetName} has been generated.`);
          }
        });
      }
    }
  };
}
