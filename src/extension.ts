// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { subscribeToDocumentChanges } from "./diagnostics";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('"writing-style-checker" is now active!');

  // Register the diagnostic analyser
  const collection =
    vscode.languages.createDiagnosticCollection("writing-style");
  context.subscriptions.push(collection);

  subscribeToDocumentChanges(context, collection);
}

// This method is called when your extension is deactivated
export function deactivate() {}
