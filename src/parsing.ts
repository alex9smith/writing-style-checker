export type Sentence = vscode.TextLine[];
import * as vscode from "vscode";

export function findSentenceEnds(
  line: vscode.TextLine,
  offset: number
): vscode.Position[] {
  if (line && line.text.includes(".")) {
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
      text: line.text.substring(0, splitPoint + 1),
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

    if (remainingLine.text !== "") {
      return [
        firstLine,
        ...splitLineByPositions(remainingLine, positions.slice(1)),
      ];
    } else {
      return [firstLine];
    }
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

/**
 * Splits the document into sentences which are an array of `TextLine`s.
 * Sentences may span multiple lines and the first line of a sentence may
 * not start at character position 0. This function updates the `range` of
 * each `TextLine` to be correct.
 * @param doc text document to split into sentences
 */
export function getSentences(doc: vscode.TextDocument): Sentence[] {
  const sentences: Sentence[] = [];
  let currentSentence: Sentence = [];

  let inCodeBlock = false;

  for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
    let endSentenceAtEndOfLine = false;
    const line = doc.lineAt(lineIndex);
    if (line.text.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      // End the current sentence when a code block starts
      if (inCodeBlock && currentSentence.length !== 0) {
        sentences.push(currentSentence);
        currentSentence = [];
      }
    }
    if (inCodeBlock) {
      continue;
    }
    if (line.text.trim() === "") {
      // Treat an empty line as the end of a sentence
      sentences.push(currentSentence);
      currentSentence = [];
      continue;
    }
    if (line.text.match(/\s*?-\s/g)) {
      // This line is part of a bulleted list. Treat each line in the list
      // as a separate sentence
      if (currentSentence.length !== 0) {
        sentences.push(currentSentence);
      }
      sentences.push([line]);
      currentSentence = [];
      continue;
    }
    const ends = findSentenceEnds(line, 0);
    if (ends.length === 0) {
      // The sentence doesn't end on this line, so the line's still part of the current sentence
      currentSentence.push(line);
    } else {
      // The sentence does end on this line
      const lineSentences = splitLineByPositions(line, ends);
      if (lineSentences.length === 1) {
        // The sentence ends at the end of this line
        currentSentence.push(line);
        sentences.push(currentSentence);
        currentSentence = [];
        continue;
      }
      if (ends.length === 1) {
        // This line contains the end of one sentence and the start of the next.
        // Finish the current sentence and start a new one.
        currentSentence.push(lineSentences[0]);
        sentences.push(currentSentence);
        currentSentence = [];
        currentSentence.push(lineSentences[1]);
      } else {
        // This line contains the end of one sentence, at least one more complete
        // sentence and possibly the start of another.

        // Complete the current sentence and start a new one.
        const first = lineSentences.shift();
        if (first) {
          currentSentence.push(first);
        }
        sentences.push(currentSentence);
        currentSentence = [];

        if (findSentenceEnds(lineSentences.slice(-1)[0], 0).length === 0) {
          // The last sentence on this line carries on to the next line
          // Push all the complete sentences on the line to `sentences` and
          // start the next sentence.
          const last = lineSentences.pop();
          lineSentences.forEach((s) => {
            sentences.push([s]);
          });
          if (last) {
            currentSentence.push(last);
          }
        } else {
          // The last sentence on this line finishes at the end of this line
          // All items in `lineSentences` are complete sentences so save them all
          // to `sentences`.
          lineSentences.forEach((s) => {
            sentences.push([s]);
          });
        }
      }
    }
  }

  // Filter out any empty sentences
  return sentences
    .filter((s) => {
      return s.length !== 0;
    })
    .map((s) => {
      // Filter out any empty lines
      return s.filter((l) => {
        if (l) {
          return l.text.length !== 0;
        } else {
          return false;
        }
      });
    });
}
