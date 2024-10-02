// cd SIVUJETTI_BACKEND_PATH . "plugins/JetForms/frontend
// # All bundles
// npm --prefix ../../../../ start -- --configInput backend/plugins/JetForms/frontend/rollup.config.js
// # Just one
// npm --prefix ../../../../ start -- --configBundle for-preview-renderer --configInput backend/plugins/JetForms/frontend/rollup.config.js

const bundleNames = ['for-edit-app', 'for-preview-renderer', 'for-web-pages', 'lang'];

/**
 * @param {TranspileArgs} args
 */
module.exports = ({selectedLang, bundles}) => {
    const bundlesExpanded = bundles[0] === 'all' ? bundleNames : bundles;
    return bundlesExpanded.map(bundleName => {
        if (bundleName === bundleNames[0])
            return {
                input: 'backend/plugins/JetForms/frontend/for-edit-app/main.js',
                output: {
                    file: 'public/plugin-jet-forms-edit-app-bundle.js',
                },
            };
        if (bundleName === bundleNames[1])
            return {
                input: 'backend/plugins/JetForms/frontend/for-webpage-preview-renderer-app/main.js',
                output: {
                    file: 'public/plugin-jet-forms-webpage-preview-renderer-app-bundle.js',
                },
            };
        if (bundleName === bundleNames[2])
            return [{
                input: 'backend/plugins/JetForms/frontend/for-webpages/main.js',
                output: {
                    file: 'public/plugin-jet-forms-bundle.js',
                    name: 'JetForms',
                }
            }, {
                input: 'backend/plugins/JetForms/frontend/for-webpages/captcha-impls/jet-captcha.js',
                output: {
                    file: 'public/plugin-jet-forms-jet-captcha.js',
                }
            }, {
                input: 'backend/plugins/JetForms/frontend/for-webpages/captcha-impls/grecaptcha.js',
                output: {
                    file: 'public/plugin-jet-forms-grecaptcha.js',
                }
            }];
        if (bundleName === bundleNames[3])
            return {
                input: `backend/plugins/JetForms/frontend/for-edit-app/lang-${selectedLang}.js`,
                output: {
                    file: `public/plugin-jet-forms-edit-app-lang-${selectedLang}.js`,
                },
            };
        throw new Error(`Unknown bundle name "${bundleName}". Known: ${bundleNames.join(', ')}`);
    }).flat();
};
