'use strict';
import * as vscode from 'vscode';
import UncheckedCodeActionProvider from './models/UncheckedCodeActionProvider';

export function activate(context: vscode.ExtensionContext) {
	let codeActionProvider = new UncheckedCodeActionProvider(context);
	context.subscriptions.push(codeActionProvider); 	
	
	codeActionProvider.activate();	
	codeActionProvider.collectActiveEditor();

}

export function deactivate() {
}