// cd SIVUJETTI_BACKEND_PATH . "plugins/JetIcons/frontend
// npm --prefix ../../../../ start -- --configInput backend/plugins/JetIcons/frontend/rollup.config.js

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang}) => [{
    input: 'backend/plugins/JetIcons/frontend/for-edit-app/main.js',
    output: {
        file: 'public/plugin-jet-icons-edit-app-bundle.js',
    }
}, {
    input: `backend/plugins/JetIcons/frontend/for-edit-app/lang-${selectedLang}.js`,
    output: {
        file: `public/plugin-jet-icons-edit-app-lang-${selectedLang}.js`,
    }
}];
