import * as vscode from "vscode";

import { COMPLEX_WORDS } from "./constants";

export function getSuggestions(suggestions: string[]): string {
  if (suggestions.length === 1) {
    return suggestions[0];
  } else {
    const last = suggestions.slice(-1)[0];
    const remaining = suggestions.slice(0, -1);
    return `${remaining.join(", ")} or ${last}`;
  }
}

export function getComplexWords(line: vscode.TextLine): vscode.Diagnostic[] {
  return Object.keys(COMPLEX_WORDS)
    .map((word) => {
      if (line.text.includes(word)) {
        const index = line.text.indexOf(word);
        const range = new vscode.Range(
          new vscode.Position(line.lineNumber, index),
          new vscode.Position(line.lineNumber, index + word.length)
        );
        const suggestions = COMPLEX_WORDS[word];
        return new vscode.Diagnostic(
          range,
          `Complex. Omit or replace with ${getSuggestions(suggestions)}`,
          vscode.DiagnosticSeverity.Information
        );
      }
    })
    .filter((e) => {
      return e !== undefined;
    }) as vscode.Diagnostic[];
}
