// i18next-scanner.config.js
module.exports = {
    input: [
      'src/**/*.{js,jsx,ts,tsx}',
      // 테스트 파일 제외
      '!src/**/*.test.{js,jsx,ts,tsx}',
      '!src/**/*.spec.{js,jsx,ts,tsx}',
      '!**/node_modules/**',
    ],
    output: './public/locales',
    options: {
      debug: true,
      removeUnusedKeys: false,
      sort: true,
      func: {
        list: ['t', 'i18next.t', 'i18n.t'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      trans: {
        component: 'Trans',
        i18nKey: 'i18nKey',
        defaultsKey: 'defaults',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      lngs: ['en'],
      ns: ['translation'],
      defaultLng: 'en',
      defaultNs: 'translation',
      defaultValue: (lng, ns, key) => key,
      resource: {
        loadPath: 'public/locales/{{lng}}/{{ns}}.json',
        savePath: 'public/locales/{{lng}}/{{ns}}.json',
        jsonIndent: 2,
        lineEnding: '\n'
      },
      context: false,
      keySeparator: '.',
      nsSeparator: ':',
      pluralSeparator: '_',
      contextSeparator: '_',
    }
  };