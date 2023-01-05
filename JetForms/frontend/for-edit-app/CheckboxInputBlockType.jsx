import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import services from './services.js';
import InputEditFormAbstract from './InputEditFormAbstract.jsx';

class CheckboxInputBlockEditForm extends InputEditFormAbstract {
    // nameInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, isRequired, label} = getBlockCopy();
        this.nameInput = preact.createRef();
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
        setFocusTo(this.nameInput);
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
                <Input vm={ this } prop="label"/>
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
                <label htmlFor="name" class="form-label">Id</label>
                <Input vm={ this } prop="name" ref={ this.nameInput }/>
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

const blockTypeName = 'JetFormsCheckboxInput';
const checkboxInputBlockType = {
    name: blockTypeName,
    friendlyName: 'Checkbox input (JetForms)',
    initialData: () => ({
        name: services.idGen.getNextId(),
        isRequired: 0,
        label: __('Text'),
    }),
    defaultRenderer: 'plugins/JetForms:block-inline-input-auto',
    icon: 'checkbox',
    reRender({name, isRequired, label, id, styleClasses}, renderChildren) {
        return ['<div class="j-', blockTypeName,
                styleClasses ? ` ${styleClasses}` : '',
                ' form-group" data-block-type="', blockTypeName, '" data-block="', id,
            '"><label class="form-checkbox">',
                '<input name="', name, '" type="checkbox"', isRequired ? ' data-pristine-required' : '', '>',
                '<i class="form-icon"></i> ', label,
            '</label>',
            renderChildren(),
        '</div>'].join('');
    },
    createSnapshot: from => ({
        name: from.name,
        isRequired: from.isRequired,
        label: from.label,
    }),
    editForm: CheckboxInputBlockEditForm,
};

export default checkboxInputBlockType;