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
        const sentFormBlockId = location.hash.startsWith('#contact-form-sent=')
            ? location.hash.split('=')[1]
            : '';
        Array.from(parentElement.querySelectorAll('.jet-form')).forEach(formEl => {
            const validator = new window.Pristine(formEl, {
                successClass: 'is-valid',
            });
            formEl.addEventListener('submit', e => {
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
    }
}

/**
 * @param {HTMLFormElement} formEl
 */
function showFormSentMessage(formEl) {
    const messageEl = document.createElement('div');
    messageEl.textContent = formEl.getAttribute('data-form-sent-message');
    formEl.parentElement.insertBefore(messageEl, formEl); // or formEl.replaceWith(messageEl)
    formEl.scrollIntoView(true);
}

export default JetForms;
