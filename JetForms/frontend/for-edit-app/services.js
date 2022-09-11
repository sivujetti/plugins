import {api} from '@sivujetti-commons-for-edit-app';

const services = {
    idGen: createCountingIdGenerator(api.webPageIframe),
};

/**
 * @param {WebPageIframe} webPage
 */
function createCountingIdGenerator(webPage) {
    return {
        /**
         * @returns {String} Example: "input_3"
         */
        getNextId() {
            const previousInputs = Array.from(webPage.getEl().contentDocument.querySelectorAll('[name^="input_"]'));
            const max = previousInputs.reduce((max, inputEl) => {
                const asStr = inputEl.getAttribute('name').split('input_')[1];
                const asInt = parseInt(asStr, 10);
                return !isNaN(asInt) && asInt > max ? asInt : max;
            }, 0);
            return `input_${max + 1}`;
        }
    };
}

export default services;
