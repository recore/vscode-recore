import * as vscode from 'vscode';

export function insertAutoCloseTag(event: vscode.TextDocumentChangeEvent): void {
    if (!event.contentChanges[0]) {
        return;
    }
    let isRightAngleBracket = CheckRightAngleBracket(event.contentChanges[0]);
    if (!isRightAngleBracket && event.contentChanges[0].text !== "/") {
        return;
    }

    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    let config = vscode.workspace.getConfiguration('auto-close-tag', editor.document.uri);
    if (!config.get<boolean>("enableAutoCloseTag", true)) {
        return;
    }

    let languageId = editor.document.languageId;
    let languages = config.get<string[]>("activationOnLanguage", ["*"]);
    if (languages.indexOf("*") === -1 && languages.indexOf(languageId) === -1) {
        return;
    }

    let selection = editor.selection;
    let originalPosition = selection.start.translate(0, 1);
    let excludedTags = config.get<string[]>("excludedTags", []);
    let enableAutoCloseSelfClosingTag = config.get<boolean>("enableAutoCloseSelfClosingTag", true);

    if (isRightAngleBracket ||
        (enableAutoCloseSelfClosingTag && event.contentChanges[0].text === "/")) {
        let textLine = editor.document.lineAt(selection.start);
        let text = textLine.text.substring(0, selection.start.character + 1);
        let result = /<([a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?(\/|>)$/.exec(text);
        if (result !== null && ((occurrenceCount(result[0], "'") % 2 === 0)
            && (occurrenceCount(result[0], "\"") % 2 === 0) && (occurrenceCount(result[0], "`") % 2 === 0))) {
            if (result[2] === ">") {
                if (excludedTags.indexOf(result[1]) === -1) {
                    editor.edit((editBuilder) => {
                        editBuilder.insert(originalPosition, "</" + result[1] + ">");
                    }).then(() => {
                        editor.selection = new vscode.Selection(originalPosition, originalPosition);
                    });
                }
            } else {
                if (textLine.text.length <= selection.start.character + 1 || textLine.text[selection.start.character + 1] !== '>') { // if not typing "/" just before ">", add the ">" after "/"
                    editor.edit((editBuilder) => {
                        editBuilder.insert(originalPosition, ">");
                    });
                }
            }
        }
    }
}

function CheckRightAngleBracket(contentChange: vscode.TextDocumentContentChangeEvent): boolean {
    return contentChange.text === ">" || CheckRightAngleBracketInVSCode_1_8(contentChange);
}

function CheckRightAngleBracketInVSCode_1_8(contentChange: vscode.TextDocumentContentChangeEvent): boolean {
    return contentChange.text.endsWith(">") && contentChange.range.start.character === 0
        && contentChange.range.start.line === contentChange.range.end.line
        && !contentChange.range.end.isEqual(new vscode.Position(0, 0));
}

function occurrenceCount(source: string, find: string): number {
    return source.split(find).length - 1;
} 
