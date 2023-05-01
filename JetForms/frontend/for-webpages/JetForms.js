let formsHooked = false;

/**
 * Makes form.jet-form elements alive.
 */
class JetForms {
    /**
     * @param {String} lang 'en', 'fi' etc.
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
     * @returns {Array<{getEl: () => HTMLFormElement; setIsSubmitting: (isSubmitting: Boolean) => void; setOnSubmit: (fn: (e: Event) => void) => void;}>}
     * @access public
     */
    hookAllForms(parentElement) {
        if (formsHooked) return;
        const sentFormBlockId = location.hash.startsWith('#contact-form-sent=')
            ? location.hash.split('=')[1]
            : '';
        const forms = Array.from(parentElement.querySelectorAll('.jet-form'));
        if (!forms.length) return;
        //
        const errorParentCls = 'form-group';
        const style = document.createElement('style');
        style.setAttribute('data-injected-by', 'JetForms');
        style.innerHTML = `.${errorParentCls} .form-input-hint { display: none; } .${errorParentCls}.blurred .form-input-hint { display: block; }`;
        document.head.appendChild(style);
        //
        const out = forms.map(formEl => {
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
                if (state.isSubmitting) {
                    e.preventDefault();
                    return;
                }
                inputEls.forEach(el => {
                    el.parentElement.classList.add('blurred');
                });
                if (!validator.validate()) {
                    e.preventDefault();
                    removeRadioErrorMessagesExceptTheLastOne(radioGroups);
                    return;
                }
                if (state.onSubmitFn)
                    state.onSubmitFn(e);
                state.isSubmitting = true;
                if (state.submitBtn)
                    state.submitBtn.setAttribute('disabled', true);
            });

            //
            const formId = formEl.getAttribute('data-form-id');
            if (formId && formId === sentFormBlockId) {
                showFormSentMessage(formEl);
                history.replaceState(null, null, location.href.replace(`#contact-form-sent=${sentFormBlockId}`, ''));
            }

            //
            return {
                getEl() { return formEl; },
                setIsSubmitting(isSubmitting) {
                    state.isSubmitting = isSubmitting;
                    if (isSubmitting) state.submitBtn.setAttribute('disabled', true);
                    else state.submitBtn.removeAttribute('disabled');
                },
                setOnSubmit(fn) { state.onSubmitFn = fn; },
            };
        });
        formsHooked = true;
        return out;
    }
}

/**
 * @param {{[key: String]: Array<HTMLInputElement>;}} radioGroups
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
 * @param {{[key: String]: Array<HTMLInputElement>;}} radioGroups
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
    const messageEl = document.createElement('div');
    messageEl.className = 'sent-message';
    messageEl.textContent = formEl.getAttribute('data-form-sent-message');
    formEl.classList.add('sent-and-processed');
    formEl.insertBefore(messageEl, formEl.firstElementChild);
    messageEl.scrollIntoView(true);
}

export default JetForms;
