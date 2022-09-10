import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';

class CheckboxInputBlockEditForm extends preact.Component {
    // nameInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, label} = getBlockCopy();
        this.nameInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Text'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
        ]));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label))
                reHookValues(this, [{name: 'name', value: block.name},
                                    {name: 'label', value: block.label}]);
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
    render(_) {
        if (!this.state.values) return;
        return <div class="form-horizontal pt-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Text') }</label>
                <Input vm={ this } prop="label"/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="name" class="form-label">Id</label>
                <Input vm={ this } prop="name" ref={ this.nameInput }/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline>
        </div>;
    }
}

const initialData = {
    name: __('inputName'),
    label: __('Text'),
};

const blockTypeName = 'JetFormsCheckboxInput';
const checkboxInputBlockType = {
    name: blockTypeName,
    friendlyName: 'JetForms: Checkbox input',
    ownPropNames: Object.keys(initialData),
    initialData,
    defaultRenderer: 'plugins/JetForms:block-inline-input-auto',
    icon: 'checkbox',
    reRender({name, label, id, styleClasses}, renderChildren) {
        return ['<div class="j-', blockTypeName,
                styleClasses ? ` ${styleClasses}` : '',
                ' form-group" data-block-type="', blockTypeName, '" data-block="', id,
            '"><label class="form-checkbox">',
                '<input name="', name, '" type="checkbox">',
                '<i class="form-icon"></i> ', label,
            '</label>',
            renderChildren(),
        '</div>'].join('');
    },
    createSnapshot: from => ({
        name: from.name,
        label: from.label,
    }),
    editForm: CheckboxInputBlockEditForm,
};

export default checkboxInputBlockType;