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
import * as vscode from "vscode";

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
