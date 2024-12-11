// cd SIVUJETTI_BACKEND_PATH . "plugins/JetSliders/frontend
// # All bundles
// npm --prefix ../../../../ start -- --configInput backend/plugins/JetSliders/frontend/rollup.config.js
// # Just one
// npm --prefix ../../../../ start -- --configBundle for-preview-renderer --configInput backend/plugins/JetSliders/frontend/rollup.config.js

const bundleNames = ['for-edit-app', 'for-preview-renderer', 'for-webpages', 'lang'];

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang, bundles}) => {
    const bundlesExpanded = bundles[0] === 'all' ? bundleNames : bundles;
    return bundlesExpanded.map(bundleName => {
        if (bundleName === bundleNames[0])
            return {
                input: 'backend/plugins/JetSliders/frontend/for-edit-app/main.js',
                output: {
                    file: 'public/plugin-jet-sliders-edit-app-bundle.js',
                },
            };
        if (bundleName === bundleNames[1])
            return {
                input: 'backend/plugins/JetSliders/frontend/for-webpage-preview-renderer-app/main.js',
                output: {
                    file: 'public/plugin-jet-sliders-webpage-preview-renderer-app-bundle.js',
                },
            };
        if (bundleName === bundleNames[2])
            return {
                input: 'backend/plugins/JetSliders/frontend/for-webpages/main.js',
                output: {
                    file: 'public/plugin-jet-sliders-bundle.js',
                    name: 'JetSliders',
                },
            };
        if (bundleName === bundleNames[3])
            return {
                input: `backend/plugins/JetSliders/frontend/for-edit-app/lang-${selectedLang}.js`,
                output: {
                    file: `public/plugin-jet-sliders-edit-app-lang-${selectedLang}.js`,
                },
            };
        throw new Error(`Unknown bundle name "${bundleName}". Known: ${bundleNames.join(', ')}`);
    });
};
