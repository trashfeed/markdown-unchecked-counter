'use strict';
import * as vscode from 'vscode';
export default class Todo implements vscode.CodeActionProvider, vscode.Disposable {

    private diagnostics: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnostics = vscode.languages.createDiagnosticCollection('todo-uncheckd-count');
    }

    public provideCodeActions(document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken) {
        return undefined;
    }
    
    activate() {

        // trigger
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this.collectActiveEditor, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this.onChangeActiveTextEditor, this, subscriptions);
 
        // setup codeaction provider
        vscode.languages.registerCodeActionsProvider("markdown", this);

    }

    dispose() {
    }

    collectActiveEditor() {
        if (vscode.window.activeTextEditor === undefined) {
            return;
        }
        let document: vscode.TextDocument = vscode.window.activeTextEditor.document;
        this.collect(document);
    }

    private collect(document: vscode.TextDocument) {
        this.buildDiagnostics(document);
    }

    private getLineBreakLength(line: string): number {

        if (/\r\n/.test(line)) {
            return 2;
        } else if (/\r?\n/.test(line)) {
            return 1;
        }
        return 0;
 
    }

    private documentVersion: number = 0;

    private buildDiagnostics(document: vscode.TextDocument) {

        const UNCHECKD_CHAR:string = "- [ ] ";
        let diagnostics: vscode.Diagnostic[] = [];
        let documentLength: number = 0;

        // diff
        if (document.version === this.documentVersion) {
            return;
        }
        this.documentVersion = document.version;

        // lines
        let lineBreakSize:number = this.getLineBreakLength(document.getText());
        let lines: string[] = document.getText().replace(/\r?\n/g, "\n").split("\n");

        for (var key in lines) {            

            // line
            let line: string = lines[key];
            // documentLength += line.length + lineBreakSize;
            documentLength += line.length;

            // last row
            if (Number.parseInt(key) !== lines.length
            || lines.length === 1) {
                documentLength += lineBreakSize;
            }            

            // seekSize
            let seekSize = 2 - lineBreakSize;

            // validation
			if (line.length < 1) {
				continue;
			}
            let seekPosition = line.indexOf(UNCHECKD_CHAR);
            if (seekPosition < 0) {
                continue;
            }

            //  range
            let basePosition:number = seekPosition + (documentLength - line.length) + seekSize;
            let startPosition = document.positionAt(basePosition);
            let endPosition = document.positionAt(basePosition + (UNCHECKD_CHAR.length - 3));
            let range = new vscode.Range(startPosition, endPosition);

            // content
            let content: string = line.substr(seekPosition + UNCHECKD_CHAR.length);
            if (content.length === 0) {
                content = "-";
            }

            // creates diagnostic
            let diagnostic = new vscode.Diagnostic(range, content, vscode.DiagnosticSeverity.Warning);
            diagnostics.push(diagnostic);            

		}

        // set diagnostics
        this.diagnostics.set(document.uri, diagnostics);
    }
    
    private onChangeActiveTextEditor(arg: vscode.TextEditor | undefined) {
        if (arg === undefined) {
            return;
        }
        this.collect(arg.document);
    }
  
}