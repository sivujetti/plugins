/*
This file is transpiled into 'public/plugin-jet-forms-webpage-preview-renderer-app-bundle.js'.
*/

import {api} from '@sivujetti-webpage-preview-renderer-app';
import AbstractInputBlockRenderer from './AbstractInputBlockRenderer.jsx';
import CheckboxInputBlockRenderer from './CheckboxInputBlockRenderer.jsx';
import ContactFormBlockRenderer from './ContactFormBlockRenderer.jsx';
import RadioGroupInputBlockRenderer from './RadioGroupInputBlockRenderer.jsx';
import SelectInputBlockRenderer from './SelectInputBlockRenderer.jsx';

api.registerRenderer('JetFormsCheckboxInput', CheckboxInputBlockRenderer);
api.registerRenderer('JetFormsContactForm', ContactFormBlockRenderer);
api.registerRenderer('JetFormsEmailInput', class EmailBlockBlockRenderer extends AbstractInputBlockRenderer {
    getSettings() { return {inputType: 'email'}; }
});
api.registerRenderer('JetFormsNumberInput', class NumberBlockBlockRenderer extends AbstractInputBlockRenderer {
    getSettings() { return {inputType: 'text', inputMode: 'numeric'}; }
});
api.registerRenderer('JetFormsRadioGroupInput', RadioGroupInputBlockRenderer);
api.registerRenderer('JetFormsSelectInput', SelectInputBlockRenderer);
api.registerRenderer('JetFormsTextInput', class TextBlockBlockRenderer extends AbstractInputBlockRenderer {
    getSettings() { return {inputType: 'text'}; }
});
api.registerRenderer('JetFormsTextareaInput', class TextareaBlockBlockRenderer extends AbstractInputBlockRenderer {
    getSettings() { return {inputType: 'textarea'}; }
});
