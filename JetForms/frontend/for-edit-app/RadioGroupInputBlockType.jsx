import {__, api, env, hookForm, unhookForm, reHookValues, Input, InputErrors,
        FormGroup, FormGroupInline, validationConstraints} from '@sivujetti-commons-for-edit-app';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import CrudList from './CrudList.jsx';
import InputEditFormAbstract from './InputEditFormAbstract.jsx';
import SelectOrRadioGroupInputOptionEditForm, {createSelectOrOptionSelectItemCreator} from './SelectOrRadioGroupInputOptionEditForm.jsx';
import services from './services.js';

class RadioGroupInputBlockEditForm extends InputEditFormAbstract {
    // valueCreator;
    // showTechnicalInputs;
    // labelInput;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, emitValueChanged, grabChanges} = this.props;
        const {name, label, radios, isRequired} = getBlockCopy();
        const radiosParsed = JSON.parse(radios);
        this.valueCreator = createSelectOrOptionSelectItemCreator(radiosParsed.map(({value}) => value));
        this.showTechnicalInputs = api.user.getRole() < api.user.ROLE_EDITOR;
        this.labelInput = preact.createRef();
        this.setState(hookForm(this, [
            {name: 'name', value: name, validations: [['identifier'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: 'Id',
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'name', hasErrors, env.normalTypingDebounceMillis); }},
            {name: 'label', value: label, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Label'),
             onAfterValueChanged: (value, hasErrors) => { emitValueChanged(value, 'label', hasErrors, env.normalTypingDebounceMillis); }},
        ], {
            radios,
            radiosParsed,
            isRequired,
        }));
        grabChanges((block, _origin, isUndo) => {
            if (isUndo && (this.state.values.name !== block.name ||
                           this.state.values.label !== block.label))
                reHookValues(this, [{name: 'name', value: block.name},
                                    {name: 'label', value: block.label}]);
            if (this.state.radios !== block.radios) {
                const radiosParsed = JSON.parse(block.radios);
                this.valueCreator = createSelectOrOptionSelectItemCreator(radiosParsed.map(({value}) => value));
                this.setState({radios: block.radios, radiosParsed});
            }
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
    render(_, {radiosParsed, isRequired}) {
        if (!this.state.values) return;
        return [<div class="form-horizontal py-0">
            <FormGroupInline>
                <label htmlFor="label" class="form-label">{ __('Label_with_descr') }</label>
                <Input vm={ this } prop="label" ref={ this.labelInput }/>
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
                <Input vm={ this } prop="name"/>
                <InputErrors vm={ this } prop="name"/>
            </FormGroupInline> : null }
        </div>,
        <FormGroup>
            <label htmlFor="radios" class="form-label pt-0 pb-1">{ __('Options') }</label>
            <CrudList
                items={ radiosParsed }
                itemTitleKey="text"
                getTitle={ item => !this.showTechnicalInputs ? item.text : [`${item.text} `, <i class="color-dimmed">({item.value})</i>] }
                onListMutated={ this.emitRadios.bind(this) }
                createNewItem={ this.valueCreator.createNewItem.bind(this.valueCreator) }
                editForm={ SelectOrRadioGroupInputOptionEditForm }
                editFormProps={ {showValueInput: this.showTechnicalInputs} }
                itemTypeFriendlyName={ __('option') }/>
        </FormGroup>];
    }
    /**
     * @param {Array<{text: String; value: String;}>} list
     * @access private
     */
    emitRadios(list) {
        this.props.emitValueChanged(JSON.stringify(list), 'radios', false, env.normalTypingDebounceMillis);
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

const blockTypeName = 'JetFormsRadioGroupInput';

export default {
    name: blockTypeName,
    friendlyName: 'Radio group (JetForms)',
    initialData: () => ({
        name: services.idGen.getNextId(),
        label: '',
        radios: JSON.stringify([createSelectOrOptionSelectItemCreator().createNewItem()]),
        isRequired: 1,
    }),
    defaultRenderer: 'plugins/JetForms:block-input-radio-group',
    icon: 'circle',
    reRender({name, label, radios, isRequired, id, styleClasses}, renderChildren) {
        return ['<div class="j-', blockTypeName,
            styleClasses ? ` ${styleClasses}` : '',
            ' form-group" data-block-type="', blockTypeName, '" data-block="', id, '">',
            '<div class="form-label">', label, '</div>',
            ...JSON.parse(radios).map(radio => ['<label class="form-radio">',
                '<input name="', name, '" value="', radio.value, '" type="radio"', isRequired ? ' data-pristine-required' : '', '>',
                '<i class="form-icon"></i> ', radio.text,
            '</label>']).flat(),
            renderChildren(),
        '</div>'].join('');
    },
    createSnapshot: from => ({
        name: from.name,
        label: from.label,
        radios: from.radios,
        isRequired: from.isRequired,
    }),
    editForm: RadioGroupInputBlockEditForm,
};
