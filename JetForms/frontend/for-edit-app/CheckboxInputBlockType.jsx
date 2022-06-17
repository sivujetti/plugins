import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';

class CheckboxInputBlockEditForm extends preact.Component {
    // nameInput;
    /**
     * @param {RawBlockData} snapshot
     * @access public
     */
    overrideValues(snapshot) {
        reHookValues(this, [{name: 'name', value: snapshot.name},
                            {name: 'label', value: snapshot.label}]);
    }
    /**
     * @access protected
     */
    componentWillMount() {
        const {block, onValueChanged} = this.props;
        this.nameInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: block.name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Name'),
             onAfterValueChanged: (value, hasErrors) => { onValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: block.label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label'),
             onAfterValueChanged: (value, hasErrors) => { onValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
        ]));
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
                <label htmlFor="name" class="form-label">{ __('Name') }</label>
                <Input vm={ this } prop="name" ref={ this.nameInput }/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Label') }</label>
                <Input vm={ this } prop="label"/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
        </div>;
    }
}

const initialData = {
    name: __('inputName'),
    label: __('Label text'),
};

const blockTypeName = 'JetFormsCheckboxInput';
const checkboxInputBlockType = {
    name: blockTypeName,
    friendlyName: 'JetForms: Checkbox input',
    ownPropNames: Object.keys(initialData),
    initialData,
    defaultRenderer: 'plugins/JetForms:block-inline-input-auto',
    icon: 'checkbox',
    reRender({name, label, id}, _renderChildren) {
        return ['<div class="jet-forms-input-wrap form-group" data-block-type="', blockTypeName, '" data-block="', id, '">',
            '<label class="form-checkbox">',
                '<input name="', name, '" type="checkbox">',
                '<i class="form-icon"></i> ', label,
            '</label>',
        '</div>'].join('');
    },
    createSnapshot: from => ({
        name: from.name,
        label: from.label,
    }),
    editForm: CheckboxInputBlockEditForm,
};

export default checkboxInputBlockType;