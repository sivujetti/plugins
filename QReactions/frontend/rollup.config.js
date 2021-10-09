// cd SIVUJETTI_BACKEND_PATH . "plugins/QReactions/frontend
// npm --prefix ../../../../ start -- --configInput backend/plugins/QReactions/frontend/rollup.config.js

module.exports = {
    input: 'backend/plugins/QReactions/frontend/main.js',
    output: {
        file: 'public/plugin-q-reactions.bundled.js',
    }
};
