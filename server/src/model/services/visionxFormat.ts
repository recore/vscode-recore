import * as prettier from 'prettier';
import { TextDocument, Range, TextEdit, Position } from 'vscode-languageserver-types';

export function visionxFormat(
  document: TextDocument,
  currRange: Range,
): TextEdit[] {
  const { value, range } = getValueAndRange(document, currRange);

  const beautifiedVisionX = prettier.format(value, {
    // @ts-ignore
    parser: 'visionx-parse',
  });
  return [
    {
      range,
      newText: beautifiedVisionX
    }
  ];
}

function getValueAndRange(document: TextDocument, currRange: Range): { value: string; range: Range } {
  let value = document.getText();
  let range = currRange;

  if (currRange) {
    const startOffset = document.offsetAt(currRange.start);
    const endOffset = document.offsetAt(currRange.end);
    value = value.substring(startOffset, endOffset);
  } else {
    range = Range.create(Position.create(0, 0), document.positionAt(value.length));
  }
  return { value, range };
}