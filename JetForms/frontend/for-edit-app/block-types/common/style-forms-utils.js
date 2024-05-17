import {BlockVisualStylesEditForm} from '@sivujetti-commons-for-edit-app';

/**
 * @param {keyof innerScopes} inputNameId
 * @returns {Array<VisualStylesFormVarDefinition>}
 */
function createVisualEditFormAuto(inputNameId) {
    /** @type {Array<VisualStylesFormVarDefinition>} */
    const cssVarDefs = [
        ...createCommonVarDefs(inputNameId),
    ];
    return class extends BlockVisualStylesEditForm {
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
                if (varName === 'paddingY') {
                    const def = cssVarDefs.find(d => d.varName === varName);
                    return [
                        `${def.cssSubSelector} {`,
                        `  padding-top: %s;`,
                        `  padding-bottom: %s;`,
                        `}`,
                    ];
                }
                if (varName === 'paddingX') {
                    const def = cssVarDefs.find(d => d.varName === varName);
                    return [
                        `${def.cssSubSelector} {`,
                        `  padding-left: %s;`,
                        `  padding-right: %s;`,
                        `}`,
                    ];
                }
                if (varName === 'outlineFocusColor') {
                    return createFocusOutlineCodeTemplate(cssVarDefs.find(d => d.varName === varName));
                }
                return stock(varName, val);
            };
        }
    };
}

/**
 * @param {VisualStylesFormVarDefinition} varDef
 * @returns {scssCodeInput}
 */
function createFocusOutlineCodeTemplate(varDef) {
    return [
        `${varDef.cssSubSelector} {`,
        `  box-shadow: 0 0 0 0.1rem %s;`,
        `}`,
    ];
}

const innerScopes = {
    'EmailInput': 'input',
    'NumberInput': 'input',
    'SelectInput': 'select',
    'TextInput': 'input',
    'TextareaInput': 'textarea',
};

/**
 * @param {keyof innerScopes} inputNameId
 * @returns {Array<VisualStylesFormVarDefinition>}
 */
function createCommonVarDefs(inputNameId) {
    const innerScope = innerScopes[inputNameId];
    if (!innerScope)
        throw new Error(['Unknown inputNameId "', inputNameId, '". Supported values: "',
                        Object.keys(innerScopes).join('", "'), '"'].join(''));
    const innerFocusScope = `${innerScope}:focus`;
    return [
        {
            varName: 'fontSize',
            cssProp: 'font-size',
            cssSubSelector: innerScope,
            widgetSettings: {
                valueType: 'length',
                label: 'Font size',
                inputId: `jetForms${inputNameId}FontSize`,
                defaultThemeValue: '0.9rem',
            },
        },
        {
            varName: 'paddingY',
            cssProp: 'padding-top',
            cssSubSelector: innerScope,
            widgetSettings: {
                valueType: 'length',
                label: 'Padding ↕',
                inputId: `jetForms${inputNameId}PaddingY`,
                defaultThemeValue: '0.25rem',
            },
        },
        {
            varName: 'paddingX',
            cssProp: 'padding-left',
            cssSubSelector: innerScope,
            widgetSettings: {
                valueType: 'length',
                label: 'Padding ↔',
                inputId: `jetForms${inputNameId}PaddingX`,
                defaultThemeValue: '0.4rem',
            },
        },
        {
            varName: 'backgroundNormalColor',
            cssProp: 'background-color',
            cssSubSelector: innerScope,
            widgetSettings: {
                valueType: 'color',
                label: 'Background normal',
                inputId: `jetForms${inputNameId}BackgroundNormalColor`,
            },
        },
        {
            varName: 'backgroundFocusColor',
            cssProp: 'background-color',
            cssSubSelector: innerFocusScope,
            widgetSettings: {
                valueType: 'color',
                label: 'Background focus',
                inputId: `jetForms${inputNameId}BackgroundFocusColor`,
            },
        },
        {
            varName: 'borderNormalColor',
            cssProp: 'border-color',
            cssSubSelector: innerScope,
            widgetSettings: {
                valueType: 'color',
                label: 'Border normal',
                inputId: `jetForms${inputNameId}BorderNormalColor`,
            },
        },
        {
            varName: 'borderFocusColor',
            cssProp: 'border-color',
            cssSubSelector: innerFocusScope,
            widgetSettings: {
                valueType: 'color',
                label: 'Border focus',
                inputId: `jetForms${inputNameId}BorderFocusColor`,
            },
        },
        {
            varName: 'outlineFocusColor',
            cssProp: 'box-shadow',
            cssSubSelector: innerFocusScope,
            widgetSettings: {
                valueType: 'color',
                label: 'Outline focus',
                inputId: `jetForms${inputNameId}OutlineFocusColor`,
            },
        },
        {
            varName: 'radius',
            cssProp: 'border-radius',
            cssSubSelector: innerScope,
            widgetSettings: {
                valueType: 'length',
                label: 'Radius',
                inputId: `jetForms${inputNameId}Radius`,
                defaultThemeValue: '2px',
            },
        },
        {
            varName: 'textColor',
            cssProp: 'color',
            cssSubSelector: null,
            widgetSettings: {
                valueType: 'color',
                label: 'Text',
                inputId: `jetForms${inputNameId}TextColor`,
            },
        },
        {
            varName: 'placeholderTextColor',
            cssProp: 'color',
            cssSubSelector: `${innerScope}::placeholder`,
            widgetSettings: {
                valueType: 'color',
                label: 'Placeholder text',
                inputId: `jetForms${inputNameId}PlaceholderTextColor`,
            },
        },
        {
            varName: 'errorTextColor',
            cssProp: 'color',
            cssSubSelector: '.pristine-error',
            widgetSettings: {
                valueType: 'color',
                label: 'Error text',
                inputId: `jetForms${inputNameId}ErrorTextColor`,
            },
        },
    ];
}

export {createFocusOutlineCodeTemplate, createVisualEditFormAuto};
