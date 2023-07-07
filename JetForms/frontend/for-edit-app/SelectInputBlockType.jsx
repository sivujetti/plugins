import {__, api, env, hookForm, unhookForm, reHookValues, Input, InputErrors,
        FormGroup, FormGroupInline, validationConstraints} from '@sivujetti-commons-for-edit-app';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import CrudList from './CrudList.jsx';
import InputEditFormAbstract from './InputEditFormAbstract.jsx';
import SelectOrRadioGroupInputOptionEditForm,
        {createSelectOrOptionSelectItemCreator} from './SelectOrRadioGroupInputOptionEditForm.jsx';
import services from './services.js';

class SelectInputBlockEditForm extends InputEditFormAbstract {
    // valueCreator;
    // showTechnicalInputs;
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, label, multiple, options} = getBlockCopy();
        const optionsParsed = JSON.parse(options);
        this.valueCreator = createSelectOrOptionSelectItemCreator(optionsParsed.map(({value}) => value));
        this.showTechnicalInputs = api.user.getRole() < api.user.ROLE_EDITOR;
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
        ], {
            multiple,
            optionsJson: options,
            optionsParsed,
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label))
                reHookValues(this, [{name: 'name', value: block.name},
                                    {name: 'label', value: block.label}]);
            if (this.state.multiple !== block.multiple)
                this.setState({multiple: block.multiple});
            if (this.state.optionsJson !== block.options) {
                const optionsParsed = JSON.parse(block.options);
                this.valueCreator = createSelectOrOptionSelectItemCreator(optionsParsed.map(({value}) => value));
                this.setState({optionsJson: block.options, optionsParsed});
            }
        });
    }
    /**
     * @access protected
     */
    componentDidMount() {
        setFocusTo(this.labelInput);
    }
    /**
     * @access protected
     */
    componentWillUnmount() {
        unhookForm(this);
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render(_, {multiple, optionsParsed}) {
        if (!this.state.values) return;
        return [<div class="form-horizontal py-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Label_with_descr') }</label>
                <Input vm={ this } prop="label" ref={ this.labelInput }/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            <FormGroupInline>
                <span class="form-label">{ __('Multiple') }?</span>
                <label class="form-checkbox mt-0">
                    <input
                        onClick={ this.emitMultiple.bind(this) }
                        checked={ multiple === 1 }
                        type="checkbox"
                        class="form-input"/><i class="form-icon"></i>
                </label>
            </FormGroupInline>
            { this.showTechnicalInputs ? <FormGroupInline>
                <label htmlFor="name" class="form-label">Id</label>
                <Input vm={ this } prop="name"/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>,
        <FormGroup>
            <label htmlFor="options" class="form-label pt-0 pb-1">{ __('Options') }</label>
            <CrudList
                items={ optionsParsed }
                itemTitleKey="text"
                getTitle={ item => !this.showTechnicalInputs ? item.text : [`${item.text} `, <i class="color-dimmed">({item.value})</i>] }
                onListMutated={ this.emitOptions.bind(this) }
                createNewItem={ this.valueCreator.createNewItem.bind(this.valueCreator) }
                editForm={ SelectOrRadioGroupInputOptionEditForm }
                editFormProps={ {showValueInput: this.showTechnicalInputs} }
                itemTypeFriendlyName={ __('option') }/>
        </FormGroup>];
    }
    /**
     * @param {Event} e
     * @access private
     */
    emitMultiple(e) {
        const multiple = e.target.checked ? 1 : 0;
        this.props.emitValueChanged(multiple, 'multiple', false, env.normalTypingDebounceMillis);
    }
    /**
     * @param {Array<{text: String; value: String;}>} list
     * @access private
     */
    emitOptions(list) {
        this.props.emitValueChanged(JSON.stringify(list), 'options', false, env.normalTypingDebounceMillis);
    }
}

const blockTypeName = 'JetFormsSelectInput';

export default {
    name: blockTypeName,
    friendlyName: 'Select input (JetForms)',
    initialData: () => ({
        name: services.idGen.getNextId(),
        label: '',
        options: JSON.stringify([createSelectOrOptionSelectItemCreator().createNewItem()]),
        multiple: 0,
    }),
    defaultRenderer: 'plugins/JetForms:block-input-select',
    icon: 'selector',
    reRender({name, label, options, multiple, id, styleClasses}, renderChildren) {
        return ['<div class="j-', blockTypeName,
            styleClasses ? ` ${styleClasses}` : '',
            ' form-group" data-block-type="', blockTypeName, '" data-block="', id, '">',
            !label ? '' : `<label class="form-label" for="${name}">${label}</label>`,
            '<select class="form-select" name="', name, !multiple ? '"' : '[]" multiple', '>',
                ...JSON.parse(options).concat({text: '-', value: '-'}).map(({value, text}) =>
                    ['<option value="', value , '">', __(text), '</option>']
                ).flat(),
            '</select>',
            renderChildren(),
        '</div>'].join('');
    },
    createSnapshot: from => ({
        name: from.name,
        label: from.label,
        options: from.options,
        multiple: from.multiple,
    }),
    editForm: SelectInputBlockEditForm,
};
