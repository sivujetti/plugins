import {BlockVisualStylesEditForm} from '@sivujetti-commons-for-edit-app';

/** @type {Array<VisualStylesFormVarDefinition>} */
const cssVarDefs = [
    {
        varName: 'jetFormsContactFormRowsGapY',
        cssProp: 'margin-bottom',
        cssSubSelector: '[class^="j-JetForms"]',
        widgetSettings: {
            valueType: 'length',
            label: 'Gap ↕',
            inputId: 'jetFormsContactFormRowsGapY',
            defaultThemeValue: '0.4rem',
        },
    },
];

class ContactFormBlockVisualStylesEditForm extends BlockVisualStylesEditForm {
    /**
     * @inheritdoc
     */
    createCssVarDefinitions() {
        return cssVarDefs;
    }
}

export default ContactFormBlockVisualStylesEditForm;
