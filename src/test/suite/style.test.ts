import * as assert from "assert";
import { getLine } from ".";
import {
  calculateSentenceScore,
  getAdverbs,
  getComplexWords,
  getQualifyingWords,
  getSuggestions,
} from "../../style";

const SIMPLE_SENTENCE = "This is a simple sentence";
const HARD_SENTENCE =
  "The extension highlights lengthy, complex sentences and common errors; if you see a hard sentence, shorten or split it.";
const VERY_HARD_SENTENCE =
  "If you see a very hard highlight, your sentence is so dense and complicated that your readers will get lost trying to follow its meandering, splitting logic — try editing this sentence to remove the highlight.";

suite("style.ts", () => {
  suite("getSuggestions", () => {
    suite("when there is one suggestion", () => {
      test("returns the suggestion", () => {
        const suggestions = ["suggestion"];
        assert.equal(getSuggestions(suggestions), "'suggestion'");
      });
    });

    suite("when there are two suggestions", () => {
      test("separates them with 'or'", () => {
        const suggestions = ["suggestion1", "suggestion2"];
        assert.equal(
          getSuggestions(suggestions),
          "'suggestion1' or 'suggestion2'"
        );
      });
    });

    suite("when there are more than two suggestions", () => {
      test("separates them with commas apart from the last one", () => {
        const suggestions = ["suggestion1", "suggestion2", "suggestion3"];
        assert.equal(
          getSuggestions(suggestions),
          "'suggestion1', 'suggestion2' or 'suggestion3'"
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
        assert(diagnostics[0].message.includes("'many' or 'some'"));
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

  suite("getAdverbs", () => {
    suite("when there are no adverbs", () => {
      test("returns an empty array", () => {
        assert.equal(getAdverbs(getLine("hello there")).length, 0);
      });
    });
    suite("when there is one adverb", () => {
      const line = getLine("line with the adverb unfortunately");
      const diagnostics = getAdverbs(line);

      test("returns an array with one element", () => {
        assert.equal(diagnostics.length, 1);
      });

      test("includes a message", () => {
        assert.equal(
          diagnostics[0].message,
          "Adverb. Use a forceful verb instead."
        );
      });

      test("has the correct position", () => {
        assert.equal(diagnostics[0].range.start.character, 21);
        assert.equal(diagnostics[0].range.end.character, 34);
      });
    });
  });

  suite("getQualifyingWords", () => {
    suite("when there are no qualifying words", () => {
      test("returns an empty array", () => {
        assert.equal(getQualifyingWords(getLine("hello there")).length, 0);
      });
    });
    suite("when there is one qualifying word", () => {
      const line = getLine("line with the qualifier perhaps");
      const diagnostics = getQualifyingWords(line);

      test("returns an array with one element", () => {
        assert.equal(diagnostics.length, 1);
      });

      test("includes a message", () => {
        assert.equal(
          diagnostics[0].message,
          "Qualifier. Be bold, don't hedge."
        );
      });

      test("has the correct position", () => {
        assert.equal(diagnostics[0].range.start.character, 24);
        assert.equal(diagnostics[0].range.end.character, 31);
      });
    });
  });

  suite("calculateSentenceScore", () => {
    test("scores an empty sentence 0", () => {
      assert.equal(calculateSentenceScore([getLine("")]), 0);
    });

    test("scores a simple sentence below 10", () => {
      assert(calculateSentenceScore([getLine(SIMPLE_SENTENCE)]) < 10);
    });

    test("scores a hard sentence above 10 and less than or equal to 14", () => {
      const score = calculateSentenceScore([getLine(HARD_SENTENCE)]);
      assert(10 < score);
      assert(score <= 14);
    });

    test("scores a very hard sentence above 14", () => {
      const score = calculateSentenceScore([getLine(VERY_HARD_SENTENCE)]);
      assert(14 < score);
    });
  });
});
