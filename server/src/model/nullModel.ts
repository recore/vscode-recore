import { LanguageModel } from './index';

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

export const nullMode: LanguageModel = {
  getId: () => '',
  onDocumentRemoved() {},
  dispose() {},
  doComplete: () => NULL_COMPLETION
};
