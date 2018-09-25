import {
  TextDocument,
  CompletionList,
  CompletionItem,
  SignatureHelp,
  DocumentHighlight,
  SymbolInformation,
  DocumentLink,
  Definition,
  Location,
  TextEdit,
  Hover,
  Range,
  DocumentSymbolParams,
  Position,
} from 'vscode-languageserver-types';
import {
  IConnection,
  TextDocumentPositionParams,
  DocumentLinkParams,
  DocumentFormattingParams,
  DidChangeConfigurationParams,
  FileChangeType
} from 'vscode-languageserver';
import Uri from 'vscode-uri';
import * as path from 'path';

import { getLanguageModes, LanguageModes } from '../modes/languageModes';
import { NULL_HOVER, NULL_COMPLETION, NULL_SIGNATURE } from '../modes/nullMode';
import { DocumentService } from './document';
import { DocumentContext } from '../types';

export class RLS {
  private documentService: DocumentService;

  private languageModes: LanguageModes;

  constructor(private workspacePath: string, private lspConnection: IConnection) {
    this.languageModes = getLanguageModes(workspacePath);

    this.documentService = new DocumentService();
    this.documentService.listen(lspConnection);

    this.setupConfigListeners();
    this.setupLanguageFeatures();
    this.setupFileChangeListeners();

    this.lspConnection.onShutdown(() => {
      this.dispose();
    });
  }

  private setupConfigListeners() {
    this.lspConnection.onDidChangeConfiguration(({ settings }: DidChangeConfigurationParams) => {
      this.configure(settings);
    });
  }

  private setupLanguageFeatures() {
    this.lspConnection.onCompletion(this.onCompletion.bind(this));
    this.lspConnection.onCompletionResolve(this.onCompletionResolve.bind(this));

    this.lspConnection.onDefinition(this.onDefinition.bind(this));
    this.lspConnection.onDocumentFormatting(this.onDocumentFormatting.bind(this));
    this.lspConnection.onDocumentHighlight(this.onDocumentHighlight.bind(this));
    this.lspConnection.onDocumentLinks(this.onDocumentLinks.bind(this));
    this.lspConnection.onDocumentSymbol(this.onDocumentSymbol.bind(this));
    this.lspConnection.onHover(this.onHover.bind(this));
    this.lspConnection.onReferences(this.onReferences.bind(this));
    this.lspConnection.onSignatureHelp(this.onSignatureHelp.bind(this));
  }

  private setupFileChangeListeners() {
    this.documentService.onDidClose(e => {
      this.removeDocument(e.document);
    });
    this.lspConnection.onDidChangeWatchedFiles(({ changes }) => {
      const jsMode = this.languageModes.getMode('javascript');
      changes.forEach(c => {
        if (c.type === FileChangeType.Changed) {
          const fsPath = Uri.parse(c.uri).fsPath;
          jsMode.onDocumentChanged!(fsPath);
        }
      });
    });
  }

  configure(config: any): void {
    this.languageModes.getAllModes().forEach(m => {
      if (m.configure) {
        m.configure(config);
      }
    });
  }

  onDocumentFormatting({ textDocument, options }: DocumentFormattingParams): TextEdit[] {
    const doc = this.documentService.getDocument(textDocument.uri);
    const fullDocRange = Range.create(Position.create(0, 0), doc.positionAt(doc.getText().length));

    const modeRanges = this.languageModes.getModesInRange(doc, fullDocRange);
    const allEdits: TextEdit[] = [];

    modeRanges.forEach(range => {
      if (range.mode && range.mode.format) {
        const edits = range.mode.format(doc, range, options);
        for (const edit of edits) {
          allEdits.push(edit);
        }
      }
    });

    return allEdits;
  }

  onCompletion({ textDocument, position }: TextDocumentPositionParams): CompletionList {
    const doc = this.documentService.getDocument(textDocument.uri);
    const mode = this.languageModes.getModeAtPosition(doc, position);
    if (mode && mode.doComplete) {
      return mode.doComplete(doc, position);
    }

    return NULL_COMPLETION;
  }

  onCompletionResolve(item: CompletionItem): CompletionItem {
    if (item.data) {
      const { uri, languageId } = item.data;
      if (uri && languageId) {
        const doc = this.documentService.getDocument(uri);
        const mode = this.languageModes.getMode(languageId);
        if (doc && mode && mode.doResolve) {
          return mode.doResolve(doc, item);
        }
      }
    }

    return item;
  }

  onHover({ textDocument, position }: TextDocumentPositionParams): Hover {
    const doc = this.documentService.getDocument(textDocument.uri);
    const mode = this.languageModes.getModeAtPosition(doc, position);
    if (mode && mode.doHover) {
      return mode.doHover(doc, position);
    }
    return NULL_HOVER;
  }

  onDocumentHighlight({ textDocument, position }: TextDocumentPositionParams): DocumentHighlight[] {
    const doc = this.documentService.getDocument(textDocument.uri);
    const mode = this.languageModes.getModeAtPosition(doc, position);
    if (mode && mode.findDocumentHighlight) {
      return mode.findDocumentHighlight(doc, position);
    }
    return [];
  }

  onDefinition({ textDocument, position }: TextDocumentPositionParams): Definition {
    const doc = this.documentService.getDocument(textDocument.uri);
    const mode = this.languageModes.getModeAtPosition(doc, position);
    if (mode && mode.findDefinition) {
      return mode.findDefinition(doc, position);
    }
    return [];
  }

  onReferences({ textDocument, position }: TextDocumentPositionParams): Location[] {
    const doc = this.documentService.getDocument(textDocument.uri);
    const mode = this.languageModes.getModeAtPosition(doc, position);
    if (mode && mode.findReferences) {
      return mode.findReferences(doc, position);
    }
    return [];
  }

  onDocumentLinks({ textDocument }: DocumentLinkParams): DocumentLink[] {
    const doc = this.documentService.getDocument(textDocument.uri);
    const documentContext: DocumentContext = {
      resolveReference: ref => {
        if (this.workspacePath && ref[0] === '/') {
          return Uri.file(path.resolve(this.workspacePath, ref)).toString();
        }
        const docUri = Uri.parse(doc.uri);
        return docUri
          .with({
            path: path.resolve(docUri.path, ref)
          })
          .toString();
      }
    };

    const links: DocumentLink[] = [];
    this.languageModes.getAllModesInDocument(doc).forEach(m => {
      if (m.findDocumentLinks) {
        pushAll(links, m.findDocumentLinks(doc, documentContext));
      }
    });
    return links;
  }

  onDocumentSymbol({ textDocument }: DocumentSymbolParams): SymbolInformation[] {
    const doc = this.documentService.getDocument(textDocument.uri);
    const symbols: SymbolInformation[] = [];

    this.languageModes.getAllModesInDocument(doc).forEach(m => {
      if (m.findDocumentSymbols) {
        pushAll(symbols, m.findDocumentSymbols(doc));
      }
    });
    return symbols;
  }

  onSignatureHelp({ textDocument, position }: TextDocumentPositionParams): SignatureHelp {
    const doc = this.documentService.getDocument(textDocument.uri);
    const mode = this.languageModes.getModeAtPosition(doc, position);
    if (mode && mode.doSignatureHelp) {
      return mode.doSignatureHelp(doc, position);
    }
    return NULL_SIGNATURE;
  }

  removeDocument(doc: TextDocument): void {
    this.languageModes.onDocumentRemoved(doc);
  }

  dispose(): void {
    this.languageModes.dispose();
  }
}

function pushAll<T>(to: T[], from: T[]) {
  if (from) {
    for (let i = 0; i < from.length; i++) {
      to.push(from[i]);
    }
  }
}
