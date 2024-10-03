import {
    __,
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
import services from '../services.js';
import InputEditFormAbstract from './common/InputEditFormAbstract.jsx';
import SelectOrRadioGroupInputOptionEditForm, {
    createSelectOrOptionSelectItemCreator
} from './common/SelectOrRadioGroupInputOptionEditForm.jsx';

class RadioGroupInputBlockEditForm extends InputEditFormAbstract {
    // valueCreator;
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {block, emitValueChangedThrottled} = this.props;
        const {name, label, radios, isRequired} = block;
        const radiosCopy = objectUtils.cloneDeep(radios);
        this.valueCreator = createSelectOrOptionSelectItemCreator(radiosCopy.map(({value}) => value));
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: 'Id', onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'name', hasErrors, source);
            }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: __('Label'), onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'label', hasErrors, source);
            }},
        ], {
            radios: radiosCopy,
            isRequired,
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
        if (JSON.stringify(this.state.radios) !== JSON.stringify(block.radios)) {
            const optionsCopy = objectUtils.cloneDeep(block.radios);
            this.valueCreator = createSelectOrOptionSelectItemCreator(optionsCopy.map(({value}) => value));
            this.setState({radios: optionsCopy});
        }
        if (this.state.isRequired !== block.isRequired) {
            this.setState({isRequired: block.isRequired});
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
    render(_, {radios}) {
        if (!this.state.values) return;
        return [<div class="form-horizontal py-0">
            <FormGroupInline>
                <label htmlFor="radioLabel" class="form-label">{ __('Label#withDescr') }</label>
                <Input vm={ this } prop="label" id="radioLabel" ref={ this.labelInput }/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            { this.renderIsRequiredFormGroup() }
            { this.showTechnicalInputs ? <FormGroupInline>
                <label htmlFor="radioName" class="form-label">Id</label>
                <Input vm={ this } prop="name" id="radioName"/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>,
        <FormGroup>
            <div class="form-label pt-0 pb-1">{ __('Options') }</div>
            <div class="form-horizontal text-tinyish styles-list pt-0">
                <CrudList
                    items={ radios }
                    itemTitleKey="text"
                    getTitle={ item => !this.showTechnicalInputs ? item.text : [`${item.text} `, <i class="color-dimmed">({item.value})</i>] }
                    onListMutated={ this.emitRadios.bind(this) }
                    createNewItem={ this.valueCreator.createNewItem.bind(this.valueCreator) }
                    editForm={ SelectOrRadioGroupInputOptionEditForm }
                    editFormProps={ {showValueInput: this.showTechnicalInputs} }
                    itemTypeFriendlyName={ __('option') }/>
            </div>
        </FormGroup>];
    }
    /**
     * @param {Array<{text: string; value: string;}>} list
     * @access private
     */
    emitRadios(list) {
        this.props.emitValueChanged(list, 'radios');
    }
}

export default {
    name: 'JetFormsRadioGroupInput',
    friendlyName: 'Radio group (JetForms)',
    icon: 'circle',
    editForm: RadioGroupInputBlockEditForm,
    stylesEditForm: 'default',
    createOwnProps(/*defProps*/) {
        return {
            name: services.idGen.getNextId(),
            label: '',
            radios: [createSelectOrOptionSelectItemCreator().createNewItem()],
            isRequired: 1,
        };
    }
};
