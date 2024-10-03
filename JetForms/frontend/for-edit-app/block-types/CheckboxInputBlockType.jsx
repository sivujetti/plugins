import {
    __,
    FormGroupInline,
    hookForm,
    Input,
    InputErrors,
    reHookValues,
    setFocusTo,
    unhookForm,
    validationConstraints,
} from '@sivujetti-commons-for-edit-app';
import services from '../services.js';
import InputEditFormAbstract from './common/InputEditFormAbstract.jsx';

class CheckboxInputBlockEditForm extends InputEditFormAbstract {
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {block, emitValueChangedThrottled} = this.props;
        const {name, isRequired, label} = block;
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: 'Id', onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'name', hasErrors, source);
            }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: __('Text'), onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'label', hasErrors, source);
            }},
        ], {
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
        if (this.state.isRequired !== block.isRequired)
            this.setState({isRequired: block.isRequired});
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
    render(_) {
        if (!this.state.values) return;
        return <div class="form-horizontal pt-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Text') }</label>
                <Input vm={ this } prop="label" id="label" ref={ this.labelInput }/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            { this.renderIsRequiredFormGroup() }
            { this.showTechnicalInputs ? <FormGroupInline>
                <label htmlFor="checkboxName" class="form-label">Id</label>
                <Input vm={ this } prop="name" id="checkboxName"/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>;
    }
}

export default {
    name: 'JetFormsCheckboxInput',
    friendlyName: 'Checkbox input (JetForms)',
    icon: 'checkbox',
    editForm: CheckboxInputBlockEditForm,
    stylesEditForm: 'default',
    createOwnProps(/*defProps*/) {
        return {
            name: services.idGen.getNextId(),
            isRequired: 0,
            label: __('Text'),
        };
    }
};
