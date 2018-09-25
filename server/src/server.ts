import {
  createConnection,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind
} from 'vscode-languageserver';
import { RLS } from './services/rls';

// Create a connection for the server
const connection =
  process.argv.length <= 2
    ? createConnection(process.stdin, process.stdout) // no arg specified
    : createConnection();

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize((params: InitializeParams): InitializeResult => {
  const initializationOptions = params.initializationOptions;

  const workspacePath = params.rootPath;
  if (!workspacePath) {
    console.error('No workspace path found. VSCode-Recore initialization failed');
    return {
      capabilities: { }
    };
  }

  console.log('Recore Language Initialized');
  const vls = new RLS(workspacePath, connection);

  if (initializationOptions) {
    vls.configure(initializationOptions.config);
  }

  const capabilities = {
    textDocumentSync: (TextDocumentSyncKind.Full as any),
    completionProvider: { resolveProvider: true, triggerCharacters: ['.', ':', '<', '"', '\'', '/', '@', '*'] },
    signatureHelpProvider: { triggerCharacters: ['('] },
    documentFormattingProvider: true,
    hoverProvider: true,
    documentHighlightProvider: true,
    documentLinkProvider: true,
    documentSymbolProvider: true,
    definitionProvider: true,
    referencesProvider: true,
  };

  return { capabilities: (capabilities as any) };
});

connection.listen();
