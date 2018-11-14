import * as vscode from 'vscode';

export default function emitSurvey() {
  const PERIOD = 14; // 间隔的周期
  const ISSUE_URL = 'http://gitlab.alibaba-inc.com/groups/recore/issues';
  const FEEDBACK_TITLE = '帮助我们改善 Recore！请问您如何评价 Recore？';
  const Command: any = {
    Like: '赞',
    Dislike: '踩',
    Delay: '以后提醒',
  };
  const LIKE_FEEDBACK = '谢谢鼓励';
  const DISLIKE_FEEDBACK = '非常期望听到您的宝贵意见和建议';
  const NEW_ISSUE_YES = '提issue';
  const NEW_ISSUE_NO = '残忍拒绝';

  // TODO:检验是否发起问卷
  // 校验一：是否已经发起过
  // if (标志位 === 完成) {
  //   return;
  // } else if (标志位 === 未完成) {
  //   continue;
  // } else if (标志位 === 错误) {
  //   发送命令。若成功，则将标志位置为完成，return
  // }

  // 校验二：是否到时间
  // 每个周期开始的第一天推送
  const date = new Date();
  if (date.getDate() % PERIOD !== 1) {
    // 为方便调试而注释
    // return;
  }

  const genRateBox = vscode.window.showInformationMessage(
    FEEDBACK_TITLE,
    Command.Like,
    Command.Dislike,
    Command.Delay
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
      // cmdName：一类：赞、踩（问卷完成）一类：以后提醒（未完成）
      // if (cmdName === 赞 或 踩) {
      //   写入命令日志,
      //   标志为完成，
      //   并发送命令
      // } else {
      //   标志为未完成
      // }
    } catch (e) {
      console.log(e);
      // 发生错误，写入错误日志，标志为错误，错误一般为未联网
    }
  });
}
