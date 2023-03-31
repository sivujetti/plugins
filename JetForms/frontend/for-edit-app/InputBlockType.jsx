import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import services from './services.js';
import InputEditFormAbstract from './InputEditFormAbstract.jsx';

class InputBlockEditForm extends InputEditFormAbstract {
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, label, placeholder, isRequired, numRows} = getBlockCopy();
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [...[
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label_with_descr'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'placeholder', value: placeholder, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Placeholder_with_descr'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'placeholder', hasErrors, env.normalTypingDebounceMillis); }},
        ], ...(numRows === undefined
            ? []
            : [{name: 'numRows', value: normalizeNumRows(numRows), validations: [['min', 0], ['max', 2000]], label: __('Rows'),
             type: 'number', step: '1', onAfterValueChanged: (value, hasErrors) => {
                emitValueChanged(parseInt(value || 0, 10), 'numRows', hasErrors, env.normalTypingDebounceMillis);
            }}]
        )], {
            isRequired,
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label ||
                           this.state.values.placeholder !== block.placeholder ||
                           (block.numRows !== undefined && this.state.values.numRows !== normalizeNumRows(block.numRows))))
                reHookValues(this, [...[
                    {name: 'name', value: block.name},
                    {name: 'label', value: block.label},
                    {name: 'placeholder', value: block.placeholder}
                ], ...(block.numRows === undefined
                    ? []
                    : [{name: 'numRows', value: normalizeNumRows(block.numRows)}]
                )]);
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
                <label htmlFor="label" class="form-label">{ __('Label_with_descr') }</label>
                <Input vm={ this } prop="label" ref={ this.labelInput }/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="placeholder" class="form-label">{ __('Placeholder_with_descr') }</label>
                <Input vm={ this } prop="placeholder"/>
                <InputErrors vm={ this } prop="placeholder"/>
            </FormGroupInline>
            { this.state.values.numRows !== undefined ? <FormGroupInline>
                <label htmlFor="placeholder" class="form-label">{ __('Rows') }</label>
                <Input vm={ this } prop="numRows"/>
                <InputErrors vm={ this } prop="numRows"/>
            </FormGroupInline> : null }
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
                <Input vm={ this } prop="name"/>
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

/**
 * @param {Number} input
 * @returns {String}
 */
function normalizeNumRows(input) {
    return input !== 0 ? input.toString() : '';
}

/**
 * @param {{name: String; friendlyName: String; type?: String; icon?: String; inputMode?: String;}} settings
 * @returns {Object}
 */
export default settings => ({
    name: `JetForms${settings.name}`,
    friendlyName: settings.friendlyName,
    initialData: () => ({...{
        name: services.idGen.getNextId(),
        isRequired: 1,
        label: '',
        placeholder: '',
    }, ...(settings.name !== 'TextareaInput'
        ? {}
        : {numRows: 0}
    )}),
    defaultRenderer: 'plugins/JetForms:block-input-auto',
    icon: settings.icon || 'box',
    reRender({name, isRequired, label, placeholder, id, styleClasses, numRows}, renderChildren) {
        const [startTag, closingTag, attrsStr, inputModeStr] = settings.type !== 'textarea'
            ? ['input',    '',            ` type="${settings.type}"`,           !settings.inputMode ? '' : ` inputmode="${settings.inputMode}"`]
            : ['textarea', '</textarea>', !numRows ? '' : ` rows="${numRows}"`, ''];
        const blockTypeName = `JetForms${settings.name}`;
        return [
            '<div class="j-', blockTypeName,
                    styleClasses ? ` ${styleClasses}` : '',
                    ' form-group" data-block-type="', blockTypeName, '" data-block="', id, '">',
                !label
                    ? ''
                    : `<label class="form-label" for="${name}">${label}</label>`,
                '<', startTag, ' name="', name, '" id="', name, '"',
                    attrsStr,
                    ' class="form-input"',
                    inputModeStr,
                    placeholder ? ` placeholder="${placeholder}"` : '',
                    isRequired ? ' data-pristine-required' : '',
                '>', closingTag,
                renderChildren(),
            '</div>'
        ].join('');
    },
    createSnapshot: from => ({...{
        name: from.name,
        label: from.label,
        isRequired: from.isRequired,
        placeholder: from.placeholder,
    }, ...(settings.name !== 'TextareaInput'
        ? {}
        : {numRows: from.numRows}
    )}),
    editForm: InputBlockEditForm,
});
