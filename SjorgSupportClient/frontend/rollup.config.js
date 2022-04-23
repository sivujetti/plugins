// cd SIVUJETTI_BACKEND_PATH . "plugins/SjorgSupportClient/frontend
// npm --prefix ../../../../ start -- --configInput backend/plugins/SjorgSupportClient/frontend/rollup.config.js

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang}) => [{
    input: 'backend/plugins/SjorgSupportClient/frontend/for-edit-app/main.js',
    output: {
        file: 'public/plugin-sjorg-support-client-edit-app-bundle.js',
    }
}, {
    input: `backend/plugins/SjorgSupportClient/frontend/for-edit-app/lang-${selectedLang}.js`,
    output: {
        file: `public/plugin-sjorg-support-client-edit-app-lang-${selectedLang}.js`,
    }
}];
