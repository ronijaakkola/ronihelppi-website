---
date: 2026-02-18
---
There is an old joke in programming that the two hardest problems are cache invalidation, naming things, and off-by-one errors. The joke is that it lists three problems despite claiming there are two.

Naming is genuinely difficult. Not because we lack vocabulary, but because a name is a commitment. It shapes how others — and your future self — will understand the intent behind a piece of code.

Consider this function:

```ts
function process(data: string[]): string[] {
  return data.filter((x) => x.length > 0);
}
```

It works. But what does it process? What is `data`? What is `x`? The name `process` is so generic it communicates nothing. You have to read the body to understand what's happening.

Compare it to this:

```ts filename="utils/strings.ts"
function removeEmptyStrings(strings: string[]): string[] {
  return strings.filter((s) => s.length > 0);
}
```

Same logic. The name now carries the intent. You can read a call site — `removeEmptyStrings(tags)` — and immediately understand what happens without jumping to the definition.

A good name is a form of documentation that cannot go stale. Comments can drift from the code they describe. Names travel with the code wherever it goes.

This is why renaming is one of the most valuable refactors you can do. When a function has grown into something that no longer matches its name, the mismatch is a small but constant source of friction — a tiny tax paid on every future read.

Design and naming share this quality. A button labeled "Submit" is honest. A button labeled "Continue" makes a promise about what happens next. The words you choose shape expectations, and broken expectations erode trust.
