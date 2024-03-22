import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroupInline,
        setFocusTo, validationConstraints} from '@sivujetti-commons-for-edit-app';
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
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label#withDescr'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'placeholder', value: placeholder, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Placeholder#withDescr'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'placeholder', hasErrors, env.normalTypingDebounceMillis); }},
        ], ...(numRows === undefined
            ? []
            : [{name: 'numRows', value: getNormalizedNumRows(numRows), validations: [['min', 0], ['max', 2000]], label: __('Rows'),
             type: 'number', step: '1', onAfterValueChanged: (value, hasErrors) => {
                emitValueChanged(getUnnormalizedNumRows(value), 'numRows', hasErrors, env.normalTypingDebounceMillis);
            }}]
        )], {
            isRequired,
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label ||
                           this.state.values.placeholder !== block.placeholder ||
                           (block.numRows !== undefined && getUnnormalizedNumRows(this.state.values.numRows) !== block.numRows)))
                reHookValues(this, [...[
                    {name: 'name', value: block.name},
                    {name: 'label', value: block.label},
                    {name: 'placeholder', value: block.placeholder}
                ], ...(block.numRows === undefined
                    ? []
                    : [{name: 'numRows', value: getNormalizedNumRows(block.numRows)}]
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
                <label htmlFor="label" class="form-label">{ __('Label#withDescr') }</label>
                <Input vm={ this } prop="label" id="label" ref={ this.labelInput }/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="placeholder" class="form-label">{ __('Placeholder#withDescr') }</label>
                <Input vm={ this } prop="placeholder" id="placeholder"/>
                <InputErrors vm={ this } prop="placeholder"/>
            </FormGroupInline>
            { this.state.values.numRows !== undefined ? <FormGroupInline>
                <label htmlFor="numRows" class="form-label">{ __('Rows') }</label>
                <Input vm={ this } prop="numRows" id="numRows"/>
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
                <Input vm={ this } prop="name" id="name"/>
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
 * @returns {Number|String}
 */
function getNormalizedNumRows(input) {
    return input !== 0 ? input : '';
}

/**
 * @param {Number|String}
 * @param {Number}
 */
function getUnnormalizedNumRows(normalized) {
    return normalized !== '' ? normalized : 0;
}

/**
 * @param {CreateInputSettings} settings
 * @returns {Object}
 */
export default settings => ({
    name: `JetForms${settings.name}`,
    friendlyName: settings.friendlyName,
    editForm: InputBlockEditForm,
    stylesEditForm: InputBlockEditForm,
    createOwnProps(_defProps) {
        return {...{
            name: services.idGen.getNextId(),
            label: '',
            isRequired: 1,
            placeholder: settings.defaultPlaceholder || '',
        }, ...(settings.name !== 'TextareaInput'
            ? {}
            : {numRows: 0}
        )};
    },
    icon: settings.icon || 'box',
});
