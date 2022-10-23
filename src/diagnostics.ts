import * as vscode from "vscode";
import { getSentences } from "./parsing";
import {
  getAdverbs,
  getComplexWords,
  getDifficultyWarning,
  getPassiveLanguage,
  getQualifyingWords,
} from "./style";

/**
 * Analyzes the text document for problems.
 * @param doc text document to analyze
 * @param collection diagnostic collection
 */
export function refreshDiagnostics(
  doc: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void {
  const diagnostics: vscode.Diagnostic[] = [];

  // Line-based analysis
  for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
    const line = doc.lineAt(lineIndex);
    diagnostics.push(
      ...getComplexWords(line),
      ...getAdverbs(line),
      ...getQualifyingWords(line)
    );
  }

  // Sentence-based analysis
  const sentences = getSentences(doc);
  sentences.forEach((sentence) => {
    diagnostics.push(
      ...getDifficultyWarning(sentence),
      ...getPassiveLanguage(sentence)
    );
  });

  collection.set(doc.uri, diagnostics);
}

export function subscribeToDocumentChanges(
  context: vscode.ExtensionContext,
  collection: vscode.DiagnosticCollection
): void {
  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(vscode.window.activeTextEditor.document, collection);
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refreshDiagnostics(editor.document, collection);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) =>
      refreshDiagnostics(e.document, collection)
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => collection.delete(doc.uri))
  );
}
