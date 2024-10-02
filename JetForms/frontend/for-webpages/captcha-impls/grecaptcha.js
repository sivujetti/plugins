const {JetForms} = window;

const formsUsingReCaptcha = (JetForms.forms || [])
    .map(formCtrl => formCtrl.getEl())
    .filter(el => el.elements.captchaToUse?.value === 'grecaptcha');

formsUsingReCaptcha.forEach(formEl => {
    let apiLoaded = false;
    const loadApiAndImpl = () => {
        if (apiLoaded) return;
        const siteKey = loadApiScript();
        registerCaptchaImpl(siteKey);
        apiLoaded = true;
    };
    formEl.addEventListener('mouseup', loadApiAndImpl);
    formEl.addEventListener('touchend', loadApiAndImpl);
});

function loadApiScript() {
    const thisScript = document.body.querySelector('script[src*="plugin-jet-forms-grecaptcha.js?site-key="]');
    const siteKey = (new URLSearchParams(thisScript.src.split('?')[1])).get('site-key');
    const el = document.createElement('script');
    el.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    document.body.appendChild(el);
}

function registerCaptchaImpl(siteKey) {
    JetForms.registerCaptchaImpl('grecaptcha', {
        /**
         * @param {(token: string|null) => void} then
         */
        process(then) {
            const {grecaptcha} = window; // ensure api.js has loaded
            if (!grecaptcha) { then(null); return; }

            grecaptcha.ready(() => {
                grecaptcha.execute(siteKey, {action: 'submit'}).then(then);
            });
        }
    });
}
