import {__, api, env, hookForm, unhookForm, reHookValues, Input, InputErrors,
        FormGroup, FormGroupInline, objectUtils, setFocusTo, validationConstraints} from '@sivujetti-commons-for-edit-app';
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
        const optionsCopy = objectUtils.cloneDeep(options);
        this.valueCreator = createSelectOrOptionSelectItemCreator(optionsCopy.map(({value}) => value));
        this.showTechnicalInputs = api.user.getRole() < api.user.ROLE_EDITOR;
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
        ], {
            multiple,
            options: optionsCopy,
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label))
                reHookValues(this, [{name: 'name', value: block.name},
                                    {name: 'label', value: block.label}]);
            if (this.state.multiple !== block.multiple)
                this.setState({multiple: block.multiple});
            if (JSON.stringify(this.state.options) !== JSON.stringify(block.options)) {
                const optionsCopy = objectUtils.cloneDeep(block.options);
                this.valueCreator = createSelectOrOptionSelectItemCreator(optionsCopy.map(({value}) => value));
                this.setState({options: optionsCopy});
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
    render(_, {multiple, options}) {
        if (!this.state.values) return;
        return [<div class="form-horizontal py-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Label#withDescr') }</label>
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
                items={ options }
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
        this.props.emitValueChanged(multiple, 'multiple');
    }
    /**
     * @param {Array<{text: String; value: String;}>} list
     * @access private
     */
    emitOptions(list) {
        this.props.emitValueChanged(list, 'options');
    }
}

export default {
    name: 'JetFormsSelectInput',
    friendlyName: 'Select input (JetForms)',
    icon: 'selector',
    editForm: SelectInputBlockEditForm,
    stylesEditForm: null,
    createOwnProps(_defProps) {
        return {
            name: services.idGen.getNextId(),
            label: '',
            options: [createSelectOrOptionSelectItemCreator().createNewItem()],
            multiple: 0,
        };
    },
};
