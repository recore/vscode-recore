import * as vscode from 'vscode';
import { createWriteStream, ensureDir } from "fs-extra";
import createUUID from './uuid';
import { homedir, tmpdir } from "os";
import { join } from "path";
import Log from './log';
import * as pino from "pino";
// import { AliGoldDirection } from "./AliGoldDirection";

export default async function emitSurvey() {
  const PERIOD = 14; // 间隔的周期
  const ISSUE_URL = 'http://gitlab.alibaba-inc.com/groups/recore/issues';
  const FEEDBACK_TITLE = '帮助我们改善 Recore！请问您如何评价 Recore？';
  const Command: any = {
    like: '赞',
    dislike: '踩',
    delay: '以后提醒',
  };
  const LIKE_FEEDBACK = '谢谢鼓励';
  const DISLIKE_FEEDBACK = '非常期望听到您的宝贵意见和建议';
  const NEW_ISSUE_YES = '提issue';
  const NEW_ISSUE_NO = '残忍拒绝';
  const RECORE_HOME_PATH = join(homedir(), ".nowa/recore");
  const LOG_DIR_PATH = join(tmpdir(), "recore");
  const date = new Date();
  // 每个周期开始的第一天推送
  if (date.getDate() % PERIOD !== 1) {
    // return;
  }

  await Promise.all([ensureDir(RECORE_HOME_PATH), ensureDir(LOG_DIR_PATH)]);
  const logger: RecoreReporter.ILog = pino(
    {
      name: "recore-reporter"
    },
    createWriteStream(join(LOG_DIR_PATH, "reporter.log"), { flags: "a+" })
  );
  const log = new Log(
    join(RECORE_HOME_PATH, "operations.log"),
    { logger }
  );
  const uuid = createUUID();

  const genRateBox = vscode.window.showInformationMessage(
    FEEDBACK_TITLE,
    Command.like,
    Command.dislike,
    Command.delay
  );
  const getCommand = genRateBox.then((btn: string | undefined) => {
    if (!btn) {
      return null;
    }
    if (btn === Command.Like) {
      vscode.window.showInformationMessage(LIKE_FEEDBACK);
    } else if (btn === Command.Dislike) {
      vscode.window.showInformationMessage(DISLIKE_FEEDBACK, NEW_ISSUE_YES, NEW_ISSUE_NO)
      .then(res => {
        if (res === NEW_ISSUE_YES) {
          vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(ISSUE_URL));
        }
      });
    }
    return btn;
  });
  getCommand.then(cmdName => {
    if (!cmdName) {
      return null;
    }
    try {
      // const mapCmdNameToKey = (cmdName: string) => {
        
      // };
      // const command = mapCmdNameToKey(cmdName);
      // const recore: RecoreReporter.IRecord = {
      //   command,
      //   runAt: Date.now().toString(),
      // };
      // const aliGoldDirection = new AliGoldDirection(uuid, 'rate');
      // aliGoldDirection.sendRecord(recore);
    } catch (e) {
      console.log(e);
    }
  });
}
