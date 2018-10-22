import { HTMLDocument } from '../parser/htmlParser';
import { TokenType, createScanner } from '../parser/htmlScanner';
import { TextDocument, Position, Definition } from 'vscode-languageserver-types';

const TRIVIAL_TOKEN = [TokenType.StartTagOpen, TokenType.EndTagOpen, TokenType.Whitespace];

export function findDefinition(
  document: TextDocument,
  position: Position,
  htmlDocument: HTMLDocument,
): Definition {
  const offset = document.offsetAt(position);
  const node = htmlDocument.findNodeAt(offset);
  if (!node || !node.tag) {
    return [];
  }
  function getTagDefinition(): Definition {
    return [];
  }

  const inEndTag = node.endTagStart && offset >= node.endTagStart; // <html></ht|ml>
  const startOffset = inEndTag ? node.endTagStart : node.start;
  const scanner = createScanner(document.getText(), startOffset);
  let token = scanner.scan();

  function shouldAdvance() {
    if (token === TokenType.EOS) {
      return false;
    }
    const tokenEnd = scanner.getTokenEnd();
    if (tokenEnd < offset) {
      return true;
    }

    if (tokenEnd === offset) {
      return TRIVIAL_TOKEN.indexOf(token) > -1;
    }
    return false;
  }

  while (shouldAdvance()) {
    token = scanner.scan();
  }

  if (offset > scanner.getTokenEnd()) {
    return [];
  }
  switch (token) {
    case TokenType.StartTag:
    case TokenType.EndTag:
      return getTagDefinition();
  }

  return [];
}
