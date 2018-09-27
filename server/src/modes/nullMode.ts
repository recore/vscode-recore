import { LanguageMode } from './languageModes';

export const NULL_HOVER: any = {
  contents: []
};

export const NULL_SIGNATURE: any = {
  signatures: [],
  activeSignature: 0,
  activeParameter: 0
};

export const NULL_COMPLETION: any = {
  isIncomplete: false,
  items: []
};

export const nullMode: LanguageMode = {
  getId: () => '',
  onDocumentRemoved() {},
  dispose() {},
  doHover: () => NULL_HOVER,
  doComplete: () => NULL_COMPLETION,
  doSignatureHelp: () => NULL_SIGNATURE,
  findReferences: () => []
};
