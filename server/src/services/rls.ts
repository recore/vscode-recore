import {
  TextDocument,
  CompletionList,
  CompletionItem,
  TextEdit,
  Range,
  Position,
} from 'vscode-languageserver-types';
import {
  IConnection,
  TextDocumentPositionParams,
  DocumentFormattingParams,
  DidChangeConfigurationParams,
} from 'vscode-languageserver';
import { getVisionXModel, LanguageModel } from '../model';
import { DocumentService } from './document';
import { NULL_COMPLETION } from '../model/nullModel';

export class RLS {
  private documentService: DocumentService;

  private model: LanguageModel;

  constructor(private connection: IConnection) {
    this.model = getVisionXModel();

    this.documentService = new DocumentService();
    this.documentService.listen(connection);

    this.setupConfigListeners();
    this.setupLanguageFeatures();

    this.connection.onShutdown(() => {
      this.dispose();
    });
  }

  private setupConfigListeners() {
    this.connection.onDidChangeConfiguration(({ settings }: DidChangeConfigurationParams) => {
      this.configure(settings);
    });
  }

  private setupLanguageFeatures() {
    this.connection.onCompletion(this.onCompletion.bind(this));
    this.connection.onCompletionResolve(this.onCompletionResolve.bind(this));
    this.connection.onDocumentFormatting(this.onDocumentFormatting.bind(this));
  }

  configure(config: any): void {
    const model = this.model;
    if (model.configure) {
      model.configure(config);
    }
  }

  onDocumentFormatting({ textDocument, options }: DocumentFormattingParams): TextEdit[] {
    const doc = this.documentService.getDocument(textDocument.uri);
    const range = Range.create(Position.create(0, 0), doc.positionAt(doc.getText().length));

    const allEdits: TextEdit[] = [];
    const model = this.model;

    if (model && model.format) {
      const edits = model.format(doc, range, options);
      for (const edit of edits) {
        allEdits.push(edit);
      }
    }

    return allEdits;
  }

  onCompletion({ textDocument, position }: TextDocumentPositionParams): CompletionList {
    const doc = this.documentService.getDocument(textDocument.uri);
    const model = this.model;
    if (model && model.doComplete) {
      return model.doComplete(doc, position);
    }

    return NULL_COMPLETION;
  }

  onCompletionResolve(item: CompletionItem): CompletionItem {
    if (item.data) {
      const { uri, languageId } = item.data;
      if (uri && languageId) {
        const doc = this.documentService.getDocument(uri);
        const model = this.model;
        if (doc && model && model.doResolve) {
          return model.doResolve(doc, item);
        }
      }
    }

    return item;
  }

  removeDocument(doc: TextDocument): void {
    this.model.onDocumentRemoved(doc);
  }

  dispose(): void {
    this.model.dispose();
  }
}
