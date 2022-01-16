import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {formValidation} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';

class InputBlockEditForm extends preact.Component {
    // nameInput;
    /**
     * @param {RawBlockData} snapshot
     * @access public
     */
    overrideValues(snapshot) {
        reHookValues(this, [{name: 'name', value: snapshot.name},
                            {name: 'label', value: snapshot.label},
                            {name: 'placeholder', value: snapshot.placeholder}]);
        this.setState({isRequired: snapshot.isRequired});
    }
    /**
     * @access protected
     */
    componentWillMount() {
        const {block, onValueChanged} = this.props;
        this.nameInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: block.name, validations: [['identifier'], ['maxLength', formValidation.HARD_SHORT_TEXT_MAX_LEN]], label: __('Name'),
             onAfterValueChanged: (value, hasErrors) => { onValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: block.label, validations: [['maxLength', formValidation.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label'),
             onAfterValueChanged: (value, hasErrors) => { onValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'placeholder', value: block.placeholder, validations: [['maxLength', formValidation.HARD_SHORT_TEXT_MAX_LEN]], label: __('Placeholder'),
             onAfterValueChanged: (value, hasErrors) => { onValueChanged(value, 'placeholder', hasErrors, env.normalTypingDebounceMillis); }},
        ]), {
            isRequired: block.isRequired,
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
                <label htmlFor="name" class="form-label">{ __('Name') }</label>
                <Input vm={ this } prop="name" ref={ this.nameInput }/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Label') }</label>
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
            <FormGroupInline>
                <label htmlFor="placeholder" class="form-label">{ __('Placeholder') }</label>
                <Input vm={ this } prop="placeholder"/>
                <InputErrors vm={ this } prop="placeholder"/>
            </FormGroupInline>
        </div>;
    }
    /**
     * @param {Event} e
     * @access private
     */
    emitIsRequired(e) {
        const isRequired = e.target.checked ? 1 : 0;
        this.setState({isRequired});
        this.props.onValueChanged(isRequired, 'isRequired');
    }
}

const initialData = {
    name: __('inputName'),
    isRequired: 1,
    label: '',
    placeholder: '',
};

/**
 * @param {{name: String; friendlyName: String; type?: String; icon?: String;}} settings
 * @returns {todo}
 */
export default settings => ({
    name: `JetForms${settings.name}`,
    friendlyName: settings.friendlyName,
    ownPropNames: Object.keys(initialData),
    initialData,
    defaultRenderer: 'sivujetti:jet-forms-block-input-auto',
    icon: settings.icon || 'box',
    reRender({name, isRequired, label, placeholder}, _renderChildren) {
        const wrap = inner => !label ? inner : `<div class="form-group"><label class="form-label" for="${name}">${label}${inner}</label></div>`;
        const [startTag, closingTag] = settings.type !== 'textarea' ? ['input', ''] : ['textarea', '</textarea>'];
        return wrap([
            '<',startTag,' name="',name,'" id="',name,'" type="',settings.type,'" class="form-input"',
                placeholder ? ` placeholder="${placeholder}"` : '',
                isRequired ? ' data-pristine-required' : '',
            '>', closingTag,
        ].join(''));
    },
    createSnapshot: from => ({
        name: from.name,
        label: from.label,
        isRequired: from.isRequired,
        placeholder: from.placeholder,
    }),
    editForm: InputBlockEditForm,
});
