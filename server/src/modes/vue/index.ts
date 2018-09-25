import { LanguageMode } from '../languageModes';
import { doScaffoldComplete } from './scaffoldCompletion';

export function getVueMode(): LanguageMode {
  let config: any = {};

  return {
    getId() {
      return 'visionx';
    },
    configure(c) {
      config = c;
    },
    doComplete(document, position) {
      if (!config.recore.completion.useScaffoldSnippets) {
        return { isIncomplete: false, items: [] };
      }
      const offset = document.offsetAt(position);
      const text = document.getText().slice(0, offset);
      const needBracket = /<\w*$/.test(text);
      const ret = doScaffoldComplete();
      // remove duplicate <
      if (needBracket) {
        ret.items.forEach(item => {
          item.insertText = item.insertText!.slice(1);
        });
      }
      return ret;
    },
    onDocumentRemoved() {},
    dispose() {}
  };
}
