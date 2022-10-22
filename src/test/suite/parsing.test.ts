import * as assert from "assert";
import { Position } from "vscode";

import {
  getLine,
  SENTENCE_WITH_NO_ENDS,
  SENTENCE_WITH_ONE_END,
  SENTENCE_WITH_TWO_ENDS,
} from ".";

import {
  findSentenceEnds,
  getRangeOfWord,
  splitLineByPositions,
} from "../../parsing";

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
      const positions: Position[] = [];
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
});
