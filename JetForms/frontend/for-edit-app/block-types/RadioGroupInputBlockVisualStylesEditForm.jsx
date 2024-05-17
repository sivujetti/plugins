import {
    BlockVisualStylesEditForm,
    createPaddingVarDefs,
} from '@sivujetti-commons-for-edit-app';
import {createFocusOutlineCodeTemplate} from './common/style-forms-utils.js';

const innerScope = '.form-radio';

/** @type {Array<VisualStylesFormVarDefinition>} */
const cssVarDefs = [
    {
        varName: 'fontSize',
        cssProp: 'font-size',
        cssSubSelector: innerScope,
        widgetSettings: {
            valueType: 'length',
            label: 'Font size',
            inputId: 'jetFormsRadioGroupInputFontSize',
            defaultThemeValue: '0.9rem',
        },
    },
    {
        varName: 'optionsTextColor',
        cssProp: 'color',
        cssSubSelector: innerScope,
        widgetSettings: {
            valueType: 'color',
            label: 'Text options',
            inputId: 'jetFormsRadioGroupInputOptionsTextColor',
        },
    },
    {
        varName: 'textColor',
        cssProp: 'color',
        cssSubSelector: null,
        widgetSettings: {
            valueType: 'color',
            label: 'Text',
            inputId: 'jetFormsRadioGroupInputTextColor',
        },
    },
    {
        varName: 'checkedColor',
        cssProp: 'background',
        cssSubSelector: `${innerScope} input:checked+.form-icon`,
        widgetSettings: {
            valueType: 'color',
            label: 'Checked',
            inputId: 'jetFormsRadioGroupInputCheckedColor',
        },
    },
    {
        varName: 'outlineFocusColor',
        cssProp: 'box-shadow',
        cssSubSelector: `${innerScope} input:focus+.form-icon`,
        widgetSettings: {
            valueType: 'color',
            label: 'Outline focus',
            inputId: 'jetFormsRadioGroupInputOutlineFocusColor',
        },
    },
    {
        varName: 'errorTextColor',
        cssProp: 'color',
        cssSubSelector: '.pristine-error',
        widgetSettings: {
            valueType: 'color',
            label: 'Error text',
            inputId: 'jetFormsRadioGroupInputErrorTextColor',
        },
    },
    ...createPaddingVarDefs(),
];

class RadioGroupInputBlockVisualStylesEditForm extends BlockVisualStylesEditForm {
    /**
     * @inheritdoc
     */
    createCssVarDefinitions() {
        return cssVarDefs;
    }
    /**
     * @inheritdoc
     */
    createVarInputToScssCodeFn(cssVarDefs) {
        const stock = super.createVarInputToScssCodeFn(cssVarDefs);
        /**
         * @param {String} varName
         * @param {String} val
         * @returns {scssCodeInput}
         */
        return (varName, val) => {
            if (varName === 'checkedColor') {
                const def = cssVarDefs.find(d => d.varName === varName);
                return [
                    `${def.cssSubSelector} {`,
                    '  border-color: %s;',
                    '  background: %s;',
                    '}',
                ];
            }
            if (varName === 'outlineFocusColor') {
                return createFocusOutlineCodeTemplate(cssVarDefs.find(d => d.varName === varName));
            }
            return stock(varName, val);
        };
    }
}

export default RadioGroupInputBlockVisualStylesEditForm;
