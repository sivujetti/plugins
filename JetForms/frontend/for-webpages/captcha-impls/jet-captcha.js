import {env, http} from '@sivujetti-commons-for-web-pages';
const {JetForms} = window;

const formsUsingJetCaptcha = (JetForms.forms || [])
    .map(formCtrl => formCtrl.getEl())
    .filter(el => el.elements.captchaToUse?.value === 'jet-captcha');

formsUsingJetCaptcha.forEach(formEl => {
    let tokenFetched = false;
    const fetchInitialTokenAndRegisterImpl = () => {
        if (tokenFetched) return;
        fetchInitialToken().then(initialToken => {
            registerCaptchaImpl(initialToken);
        });
        tokenFetched = true;
    };
    formEl.addEventListener('mouseup', fetchInitialTokenAndRegisterImpl);
    formEl.addEventListener('touchend', fetchInitialTokenAndRegisterImpl);
});

function fetchInitialToken() {
    return http.post('/plugins/jet-forms/submit-tokens/generate')
        .then(resp =>
            resp.token || 'Unexpected response'
        )
        .catch(err => {
            env.window.console.error(err);
            return 'invalid-token';
        });
}

function registerCaptchaImpl(initialToken) {
    JetForms.registerCaptchaImpl('jet-captcha', {
        /**
         * @param {(token: string|null) => void} then
         */
        process(then) {
            then(initialToken);
        }
    });
}
