// Only rules that enforce CODING_STANDARDS.md patterns; no presets.
export default {
  plugins: ['./lint/focus-visible-like-hover.js'],
  rules: {
    'site/focus-visible-like-hover': true,
    // Staggered items take their delay from an index (style="--i: 3"), so
    // items added later join the cascade (#119).
    'rule-selector-property-disallowed-list': [
      { '/:nth-/': ['animation-delay', 'transition-delay'] },
      { message: 'Compute stagger delays from an index (--i), not per :nth-child' },
    ],
  },
  overrides: [{ files: ['**/*.astro'], customSyntax: 'postcss-html' }],
};
