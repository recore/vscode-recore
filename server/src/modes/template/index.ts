import * as _ from 'lodash';

import { LanguageModelCache, getLanguageModelCache } from '../languageModelCache';
import { TextDocument, Position, Range, FormattingOptions } from 'vscode-languageserver-types';
import { LanguageMode } from '../languageModes';
import { VueDocumentRegions } from '../embeddedSupport';
import { HTMLDocument } from './parser/htmlParser';
import { doComplete } from './services/htmlCompletion';
import { doHover } from './services/htmlHover';
import { findDocumentHighlights } from './services/htmlHighlighting';
import { findDocumentLinks } from './services/htmlLinks';
import { findDocumentSymbols } from './services/htmlSymbolsProvider';
import { htmlFormat } from './services/htmlFormat';
import { parseHTMLDocument } from './parser/htmlParser';
import { findDefinition } from './services/htmlDefinition';
import { getTagProviderSettings } from './tagProviders';
import { ScriptMode } from '../script/javascript';
import { getComponentTags, getEnabledTagProviders } from './tagProviders';
import { DocumentContext } from '../../types';

type DocumentRegionCache = LanguageModelCache<VueDocumentRegions>;

export function getVisionXMode(
  documentRegions: DocumentRegionCache,
  workspacePath: string | null | undefined,
  scriptMode: ScriptMode
): LanguageMode {
  let tagProviderSettings = getTagProviderSettings(workspacePath);
  let enabledTagProviders = getEnabledTagProviders(tagProviderSettings);
  const visionxDocuments = getLanguageModelCache<HTMLDocument>(10, 60, document => parseHTMLDocument(document));
  let config: any = {};

  return {
    getId() {
      return 'visionx';
    },
    configure(c) {
      tagProviderSettings = _.assign(tagProviderSettings, c.html.suggest);
      enabledTagProviders = getEnabledTagProviders(tagProviderSettings);
      config = c;
    },
    doComplete(document: TextDocument, position: Position) {
      const tagProviders = enabledTagProviders;
      return doComplete(document, position, visionxDocuments.get(document), tagProviders, config.emmet);
    },
    doHover(document: TextDocument, position: Position) {
      // const components = scriptMode.findComponents(document);
      // const tagProviders = enabledTagProviders.concat(getComponentTags(components));
      const tagProviders = enabledTagProviders;
      return doHover(document, position, visionxDocuments.get(document), tagProviders);
    },
    findDocumentHighlight(document: TextDocument, position: Position) {
      return findDocumentHighlights(document, position, visionxDocuments.get(document));
    },
    findDocumentLinks(document: TextDocument, documentContext: DocumentContext) {
      return findDocumentLinks(document, documentContext);
    },
    findDocumentSymbols(document: TextDocument) {
      return findDocumentSymbols(document, visionxDocuments.get(document));
    },
    format(document: TextDocument, range: Range, formattingOptions: FormattingOptions) {
      if (config.recore.format.defaultFormatter.html === 'none') {
        return [];
      }
      return htmlFormat(document, range, formattingOptions, config);
    },
    findDefinition(document: TextDocument, position: Position) {
      const components = scriptMode.findComponents(document);
      return findDefinition(document, position, visionxDocuments.get(document), components);
    },
    onDocumentRemoved(document: TextDocument) {
      visionxDocuments.onDocumentRemoved(document);
    },
    dispose() {
      visionxDocuments.dispose();
    }
  };
}
