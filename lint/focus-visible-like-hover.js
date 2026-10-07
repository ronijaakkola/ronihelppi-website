// A :hover that changes colour, underline or background needs a :focus-visible
// (or, for a container, :focus-within) twin that sets the same properties, so
// keyboard users get the same feedback. The twin usually sits in the same
// selector list; a hover gated by @media (hover: hover) keeps it outside the gate.
import stylelint from 'stylelint';

const ruleName = 'site/focus-visible-like-hover';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (selector) =>
    `"${selector}" changes colour, underline or background, but no :focus-visible twin sets the same properties`,
});

const FEEDBACK = /^(color|background|text-decoration)|-color$/;
const TWINS = [':focus-visible', ':focus-within'];
const normalize = (selector) => selector.replace(/\s+/g, ' ').trim();
const feedbackProps = (rule) =>
  rule.nodes.filter((node) => node.type === 'decl' && FEEDBACK.test(node.prop)).map((decl) => decl.prop);

const ruleFunction = (enabled) => (root, result) => {
  if (!enabled) return;

  const rules = [];
  root.walkRules((rule) => rules.push(rule));

  // Feedback properties declared per selector, across the whole stylesheet.
  const declared = new Map();
  for (const rule of rules) {
    for (const selector of rule.selectors) {
      const props = declared.get(normalize(selector)) ?? new Set();
      feedbackProps(rule).forEach((prop) => props.add(prop));
      declared.set(normalize(selector), props);
    }
  }

  for (const rule of rules) {
    const props = feedbackProps(rule);
    if (props.length === 0) continue;
    for (const selector of rule.selectors) {
      if (!selector.includes(':hover')) continue;
      const hasTwin = TWINS.some((twin) => {
        const twinProps = declared.get(normalize(selector.replaceAll(':hover', twin)));
        return props.every((prop) => twinProps?.has(prop));
      });
      if (!hasTwin) {
        stylelint.utils.report({ ruleName, result, node: rule, message: messages.rejected(normalize(selector)) });
      }
    }
  }
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default stylelint.createPlugin(ruleName, ruleFunction);
