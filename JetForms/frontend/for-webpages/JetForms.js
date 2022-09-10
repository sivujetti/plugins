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
        forms.forEach(formEl => {
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
            const t = Array.from(formEl.querySelectorAll('.form-input, .form-select'));
            t.forEach(inputEl => {
                if (!inputEl.parentElement.classList.contains(errorParentCls))
                    inputEl.parentElement.classList.add(errorParentCls);
                inputEl.addEventListener('blur', e => {
                    e.target.parentElement.classList.add('blurred');
                });
            });
            formEl.addEventListener('submit', e => {
                t.forEach(inputEl => {
                    inputEl.parentElement.classList.add('blurred');
                });
                if (!validator.validate())
                    e.preventDefault();
            });
            //
            const formId = formEl.getAttribute('data-form-id');
            if (formId && formId === sentFormBlockId) {
                showFormSentMessage(formEl);
                history.replaceState(null, null, location.href.replace(`#contact-form-sent=${sentFormBlockId}`, ''));
            }
        });
        formsHooked = true;
    }
}

/**
 * @param {HTMLFormElement} formEl
 */
function showFormSentMessage(formEl) {
    const messageEl = document.createElement('div');
    messageEl.className = 'jetforms-form-sent-message';
    messageEl.textContent = formEl.getAttribute('data-form-sent-message');
    formEl.parentElement.insertBefore(messageEl, formEl); // or formEl.replaceWith(messageEl)
    formEl.scrollIntoView(true);
}

export default JetForms;
