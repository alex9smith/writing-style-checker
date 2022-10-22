import * as assert from "assert";
import { Position, Range, TextLine } from "vscode";

import { getComplexWords, getSuggestions } from "../../style";

function getLine(text: string): TextLine {
  const range = new Range(new Position(0, 0), new Position(0, text.length));
  return {
    lineNumber: 0,
    text: text,
    range: range,
    rangeIncludingLineBreak: range,
    firstNonWhitespaceCharacterIndex: 0,
    isEmptyOrWhitespace: false,
  };
}

suite("style.ts", () => {
  suite("getSuggestions", () => {
    suite("when there is one suggestion", () => {
      test("returns the suggestion", () => {
        const suggestions = ["suggestion"];
        assert.equal(getSuggestions(suggestions), suggestions[0]);
      });
    });

    suite("when there are two suggestions", () => {
      test("separates them with 'or'", () => {
        const suggestions = ["suggestion1", "suggestion2"];
        assert.equal(getSuggestions(suggestions), "suggestion1 or suggestion2");
      });
    });

    suite("when there are more than two suggestions", () => {
      test("separates them with commas apart from the last one", () => {
        const suggestions = ["suggestion1", "suggestion2", "suggestion3"];
        assert.equal(
          getSuggestions(suggestions),
          "suggestion1, suggestion2 or suggestion3"
        );
      });
    });
  });

  suite("getComplexWords", () => {
    suite("when there are no complex words", () => {
      test("returns an empty array", () => {
        const line = getLine("hello there");
        const diagnostics = getComplexWords(line);
        assert.equal(diagnostics.length, 0);
      });
    });

    suite("when there is one complex word", () => {
      const line = getLine("here's a number of words");
      const diagnostics = getComplexWords(line);

      test("returns an array with one element", () => {
        assert.equal(diagnostics.length, 1);
      });

      test("includes a message", () => {
        assert(diagnostics[0].message.startsWith("Complex. Omit or replace"));
      });

      test("suggests replacements", () => {
        assert(diagnostics[0].message.includes("many or some"));
      });

      test("has the correct position", () => {
        assert.equal(diagnostics[0].range.start.character, 7);
        assert.equal(diagnostics[0].range.end.character, 18);
      });
    });

    suite("when there are two complex words", () => {
      const line = getLine(
        "a line with a number of words that at this time are too complex"
      );
      const diagnostics = getComplexWords(line);

      test("returns an array with two elements", () => {
        assert.equal(diagnostics.length, 2);
      });

      test("has correct positions for both", () => {
        assert.equal(diagnostics[0].range.start.character, 12);
        assert.equal(diagnostics[1].range.start.character, 35);
      });
    });
  });
});
