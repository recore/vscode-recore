'use strict';
import { workspace, ExtensionContext } from 'vscode';
import { TagManager } from './autoTag/tagManager';
import * as path from 'path';
import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
	RevealOutputChannelOn
} from 'vscode-languageclient';
import generateTemplate from './templateGenerator';
// import emitSurvey from './survey';
// import surveyPolicy from './survey/policy';


let client: LanguageClient;

export function activate(context: ExtensionContext) {

	const config = workspace.getConfiguration();

	config.update('emmet.includeLanguages', {'visionx': 'html'}, true);

	// 标签自动闭合、重命名
	const tagManager = new TagManager();
	tagManager.run();

	/**
	 * 初始化语言服务器
	 */
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: ['visionx'],
		synchronize: {
			configurationSection: ['recore', 'emmet'],
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		initializationOptions: {
			config
		},
		revealOutputChannelOn: RevealOutputChannelOn.Never
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'recore',
		'Recore Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	const disposerRlC = client.start();
	const disposerCreate = vscode.commands.registerCommand('recore.createPageOrComp', generateTemplate());
	// 发起问卷
	// surveyPolicy(emitSurvey);
	// // 绑定访问调查快捷键
	// const disposerSurvey = vscode.commands.registerCommand('recore.survey', emitSurvey);
	context.subscriptions.push(disposerRlC, disposerCreate);
}

export function deactivate(): Thenable<void> {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
