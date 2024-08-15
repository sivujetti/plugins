import {
    __,
    api,
    CrudList,
    FormGroup,
    FormGroupInline,
    hookForm,
    Input,
    InputErrors,
    objectUtils,
    reHookValues,
    setFocusTo,
    unhookForm,
    validationConstraints,
} from '@sivujetti-commons-for-edit-app';
import InputEditFormAbstract from './common/InputEditFormAbstract.jsx';
import SelectOrRadioGroupInputOptionEditForm, {
    createSelectOrOptionSelectItemCreator
} from './common/SelectOrRadioGroupInputOptionEditForm.jsx';

class SelectInputBlockEditForm extends InputEditFormAbstract {
    // valueCreator;
    // showTechnicalInputs;
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {block, emitValueChangedThrottled} = this.props;
        const {name, label, multiple, options} = block;
        const optionsCopy = objectUtils.cloneDeep(options);
        this.valueCreator = createSelectOrOptionSelectItemCreator(optionsCopy.map(({value}) => value));
        this.showTechnicalInputs = api.user.getRole() <= api.user.ROLE_ADMIN_EDITOR;
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],  label: 'Id', onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'name', hasErrors, source);
            }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: __('Label'), onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'label', hasErrors, source);
            }},
        ], {
            options: optionsCopy,
            multiple,
        }));
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    componentWillReceiveProps(props) {
        const {block} = props;
        if (block === this.props.block)
            return;
        if (props.lastBlockTreeChangeEventInfo?.isUndoOrRedo && (
            this.state.values.name !== block.name ||
            this.state.values.label !== block.label
        )) {
            reHookValues(this, [
                {name: 'name', value: block.name},
                {name: 'label', value: block.label},
            ]);
        }
        if (JSON.stringify(this.state.options) !== JSON.stringify(block.options)) {
            const optionsCopy = objectUtils.cloneDeep(block.options);
            this.valueCreator = createSelectOrOptionSelectItemCreator(optionsCopy.map(({value}) => value));
            this.setState({options: optionsCopy});
        }
        if (this.state.multiple !== block.multiple) {
            this.setState({multiple: block.multiple});
        }
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
    render(_, {options, multiple}) {
        if (!this.state.values) return;
        return [<div class="form-horizontal py-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Label#withDescr') }</label>
                <Input vm={ this } prop="label" id="label" ref={ this.labelInput }/>
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
                <Input vm={ this } prop="name" id="name"/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>,
        <FormGroup>
            <div class="form-label pt-0 pb-1">{ __('Options') }</div>
            <div class="form-horizontal text-tinyish styles-list pt-0">
                <CrudList
                    items={ options }
                    itemTitleKey="text"
                    getTitle={ item => !this.showTechnicalInputs ? item.text : [`${item.text} `, <i class="color-dimmed">({item.value})</i>] }
                    onListMutated={ this.emitOptions.bind(this) }
                    createNewItem={ this.valueCreator.createNewItem.bind(this.valueCreator) }
                    editForm={ SelectOrRadioGroupInputOptionEditForm }
                    editFormProps={ {showValueInput: this.showTechnicalInputs} }
                    itemTypeFriendlyName={ __('option') }/>
            </div>
        </FormGroup>];
    }
    /**
     * @param {Array<{text: String; value: String;}>} list
     * @access private
     */
    emitOptions(list) {
        this.props.emitValueChanged(list, 'options');
    }
    /**
     * @param {Event} e
     * @access private
     */
    emitMultiple(e) {
        const multiple = e.target.checked ? 1 : 0;
        this.props.emitValueChanged(multiple, 'multiple');
    }
}

export default SelectInputBlockEditForm;
