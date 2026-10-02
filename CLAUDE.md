# Roni Helppi, personal website

## Coding standards
`CODING_STANDARDS.md` holds this repo's review rules. Check your diff against it before opening a PR; reviewers apply it to every diff.

When you get something wrong (the user corrects you, a check fails on code you wrote, or a review flags it), record the lesson in the same change:
- A judgement call a reviewer could spot in a diff → a rule in `CODING_STANDARDS.md`, in the format its header describes.
- A fixed pattern a tool could catch → propose a test, lint rule or hook to the user instead.
- A tooling or environment gotcha → `TESTING.md` (Local Gotchas) or the README beside the code.

## Interviews
Interview skills (grill-me, grilling, motion-brief) are answered by the user. When one is called for, ask the user to run it or ask the blocking questions yourself, then wait for the answers.

## Docs
- Lab demos (adding, recording, DialKit): `src/lab/README.md`
- Images and video in posts: `docs/post-media.md`

## Testing
Testing procedure and guidelines has been defined in the @TESTING.md file. Read it before running tests or modifying test code.

Key rules:
- When a test fails, **fix the implementation first** — only update the test if the behavior intentionally changed or the test is genuinely wrong.
- Follow **red/green testing** for new features: write the failing test first, then implement until it passes.
- Never silently weaken tests (lower thresholds, remove assertions) just to make them pass.
