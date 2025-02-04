// cd SIVUJETTI_BACKEND_PATH . "plugins/QKanboard/frontend
// # All bundles
// npm --prefix ../../../../ start -- --configInput backend/plugins/QKanboard/frontend/rollup.config.js
// # Just one
// npm --prefix ../../../../ start -- --configBundle for-preview-renderer --configInput backend/plugins/QKanboard/frontend/rollup.config.js

const bundleNames = ['for-edit-app', 'for-preview-renderer', 'lang'];

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang, bundles}) => {
    const bundlesExpanded = bundles[0] === 'all' ? bundleNames : bundles;
    return bundlesExpanded.map(bundleName => {
        if (bundleName === bundleNames[0])
            return {
                input: 'backend/plugins/QKanboard/frontend/for-edit-app/main.js',
                output: {
                    file: 'public/plugin-q-kanboard-edit-app-bundle.js',
                },
            };
        if (bundleName === bundleNames[1])
            return {
                input: 'backend/plugins/QKanboard/frontend/for-webpage-preview-renderer-app/main.js',
                output: {
                    file: 'public/plugin-q-kanboard-webpage-preview-renderer-app-bundle.js',
                },
            };
        if (bundleName === bundleNames[2])
            return {
                input: `backend/plugins/QKanboard/frontend/for-edit-app/lang-${selectedLang}.js`,
                output: {
                    file: `public/plugin-q-kanboard-edit-app-lang-${selectedLang}.js`,
                },
            };
        throw new Error(`Unknown bundle name "${bundleName}". Known: ${bundleNames.join(', ')}`);
    });
};
