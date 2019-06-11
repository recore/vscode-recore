import { TextDocument, Range, TextEdit, Position } from 'vscode-languageserver-types';
import format from '@ali/vx-format';

export function visionxFormat(
  document: TextDocument,
  currRange: Range,
): TextEdit[] {
  const { value, range } = getValueAndRange(document, currRange);

  const beautifiedVisionX = format(value);
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
