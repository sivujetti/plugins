let formsHooked = false;

/**
 * Makes form.jet-form elements alive.
 */
class JetForms {
    /**
     * @param {string} lang 'en', 'fi' etc.
     */
    constructor(lang) {
        if (lang === 'fi') {
            window.Pristine.addMessages('fi', {
                required: "Tämä kenttä on pakollinen",
                email: "Sähköposti ei kelpaa",
                number: "This field requires a number",
                integer: "This field requires an integer value",
                url: "This field requires a valid website URL",
                tel: "This field requires a valid telephone number",
                maxlength: "This fields length must be < ${1}",
                minlength: "This fields length must be > ${1}",
                min: "Minimum value for this field is ${1}",
                max: "Maximum value for this field is ${1}",
                pattern: "Please match the requested format",
                equals: "The two fields do not match",
            });
            window.Pristine.setLocale('fi');
        }
    }
    /**
     * @param {HTMLElement} parentElement
     * @returns {Array<{getEl: () => HTMLFormElement; setIsSubmitting: (isSubmitting: boolean) => void; setOnSubmit: (fn: (e: Event) => void) => void;}>}
     * @access public
     */
    hookAllForms(parentElement) {
        if (formsHooked) return;

        const captchaImpls = new Map;
        const out = {
            /** @type {Array<{getEl(): HTMLFormElement; setIsSubmitting(isSubmitting: boolean) void; setOnSubmit(fn: (e: Event) => void): void;}>} */
            forms: [],
            /**
             * @param {string} name
             * @param {{process(then: (token: string|null) => void): void;}} impl
             */
            registerCaptchaImpl(name, impl) { captchaImpls.set(name, impl); },
        };

        const formsEls = Array.from(parentElement.querySelectorAll('.jet-form'));
        if (!formsEls.length) return out;
        //
        const errorParentCls = 'form-group';
        const style = document.createElement('style');
        style.setAttribute('data-injected-by', 'JetForms');
        style.innerHTML = `.${errorParentCls} .form-input-hint { display: none; } .${errorParentCls}.blurred .form-input-hint { display: block; }`;
        document.head.appendChild(style);
        //
        out.forms = formsEls.map(formEl => {
            const state = {
                isSubmitting: false,
                onSubmitFn: null,
                submitBtn: formEl.querySelector('button[type="submit"]') || formEl.querySelector('button:not([type="button"])'),
            };

            const inputEls = Array.from(formEl.querySelectorAll('.form-input, .form-select, .form-checkbox > input, .form-radio > input'));
            const radioGroups = inputEls.reduce((groups, el) => {
                if (el.type === 'radio') { if (!groups[el.name]) groups[el.name] = []; groups[el.name].push(el); }
                return groups;
            }, {});

            //
            addClickHandlersThatRemovesValidationErrors(radioGroups);
            inputEls.forEach(el => {
                if (!el.parentElement.classList.contains(errorParentCls))
                    el.parentElement.classList.add(errorParentCls);
                el.addEventListener('blur', e => {
                    e.target.parentElement.classList.add('blurred');
                });
            });

            //
            const out = {
                getEl() { return formEl; },
                setIsSubmitting(isSubmitting) {
                    state.isSubmitting = isSubmitting;
                    if (isSubmitting) state.submitBtn?.setAttribute('disabled', true);
                    else state.submitBtn?.removeAttribute('disabled');
                },
                setOnSubmit(fn) { state.onSubmitFn = fn; },
            };
            const validator = new window.Pristine(formEl, {
                // class of the parent element where the error/success class is added
                classTo: errorParentCls,
                successClass: 'is-success',
                errorClass: 'is-error',
                // class of the parent element where error text element is appended
                errorTextParent: errorParentCls,
                // type of element to create for the error text
                errorTextTag: 'div',
                // class of the error text element
                errorTextClass: 'form-input-hint',
            });
            formEl.addEventListener('submit', e => {
                e.preventDefault();
                if (state.isSubmitting)
                    return;
                inputEls.forEach(el => {
                    el.parentElement.classList.add('blurred');
                });
                const isValid = validator.validate();
                if (!isValid) {
                    removeRadioErrorMessagesExceptTheLastOne(radioGroups);
                    return;
                }
                if (state.onSubmitFn)
                    state.onSubmitFn(e);
                out.setIsSubmitting(true);
                const captchaToUse = formEl.querySelector('input[name="captchaToUse"]')?.value || null;
                if (!captchaToUse) {
                    formEl.submit();
                    return;
                }
                const captcha = captchaImpls.get(captchaToUse);
                if (captcha) {
                    captcha.process(token => {
                        const inp = document.createElement('input');
                        inp.type = 'hidden';
                        inp.name = 'captchaClientResponseToken';
                        inp.value = token || 'invalid-token';
                        formEl.appendChild(inp);
                        formEl.submit();
                    });
                } else {
                    state.submitBtn.insertAdjacentHTML('beforebegin', '<div>Failed to access the captcha library.</div>');
                    out.setIsSubmitting(false);
                }
            });

            //
            return out;
        });
        //
        const submitdFormBlockId = location.hash.startsWith('#contact-form-sent=')
            ? location.hash.split('=')[1]
            : '';
        const submittedFormCtrl = submitdFormBlockId
            ? out.forms.find(ctrl => ctrl.getEl().getAttribute('data-form-id') === submitdFormBlockId)
            : null;
        if (submittedFormCtrl) {
            showFormSentMessage(submittedFormCtrl.getEl());
            history.replaceState(null, null, location.href.replace(`#contact-form-sent=${submitdFormBlockId}`, ''));
        }
        //
        formsHooked = true;
        return out;
    }
}

/**
 * @param {{[key: string]: Array<HTMLInputElement>;}} radioGroups
 */
function addClickHandlersThatRemovesValidationErrors(radioGroups) {
    for (const name in radioGroups) {
        if (!radioGroups[name][0].hasAttribute('data-pristine-required')) continue;

        let l = radioGroups[name].length - 1;
        while (l > -1) {
            const el = radioGroups[name][l--];
            el.setAttribute('data-pristine-required', '');
            el.addEventListener('click', () => {
                radioGroups[name].forEach(el2 => {
                    const label = el2.closest('.form-radio');
                    label.classList.remove('is-error');
                    const errEl = label.querySelector('.pristine-error');
                    if (errEl) errEl.parentElement.removeChild(errEl);
                });
            });
        }
    }
}

/**
 * @param {{[key: string]: Array<HTMLInputElement>;}} radioGroups
 */
function removeRadioErrorMessagesExceptTheLastOne(radioGroups) {
    for (const name in radioGroups) {
        let l = radioGroups[name].length - 2;
        while (l > -1) {
            const label = radioGroups[name][l--].closest('.form-radio');
            const errEl = label.querySelector('.pristine-error');
            if (errEl) errEl.parentElement.removeChild(errEl);
        }
    }
}

/**
 * @param {HTMLFormElement} formEl
 */
function showFormSentMessage(formEl) {
    const messageToShow = formEl.getAttribute('data-form-sent-message');
    if (!messageToShow) return;
    //
    const messageEl = document.createElement('div');
    messageEl.className = 'sent-message';
    messageEl.textContent = messageToShow;
    formEl.classList.add('sent-and-processed');
    formEl.insertBefore(messageEl, formEl.firstElementChild);
    messageEl.scrollIntoView(true);
}

export default JetForms;
