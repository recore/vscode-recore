import * as _ from 'lodash';
import { getLanguageModelCache } from './languageModelCache';
import { HTMLDocument } from './parser/htmlParser';
import { doComplete } from './services/htmlCompletion';
// import { htmlFormat } from './services/htmlFormat';
import { visionxFormat } from './services/visionxFormat';
import { parseHTMLDocument } from './parser/htmlParser';
import { getTagProviderSettings } from './tagProviders';
import { getEnabledTagProviders, getControllerTags } from './tagProviders';
import { findController } from './parser/controllerParser';
import Uri from 'vscode-uri';
import {
  CompletionItem,
  TextEdit,
  TextDocument,
  Range,
  CompletionList,
  Position,
  FormattingOptions
} from 'vscode-languageserver-types';

export interface LanguageModel {
  getId(): string;
  configure?(options: any): void;
  doComplete?(document: TextDocument, position: Position): CompletionList;
  doResolve?(document: TextDocument, item: CompletionItem): CompletionItem;
  format?(document: TextDocument, range: Range, options: FormattingOptions): TextEdit[];

  onDocumentChanged?(filePath: string): void;
  onDocumentRemoved(document: TextDocument): void;
  dispose(): void;
}

export function getVisionXModel(
): LanguageModel {
  let tagProviderSettings = getTagProviderSettings();
  let enabledTagProviders = getEnabledTagProviders(tagProviderSettings);
  const visionxDocuments = getLanguageModelCache<HTMLDocument>(10, 60, document => parseHTMLDocument(document));
  let config: any = {};

  return {
    getId() {
      return 'visionx';
    },
    configure(c) {
      // tagProviderSettings = _.assign(tagProviderSettings, c.html.suggest);
      tagProviderSettings = _.assign(tagProviderSettings, {});
      enabledTagProviders = getEnabledTagProviders(tagProviderSettings);
      config = c;
    },
    doComplete(document: TextDocument, position: Position) {
      const fileFsPath = getFileFsPath(document.uri);
      const controller = findController(fileFsPath);
      const tagProviders = enabledTagProviders.concat(getControllerTags(controller));
      return doComplete(document, position, visionxDocuments.get(document), tagProviders, config.emmet);
    },
    format(document: TextDocument, range: Range) {
      return visionxFormat(document, range);
    },
    onDocumentRemoved(document: TextDocument) {
      visionxDocuments.onDocumentRemoved(document);
    },
    dispose() {
      visionxDocuments.dispose();
    }
  };
}

function getFileFsPath(documentUri: string): string {
  return Uri.parse(documentUri).fsPath;
}
