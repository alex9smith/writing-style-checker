import * as path from "path";
import * as Mocha from "mocha";
import * as glob from "glob";
import { Range, Position, TextLine } from "vscode";

export function getLine(text: string): TextLine {
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

export const SENTENCE_WITH_NO_ENDS =
  "this is a line without a sentence end in it";
export const SENTENCE_WITH_ONE_END =
  "this is a line. It has a sentence end in it";
export const SENTENCE_WITH_TWO_ENDS =
  "this is a line. It has a sentence end in it. It also has another";
export const COMPLETE_SENTENCE = "This is a complete sentence.";

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((c, e) => {
    glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}
