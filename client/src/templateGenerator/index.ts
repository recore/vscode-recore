import { exec } from 'child_process';
import Uri from 'vscode-uri';
import { dirname, extname } from 'path';
import { getCamelName, showInputBox, showMessage, readFile, writeFile, showQuickPick } from './utils';

async function populateTemplate(type: string, srcName: string, targetName: string, pathToStore: string) {
  try {
    const outDirPath = dirname(__dirname);
    const srcDirPath = dirname(outDirPath);
    const ext = extname(srcName);
    const content = await readFile(`${srcDirPath}/template/${type}/${srcName}`);
    // file content
    let folderName = targetName;
    if (ext === '.tsx') {
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
      // 选择类型
      const type = await showQuickPick();
      if (!type) {
        return;
      }

      // 输入组件/页面名称
      const targetName = await showInputBox();
      if (targetName) {
        exec(`cd ${dir} && mkdir ${targetName} && cd ${targetName}`, async (error) => {
          for (const srcName of ['index.tsx', 'index.scss']) {
            await populateTemplate(type, srcName, targetName, `${dir}/${targetName}`);
          }
          if (error) {
            showMessage(error, 'error');
          } else {
            showMessage(`${getCamelName(type)} ${getCamelName(targetName)} has been generated successfully.`);
          }
        });
      }
    }
  };
}
