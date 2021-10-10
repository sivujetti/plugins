// cd SIVUJETTI_BACKEND_PATH . "plugins/QReactions/frontend
// npm --prefix ../../../../ start -- --configInput backend/plugins/QReactions/frontend/rollup.config.js

module.exports = [{
    input: 'backend/plugins/QReactions/frontend/for-edit-app/main.js',
    output: {
        file: 'public/plugin-q-reactions-edit-app-bundle.js',
    }
}, {
    input: 'backend/plugins/QReactions/frontend/for-webpages/main.js',
    output: {
        file: 'public/plugin-q-reactions-bundle.js',
    }
}];
