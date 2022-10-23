# Writing style checker

A VSCode extension that provides opinionated style checking for the English language. Heavily inspired by the [Hemingway editor](https://hemingwayapp.com/).

Use it on markdown files that go with code, for example repository READMEs. It will force you to write short, simple sentences in the active voice.
You'll end up with documentation that's easier to understand.

It checks for:

- Sentence complexity
- Passive voice
- Complex words
- Adverbs
- Qualifying words
- Conjunctions at the start of sentences

## Known issues

- Doesn't detect multi-word complex phrases that span multiple lines
- Doesn't ignore inline code
- Only ignores code blocks for sentence analysis

## To do

- Improve sentence end detection:

  - Count ':' then a new line starting a code block as a new sentence
  - Bulleted and numbered lists

- Refactor line level checks to use sentences
- Ignore markdown headings & links
- Add explanations for style rules to README

## Developing the extension

Pull requests are very welcome. Please include unit tests for any new features.

You can run the test suite at the command line:

```bash
npm test
```

Since this is a VSCode extension you can also run the tests with the built in debugger.

Go to 'Run and Debug' (⇧⌘D), select 'Extension Tests', set a breakpoint and press F5 to start the debugger.
