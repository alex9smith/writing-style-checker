import * as vscode from "vscode";

import { ADVERBS, COMPLEX_WORDS, QUALIFYING_WORDS } from "./constants";

export function getSuggestions(suggestions: string[]): string {
  if (suggestions.length === 1) {
    return `'${suggestions[0]}'`;
  } else {
    const last = suggestions.slice(-1)[0];
    const remaining = suggestions.slice(0, -1);
    return `'${remaining.join("', '")}' or '${last}'`;
  }
}

export function getRangeOfWord(
  line: vscode.TextLine,
  word: string
): vscode.Range {
  const index = line.text.indexOf(word);
  return new vscode.Range(
    new vscode.Position(line.lineNumber, index),
    new vscode.Position(line.lineNumber, index + word.length)
  );
}

export function getComplexWords(line: vscode.TextLine): vscode.Diagnostic[] {
  return Object.keys(COMPLEX_WORDS)
    .map((word) => {
      if (line.text.includes(word)) {
        const suggestions = COMPLEX_WORDS[word];
        return new vscode.Diagnostic(
          getRangeOfWord(line, word),
          `Complex. Omit or replace with ${getSuggestions(suggestions)}.`,
          vscode.DiagnosticSeverity.Information
        );
      }
    })
    .filter((e) => {
      return e !== undefined;
    }) as vscode.Diagnostic[];
}

export function getAdverbs(line: vscode.TextLine): vscode.Diagnostic[] {
  return Array.from(ADVERBS.values())
    .map((word) => {
      if (line.text.includes(word)) {
        return new vscode.Diagnostic(
          getRangeOfWord(line, word),
          "Adverb. Use a forceful verb instead.",
          vscode.DiagnosticSeverity.Information
        );
      }
    })
    .filter((e) => {
      return e !== undefined;
    }) as vscode.Diagnostic[];
}

export function getQualifyingWords(line: vscode.TextLine): vscode.Diagnostic[] {
  return Array.from(QUALIFYING_WORDS.values())
    .map((word) => {
      if (line.text.includes(word)) {
        return new vscode.Diagnostic(
          getRangeOfWord(line, word),
          "Qualifier. Be bold, don't hedge.",
          vscode.DiagnosticSeverity.Information
        );
      }
    })
    .filter((e) => {
      return e !== undefined;
    }) as vscode.Diagnostic[];
}
