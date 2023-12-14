// cd SIVUJETTI_BACKEND_PATH . "plugins/JetStaticExp/frontend
// npm --prefix ../../../../ start -- --configInput backend/plugins/JetStaticExp/frontend/rollup.config.js

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang}) => [{
    input: 'backend/plugins/JetStaticExp/frontend/for-edit-app/main.js',
    output: {
        file: 'public/plugin-jet-static-exp-edit-app-bundle.js',
    }
}, {
    input: `backend/plugins/JetStaticExp/frontend/for-edit-app/lang-${selectedLang}.js`,
    output: {
        file: `public/plugin-jet-static-exp-edit-app-lang-${selectedLang}.js`,
    }
}];
