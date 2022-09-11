import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors,
        FormGroup, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import CrudList from './CrudList.jsx';
import SelectInputOptionEditForm from './SelectInputOptionEditForm.jsx';
import services from './services.js';
import InputEditFormAbstract from './InputEditFormAbstract.jsx';

class SelectInputBlockEditForm extends InputEditFormAbstract {
    // nameInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, label, multiple, options} = getBlockCopy();
        this.nameInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
        ], {
            multiple,
            optionsJson: options,
            optionsParsed: JSON.parse(options),
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label))
                reHookValues(this, [{name: 'name', value: block.name},
                                    {name: 'label', value: block.label}]);
            if (this.state.multiple !== block.multiple)
                this.setState({multiple: block.multiple});
            if (this.state.optionsJson !== block.options)
                this.setState({optionsJson: block.options, optionsParsed: JSON.parse(block.options)});
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
    render(_, {multiple, optionsParsed}) {
        if (!this.state.values) return;
        return [<div class="form-horizontal py-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Label_with_descr') }</label>
                <Input vm={ this } prop="label"/>
                <InputErrors vm={ this } prop="label"/>
            </FormGroupInline>
            <FormGroupInline>
                <span class="form-label">{ __('Multiple') }?</span>
                <label class="form-checkbox mt-0">
                    <input
                        onClick={ this.emitMultiple.bind(this) }
                        checked={ multiple === 1 }
                        type="checkbox"
                        class="form-input"/><i class="form-icon"></i>
                </label>
            </FormGroupInline>
            { this.showTechnicalInputs ? <FormGroupInline>
                <label htmlFor="name" class="form-label">Id</label>
                <Input vm={ this } prop="name" ref={ this.nameInput }/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>,
        <FormGroup>
            <label htmlFor="options" class="form-label pt-0 pb-1">{ __('Options') }</label>
            <CrudList
                items={ optionsParsed }
                itemTitleKey="text"
                onListMutated={ this.emitOptions.bind(this) }
                createNewItem={ () => ({text: __('Option text')}) }
                editForm={ SelectInputOptionEditForm }
                itemTypeFriendlyName={ __('option') }/>
        </FormGroup>];
    }
    /**
     * @param {Event} e
     * @access private
     */
    emitMultiple(e) {
        const multiple = e.target.checked ? 1 : 0;
        this.props.emitValueChanged(multiple, 'multiple', false, env.normalTypingDebounceMillis);
    }
    /**
     * @param {Array<{text: String;}>} list
     * @access private
     */
    emitOptions(list) {
        const withReAssignedValues = list.map((item, i) =>
            Object.assign({}, item, {value: `option-${i + 1}`}))
        ;
        this.props.emitValueChanged(JSON.stringify(withReAssignedValues), 'options', false, env.normalTypingDebounceMillis);
    }
}

const blockTypeName = 'JetFormsSelectInput';

export default {
    name: blockTypeName,
    friendlyName: 'Select input (JetForms)',
    initialData: () => ({
        name: services.idGen.getNextId(),
        label: '',
        options: JSON.stringify([
            {text: __('Option text'), value: 'option-1'},
        ]),
        multiple: 0,
    }),
    defaultRenderer: 'plugins/JetForms:block-input-select',
    icon: 'selector',
    reRender({name, label, options, multiple, id, styleClasses}, renderChildren) {
        return [
            '<div class="j-', blockTypeName,
                    styleClasses ? ` ${styleClasses}` : '',
                    ' form-group" data-block-type="', blockTypeName, '" data-block="', id, '">',
                !label ? '' : `<label class="form-label" for="${name}">${label}</label>`,
                '<select class="form-select" name="', name, !multiple ? '"' : '[]" multiple', '>'
            ].concat(
                JSON.parse(options).concat({text: '-', value: '-'}).map(({value, text}) =>
                    ['<option value="', value , '">', __(text), '</option>']
                ).flat()
            ).concat([
                '</select>',
                renderChildren(),
            '</div>'
        ]).join('');
    },
    createSnapshot: from => ({
        name: from.name,
        label: from.label,
        options: from.options,
        multiple: from.multiple,
    }),
    editForm: SelectInputBlockEditForm,
};
