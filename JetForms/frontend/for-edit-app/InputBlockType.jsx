import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import services from './services.js';

class InputBlockEditForm extends preact.Component {
    // nameInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, label, placeholder, isRequired} = getBlockCopy();
        this.nameInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'placeholder', value: placeholder, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Placeholder'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'placeholder', hasErrors, env.normalTypingDebounceMillis); }},
        ], {
            isRequired,
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label ||
                           this.state.values.placeholder !== block.placeholder))
                reHookValues(this, [{name: 'name', value: block.name},
                                    {name: 'label', value: block.label},
                                    {name: 'placeholder', value: block.placeholder}]);
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
                <label htmlFor="label" class="form-label">{ __('Label_with_descr') }</label>
                <Input vm={ this } prop="label"/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="placeholder" class="form-label">{ __('Placeholder_with_descr') }</label>
                <Input vm={ this } prop="placeholder"/>
                <InputErrors vm={ this } prop="placeholder"/>
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
                <label htmlFor="name" class="form-label">Id</label>
                <Input vm={ this } prop="name" ref={ this.nameInput }/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline>
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

/**
 * @param {{name: String; friendlyName: String; type?: String; icon?: String; inputMode?: String;}} settings
 * @returns {Object}
 */
export default settings => ({
    name: `JetForms${settings.name}`,
    friendlyName: settings.friendlyName,
    initialData: () => ({
        name: services.idGen.getNextId(),
        isRequired: 1,
        label: '',
        placeholder: '',
    }),
    defaultRenderer: 'plugins/JetForms:block-input-auto',
    icon: settings.icon || 'box',
    reRender({name, isRequired, label, placeholder, id, styleClasses}, renderChildren) {
        const [startTag, closingTag, inputModeStr] = settings.type !== 'textarea'
            ? ['input', '', !settings.inputMode ? '' : ` inputmode="${settings.inputMode}"`]
            : ['textarea', '</textarea>', ''];
        const blockTypeName = `JetForms${settings.name}`;
        return [
            '<div class="j-', blockTypeName,
                    styleClasses ? ` ${styleClasses}` : '',
                    ' form-group" data-block-type="', blockTypeName, '" data-block="', id, '">',
                !label
                    ? ''
                    : `<label class="form-label" for="${name}">${label}</label>`,
                '<', startTag, ' name="', name, '" id="', name,
                    '" type="', settings.type, '" class="form-input"',
                    inputModeStr,
                    placeholder ? ` placeholder="${placeholder}"` : '',
                    isRequired ? ' data-pristine-required' : '',
                '>', closingTag,
                renderChildren(),
            '</div>'
        ].join('');
    },
    createSnapshot: from => ({
        name: from.name,
        label: from.label,
        isRequired: from.isRequired,
        placeholder: from.placeholder,
    }),
    editForm: InputBlockEditForm,
});
