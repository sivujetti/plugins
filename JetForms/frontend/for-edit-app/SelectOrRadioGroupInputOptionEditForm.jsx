import {__, hookForm, reHookValues, hasErrors, Textarea, InputErrors,
        FormGroupInline} from '@sivujetti-commons-for-edit-app';

class SelectOrRadioGroupInputOptionEditForm extends preact.Component {
    /**
     * @param {{showValueInput: Boolean; item: SelectOrRadioGroupSelectItem; onValueChanged: (value: String, key: keyof SelectOrRadioGroupSelectItem) => void; done: () => void;}} props
     */
    constructor(props) {
        super(props);
        this.state = hookForm(this, [
            {name: 'text', value: props.item.text, validations: [['minLength', 1]], label: __('Option text'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onValueChanged(value, 'text'); }},
            {name: 'value', value: props.item.value, validations: [['minLength', 1]], label: __('Option value'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onValueChanged(value, 'value'); }},
        ]);
    }
    /**
     * @param {SelectOrRadioGroupSelectItem} item
     * @access public
     */
    overrideValues(item) {
        reHookValues(this, [{name: 'text', value: item.text}, {name: 'value', value: item.value}]);
    }
    /**
     * @access protected
     */
    render({done, showValueInput}) {
        return <div class="form-horizontal pt-0">
            <button
                onClick={ () => done() }
                class="btn btn-sm"
                disabled={ hasErrors(this) }
                title={ __('Done') }>&lt;</button>
            <FormGroupInline className="mt-0">
                <label htmlFor="text" class="form-label">{ __('Option text') }</label>
                <Textarea vm={ this } prop="text" rows="3"/>
                <InputErrors vm={ this } prop="text"/>
            </FormGroupInline>
            { showValueInput ? <FormGroupInline>
                <label htmlFor="value" class="form-label">{ __('Option value') }</label>
                <Textarea vm={ this } prop="value" rows="3"/>
                <InputErrors vm={ this } prop="value"/>
            </FormGroupInline> : null }
        </div>;
    }
}

/**
 * @param {Array<String>} currentValues = []
 * @returns {{createNewItem(text: String, value: String = 'auto'): {text: String; value: String};}}
 */
function createSelectOrOptionSelectItemCreator(currentValues = []) {
    let counter = currentValues.reduce((max, val) => {
        const asStr = val.split('-').at(-1);
        const asInt = parseInt(asStr, 10);
        return !isNaN(asInt) && asInt > max ? asInt : max;
    }, 0);
    return {
        createNewItem(text = __('Option text'), value = 'auto') {
            return {
                text,
                value: value === 'auto' ? `option-${(counter += 1, counter)}` : value,
            };
        }
    };
}

/**
 * @typedef SelectOrRadioGroupSelectItem
 * @prop {String} text
 * @prop {String} value
 */

export default SelectOrRadioGroupInputOptionEditForm;
export {createSelectOrOptionSelectItemCreator};
