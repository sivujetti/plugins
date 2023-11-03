// cd SIVUJETTI_BACKEND_PATH . "plugins/JetGallery/frontend
// npm --prefix ../../../../ start -- --configInput backend/plugins/JetGallery/frontend/rollup.config.js

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang}) => [{
    input: 'backend/plugins/JetGallery/frontend/for-edit-app/main.js',
    output: {
        file: 'public/plugin-jet-gallery-edit-app-bundle.js',
    }
}, {
    input: `backend/plugins/JetGallery/frontend/for-edit-app/lang-${selectedLang}.js`,
    output: {
        file: `public/plugin-jet-gallery-edit-app-lang-${selectedLang}.js`,
    }
}, {
    input: 'backend/plugins/JetGallery/frontend/for-webpages/main.js',
    output: {
        file: 'public/plugin-jet-gallery-bundle.js',
        name: 'JetGallery',
    }
}];
