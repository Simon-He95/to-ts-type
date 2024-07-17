// @ts-check
const simon_he = require('@antfu/eslint-config').default

module.exports = simon_he({
  rules: {
    'no-new-func': 'off',
    'no-restricted-syntax': 'off',
  },
})
