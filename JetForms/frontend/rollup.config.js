// cd SIVUJETTI_BACKEND_PATH . "plugins/JetForms/frontend
// npm --prefix ../../../../ start -- --configInput backend/plugins/JetForms/frontend/rollup.config.js

module.exports = [{
    input: 'backend/plugins/JetForms/frontend/for-edit-app/main.js',
    output: {
        file: 'public/plugin-jet-forms-edit-app-bundle.js',
    }
}, {
    input: 'backend/plugins/JetForms/frontend/for-webpages/main.js',
    output: {
        file: 'public/plugin-jet-forms-bundle.js',
    }
}];
