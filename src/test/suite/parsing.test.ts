import * as assert from "assert";
import * as vscode from "vscode";

import {
  COMPLETE_SENTENCE,
  getLine,
  getLinesForDocument,
  SENTENCE_WITH_NO_ENDS,
  SENTENCE_WITH_ONE_END,
  SENTENCE_WITH_TWO_ENDS,
} from ".";

import {
  findSentenceEnds,
  getRangeOfWord,
  getSentences,
  splitLineByPositions,
} from "../../parsing";

function buildDocument(lines: vscode.TextLine[]): vscode.TextDocument {
  const document: vscode.TextDocument = {
    uri: vscode.Uri.parse("file://"),
    fileName: "",
    isUntitled: false,
    languageId: "",
    version: 0,
    isDirty: false,
    isClosed: false,
    save: function (): Thenable<boolean> {
      throw new Error("Function not implemented.");
    },
    eol: vscode.EndOfLine.LF,
    lineCount: lines.length,
    lineAt: function (line: number | vscode.Position): vscode.TextLine {
      if (typeof line === "number") {
        const thisLine = lines[line];
        return thisLine;
      } else {
        return lines[0];
      }
    },
    offsetAt: function (position: vscode.Position): number {
      throw new Error("Function not implemented.");
    },
    positionAt: function (offset: number): vscode.Position {
      throw new Error("Function not implemented.");
    },
    getText: function (range?: vscode.Range | undefined): string {
      throw new Error("Function not implemented.");
    },
    getWordRangeAtPosition: function (
      position: vscode.Position,
      regex?: RegExp | undefined
    ): vscode.Range | undefined {
      throw new Error("Function not implemented.");
    },
    validateRange: function (range: vscode.Range): vscode.Range {
      throw new Error("Function not implemented.");
    },
    validatePosition: function (position: vscode.Position): vscode.Position {
      throw new Error("Function not implemented.");
    },
  };
  return document;
}

suite("parsing.ts", () => {
  suite("findSentenceEnds", () => {
    suite("when there is no sentence end", () => {
      const line = getLine(SENTENCE_WITH_NO_ENDS);
      const ends = findSentenceEnds(line, 0);

      test("it returns an empty array", () => {
        assert.equal(ends.length, 0);
      });
    });

    suite("when there is one sentence end", () => {
      const line = getLine(SENTENCE_WITH_ONE_END);
      const ends = findSentenceEnds(line, 0);

      test("it returns an array with one end", () => {
        assert.equal(ends.length, 1);
      });

      test("it finds the end of the sentence", () => {
        assert.equal(ends[0].character, SENTENCE_WITH_ONE_END.indexOf("."));
      });
    });

    suite("when there is more than one sentence end", () => {
      const line = getLine(SENTENCE_WITH_TWO_ENDS);
      const ends = findSentenceEnds(line, 0);

      test("it finds all the ends", () => {
        assert.equal(ends.length, 2);
      });

      test("it finds the correct positions", () => {
        assert.equal(ends[0].character, SENTENCE_WITH_TWO_ENDS.indexOf("."));
        assert.equal(
          ends[1].character,
          SENTENCE_WITH_TWO_ENDS.indexOf(
            ".",
            SENTENCE_WITH_TWO_ENDS.indexOf(".") + 1
          )
        );
      });
    });
  });

  suite("splitLineByPosition", () => {
    suite("when positions is empty", () => {
      const positions: vscode.Position[] = [];
      const line = getLine(SENTENCE_WITH_NO_ENDS);
      const split = splitLineByPositions(line, positions);
      test("it returns the line unchanged", () => {
        assert.equal(split.length, 1);
        assert.equal(split[0], line);
      });
    });

    suite("when there is one position to split on", () => {
      const line = getLine(SENTENCE_WITH_ONE_END);
      const positions = findSentenceEnds(line, 0);
      const split = splitLineByPositions(line, positions);

      test("returns two lines", () => {
        assert.equal(split.length, 2);
      });

      test("the first line starts at character 0", () => {
        assert.equal(split[0].range.start.character, 0);
      });

      test("the second line starts in the correct place", () => {
        assert.equal(
          split[1].range.start.character,
          SENTENCE_WITH_ONE_END.indexOf(".") + 1
        );
      });

      test("the lines don't overlap", () => {
        assert(split[0].range.end.character < split[1].range.start.character);
      });
    });

    suite("when there is more than one position", () => {
      const line = getLine(SENTENCE_WITH_TWO_ENDS);
      const positions = findSentenceEnds(line, 0);
      const split = splitLineByPositions(line, positions);

      test("it returns the right number of lines", () => {
        assert.equal(split.length, 3);
      });

      test("none of the lines overlap", () => {
        assert(split[0].range.end.character < split[1].range.start.character);
        assert(split[1].range.end.character < split[2].range.start.character);
      });

      test("all the lines are the same line from the document", () => {
        assert(
          split.every((l) => {
            return l.lineNumber === line.lineNumber;
          })
        );
      });
    });
  });

  suite("getRangeOfWord", () => {
    const line = getLine("hello there");
    const range = getRangeOfWord(line, "there");

    test("keeps the line number", () => {
      assert.equal(range.start.line, line.lineNumber);
    });

    test("doesn't span multiple lines", () => {
      assert.equal(range.start.line, range.end.line);
    });

    test("finds the start of the word", () => {
      assert.equal(range.start.character, 6);
    });

    test("finds the end of the word", () => {
      assert.equal(range.end.character, 11);
    });
  });

  suite("getSentences", () => {
    suite("when each line is a complete sentence", () => {
      const lines = getLinesForDocument([
        getLine(COMPLETE_SENTENCE),
        getLine(COMPLETE_SENTENCE),
        getLine(COMPLETE_SENTENCE),
      ]);
      const document = buildDocument(lines);
      const sentences = getSentences(document);

      test("returns the same number of sentences as lines", () => {
        assert.equal(sentences.length, lines.length);
      });

      test("each sentence contains a single line", () => {
        const sentenceLineCounts = sentences.map((s) => {
          return s.length;
        });
        assert(
          sentenceLineCounts.every((c) => {
            return c === 1;
          })
        );
      });

      test("each sentence has a different line number", () => {
        const sentenceLineNumbers = sentences.flat().map((s) => {
          return s.lineNumber;
        });

        assert.equal(
          new Set(sentenceLineNumbers).size,
          sentenceLineNumbers.length
        );
      });
    });

    suite("when there are two sentences in a single line", () => {
      const lines = getLinesForDocument([
        getLine(COMPLETE_SENTENCE + COMPLETE_SENTENCE),
      ]);
      const document = buildDocument(lines);
      const sentences = getSentences(document);

      test("returns two sentences", () => {
        assert.equal(sentences.length, 2);
      });

      test("they have the same line number", () => {
        const sentenceLineNumbers = sentences.flat().map((s) => {
          return s.lineNumber;
        });
        assert.equal(new Set(sentenceLineNumbers).size, 1);
      });

      test("they don't overlap", () => {
        const first = sentences.flat()[0];
        const second = sentences.flat()[1];

        assert(first.range.end.character < second.range.start.character);
      });
    });

    suite("when a single sentence spans two lines", () => {
      const lines = getLinesForDocument([
        getLine(SENTENCE_WITH_NO_ENDS),
        getLine("the end of the sentence."),
      ]);
      const document = buildDocument(lines);
      const sentences = getSentences(document);

      test("returns one sentence", () => {
        assert.equal(sentences.length, 1);
      });

      test("the sentence has two lines", () => {
        assert.equal(sentences[0].length, 2);
      });

      suite("and another sentence starts on the same line", () => {
        const lines = getLinesForDocument([
          getLine(SENTENCE_WITH_NO_ENDS),
          getLine("the end of the sentence. And the start of another"),
          getLine("which finishes here."),
        ]);
        const document = buildDocument(lines);
        const sentences = getSentences(document);

        test("returns two sentences", () => {
          assert.equal(sentences.length, 2);
        });

        test("each sentence spans two different lines", () => {
          sentences.forEach((s) => {
            assert.equal(s.length, 2);
            assert(s[0].lineNumber !== s[1].lineNumber);
          });
        });
      });

      suite("when there is a code block in the document", () => {
        const lines = getLinesForDocument([
          getLine("This is a sentence."),
          getLine("```bash"),
          getLine("ls -la ."),
          getLine("```"),
          getLine("This is another sentence."),
        ]);
        const document = buildDocument(lines);
        const sentences = getSentences(document);

        test("doesn't include the code block in sentences", () => {
          assert.equal(sentences.length, 2);
        });
      });
    });
  });
});
