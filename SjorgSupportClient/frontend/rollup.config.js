// cd SIVUJETTI_BACKEND_PATH . "plugins/SjorgSupportClient/frontend
// # All bundles
// npm --prefix ../../../../ start -- --configInput backend/plugins/SjorgSupportClient/frontend/rollup.config.js
// # Just one
// npm --prefix ../../../../ start -- --configBundle for-edit-app --configInput backend/plugins/SjorgSupportClient/frontend/rollup.config.js

const bundleNames = ['for-edit-app', 'lang'];

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang, bundles}) => {
    const bundlesExpanded = bundles[0] === 'all' ? bundleNames : bundles;
    return bundlesExpanded.map(bundleName => {
        if (bundleName === bundleNames[0])
            return {
                input: 'backend/plugins/SjorgSupportClient/frontend/for-edit-app/main.js',
                output: {
                    file: 'public/plugin-sjorg-support-client-edit-app-bundle.js',
                },
            };
        if (bundleName === bundleNames[1])
            return {
                input: `backend/plugins/SjorgSupportClient/frontend/for-edit-app/lang-${selectedLang}.js`,
                output: {
                    file: `public/plugin-sjorg-support-client-edit-app-lang-${selectedLang}.js`,
                },
            };
        throw new Error(`Unknown bundle name "${bundleName}". Known: ${bundleNames.join(', ')}`);
    });
};
