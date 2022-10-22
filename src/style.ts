import * as vscode from "vscode";

import { ADVERBS, COMPLEX_WORDS, QUALIFYING_WORDS } from "./constants";

type Sentence = vscode.TextLine[];

export function findSentenceEnds(
  line: vscode.TextLine,
  offset: number
): vscode.Position[] {
  if (line.text.includes(".")) {
    const index = line.text.indexOf(".");
    const ends: vscode.Position[] = [];

    ends.push(new vscode.Position(line.lineNumber, offset + index));

    if (index === line.text.length - 1) {
      // The sentence is the whole line
      return ends;
    } else {
      // The next sentence starts on this line as well
      const rangeRest = new vscode.Range(
        new vscode.Position(line.lineNumber, offset + index + 1),
        new vscode.Position(line.lineNumber, offset + line.text.length)
      );

      const restOfLine: vscode.TextLine = {
        lineNumber: line.lineNumber,
        text: line.text.substring(index + 1),
        range: rangeRest,
        rangeIncludingLineBreak: rangeRest,
        firstNonWhitespaceCharacterIndex: 0,
        isEmptyOrWhitespace: false,
      };

      return [...ends, ...findSentenceEnds(restOfLine, index + 1)];
    }
  } else {
    return [];
  }
}

export function splitLineByPositions(
  line: vscode.TextLine,
  positions: vscode.Position[]
): vscode.TextLine[] {
  if (positions.length === 0) {
    return [line];
  } else {
    const splitPoint = positions[0].character;
    const firstRange = new vscode.Range(
      new vscode.Position(line.lineNumber, line.range.start.character),
      new vscode.Position(line.lineNumber, splitPoint)
    );
    const firstLine: vscode.TextLine = {
      lineNumber: line.lineNumber,
      text: line.text.substring(0, splitPoint),
      range: firstRange,
      rangeIncludingLineBreak: firstRange,
      firstNonWhitespaceCharacterIndex: 0,
      isEmptyOrWhitespace: false,
    };

    const remainingRange = new vscode.Range(
      new vscode.Position(line.lineNumber, splitPoint + 1),
      new vscode.Position(line.lineNumber, line.range.end.character)
    );
    const remainingLine: vscode.TextLine = {
      lineNumber: line.lineNumber,
      text: line.text.substring(splitPoint + 1),
      range: remainingRange,
      rangeIncludingLineBreak: remainingRange,
      firstNonWhitespaceCharacterIndex: 0,
      isEmptyOrWhitespace: false,
    };

    return [
      firstLine,
      ...splitLineByPositions(remainingLine, positions.slice(1)),
    ];
  }
}

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
