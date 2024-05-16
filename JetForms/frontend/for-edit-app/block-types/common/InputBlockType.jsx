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
import services from '../../services.js';
import InputEditFormAbstract from './InputEditFormAbstract.jsx';
import {createVisualEditFormAuto} from './style-forms-utils.js';

class InputBlockEditForm extends InputEditFormAbstract {
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {block, emitValueChangedThrottled} = this.props;
        const {name, label, placeholder, isRequired, numRows} = block;
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [...[
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: 'Id', onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'name', hasErrors, source);
            }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: __('Label#withDescr'), onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'label', hasErrors, source);
            }},
            {name: 'placeholder', value: placeholder, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
             label: __('Placeholder#withDescr'), onAfterValueChanged: (value, hasErrors, source) => {
                emitValueChangedThrottled(value, 'placeholder', hasErrors, source);
            }},
        ], ...(blockIsTextarea(block)
            ? [{name: 'numRows', value: getNormalizedNumRows(numRows), validations: [['min', 0], ['max', 2000]],
                label: __('Rows'), type: 'number', step: '1', onAfterValueChanged: (value, hasErrors, source) => {
                    emitValueChangedThrottled(getUnnormalizedNumRows(value), 'numRows', hasErrors, source);
                }}]
            : []
        )], {
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
        const isTextarea = blockIsTextarea(block);
        if (props.lastBlockTreeChangeEventInfo?.isUndoOrRedo && (
            this.state.values.name !== block.name ||
            this.state.values.label !== block.label ||
            this.state.values.placeholder !== block.placeholder ||
            (isTextarea && getUnnormalizedNumRows(this.state.values.numRows) !== block.numRows)
        )) {
            reHookValues(this, [
                {name: 'name', value: block.name},
                {name: 'label', value: block.label},
                {name: 'placeholder', value: block.placeholder},
                ...(isTextarea
                    ? [{name: 'numRows', value: getNormalizedNumRows(block.numRows)}]
                    : []
                )
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
            { this.renderIsRequiredFormGroup() }
            { this.showTechnicalInputs ? <FormGroupInline>
                <label htmlFor="name" class="form-label">Id</label>
                <Input vm={ this } prop="name" id="name"/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>;
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
 * @param {Number|String} normalized
 * @returns {Number}
 */
function getUnnormalizedNumRows(normalized) {
    return normalized !== '' ? normalized : 0;
}

/**
 * @param {Block} block
 * @returns {Boolean}
 */
function blockIsTextarea(block) {
    return block.numRows !== undefined;
}

/**
 * @param {CreateInputSettings} settings
 * @returns {Object}
 */
export default settings => ({
    name: `JetForms${settings.name}`,
    friendlyName: settings.friendlyName,
    editForm: InputBlockEditForm,
    stylesEditForm: settings.StylesEditForm || createVisualEditFormAuto(settings.name),
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
