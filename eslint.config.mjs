// eslint-config-next v16 ships native flat configs; load them directly instead
// of via the legacy FlatCompat shim (which crashes loading these under recent ESLint).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'

// core-web-vitals registers the jsx-a11y plugin but enables only 6 of its rules (alt-text,
// aria-props, aria-proptypes, aria-unsupported-elements, role-has-required-aria-props,
// role-supports-aria-props). The rest of `recommended` — label-has-associated-control,
// click-events-have-key-events, anchor-is-valid, no-noninteractive-tabindex, … — was never running.
//
// The plugin object is already defined upstream, so this block only supplies rules; re-declaring
// `plugins` throws "Cannot redefine plugin". Pinned to an exact version because a minor bump can
// introduce new rules, which would turn CI red with no code change once severity is `error`.
//
// Severity stays `warn` while the Phase 1–3 backlog is cleared; Phase 4 flips this to 'error'.
const A11Y_SEVERITY = 'warn'

const isOff = (setting) => {
  const severity = Array.isArray(setting) ? setting[0] : setting
  return severity === 'off' || severity === 0
}

// `recommended` deliberately ships 3 of its 34 rules disabled: the deprecated `label-has-for`
// (superseded by `label-has-associated-control`), plus the noisy `control-has-associated-label`
// and `anchor-ambiguous-text`. Re-map severity only for rules the ruleset actually enables —
// mapping over Object.keys alone would switch those three on, and Phase 4 would then promote a
// deprecated rule to a merge blocker. Options tuples are preserved.
const a11yRules = Object.fromEntries(
  Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([rule, setting]) => {
    if (isOff(setting)) return [rule, setting]
    return [rule, Array.isArray(setting) ? [A11Y_SEVERITY, ...setting.slice(1)] : A11Y_SEVERITY]
  }),
)

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ['**/*.{jsx,tsx}'],
    rules: a11yRules,
  },
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Advisory react-hooks v7 rules; pre-existing occurrences are tracked for cleanup
      // in the component-decomposition tickets (WEB-414 etc.). Keep rules-of-hooks at error.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // Generated files — not linted (kept in their generator's native format).
    ignores: [
      '.next/',
      'node_modules/',
      '.vercel/',
      '.claude/',
      'src/payload-types.ts',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default eslintConfig
