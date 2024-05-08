import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline, setFocusTo, validationConstraints} from '@sivujetti-commons-for-edit-app';
import services from './services.js';
import InputEditFormAbstract from './InputEditFormAbstract.jsx';

class CheckboxInputBlockEditForm extends InputEditFormAbstract {
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, isRequired, label} = getBlockCopy();
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Text'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
        ], {
            isRequired,
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label))
                reHookValues(this, [{name: 'name', value: block.name},
                                    {name: 'label', value: block.label}]);
            if (this.state.isRequired !== block.isRequired)
                this.setState({isRequired: block.isRequired});
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
    render(_, {isRequired}) {
        if (!this.state.values) return;
        return <div class="form-horizontal pt-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Text') }</label>
                <Input vm={ this } prop="label" id="label" ref={ this.labelInput }/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            <FormGroupInline>
                <span class="form-label">{ __('Required') }?</span>
                <label class="form-checkbox mt-0">
                    <input
                        onClick={ this.emitIsRequired.bind(this) }
                        checked={ isRequired }
                        type="checkbox"
                        class="form-input"/><i class="form-icon"></i>
                </label>
            </FormGroupInline>
            { this.showTechnicalInputs ? <FormGroupInline>
                <label htmlFor="checkBoxName" class="form-label">Id</label>
                <Input vm={ this } prop="name" id="checkBoxName"/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>;
    }
    /**
     * @param {Event} e
     * @access private
     */
    emitIsRequired(e) {
        const isRequired = e.target.checked ? 1 : 0;
        this.props.emitValueChanged(isRequired, 'isRequired', false, env.normalTypingDebounceMillis);
    }
}

export default {
    name: 'JetFormsCheckboxInput',
    friendlyName: 'Checkbox input (JetForms)',
    icon: 'checkbox',
    editForm: CheckboxInputBlockEditForm,
    stylesEditForm: null,
    createOwnProps(/*defProps*/) {
        return {
            name: services.idGen.getNextId(),
            isRequired: 0,
            label: __('Text'),
        };
    }
};
