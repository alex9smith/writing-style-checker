import * as vscode from "vscode";

import { getRangeOfWord, Sentence } from "./parsing";
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

export function calculateSentenceScore(sentence: Sentence): number {
  const sentenceText = sentence
    .map((l) => {
      return l.text;
    })
    .join(" ");
  const cleanText = sentenceText.replace(/[^a-z0-9. ]/gi, "") + ".";
  const wordCount = cleanText.split(" ").length;
  const letterCount = cleanText.split(" ").join("").length;

  if (wordCount === 0 || letterCount === 0) {
    return 0;
  } else {
    const score = Math.round(
      4.71 * (letterCount / wordCount) + 0.5 * wordCount - 21.43
    );
    return Math.max(0, score);
  }
}

export function getDifficultyWarning(sentence: Sentence): vscode.Diagnostic[] {
  const score = calculateSentenceScore(sentence);
  if (score <= 10) {
    return [];
  } else {
    const firstLine = sentence[0];
    const lastLine = sentence.slice(-1)[0];
    const sentenceRange = new vscode.Range(
      new vscode.Position(
        firstLine.lineNumber,
        firstLine.range.start.character
      ),
      new vscode.Position(lastLine.lineNumber, lastLine.range.end.character)
    );

    if (10 < score && score <= 14) {
      return [
        new vscode.Diagnostic(
          sentenceRange,
          "Hard sentence. Shorten or split it.",
          vscode.DiagnosticSeverity.Information
        ),
      ];
    } else {
      return [
        new vscode.Diagnostic(
          sentenceRange,
          "Very hard sentence. Shorten or split it.",
          vscode.DiagnosticSeverity.Warning
        ),
      ];
    }
  }
}
