import {__, env, hookForm, unhookForm, reHookValues, Input, InputErrors, FormGroup, FormGroupInline} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';

class SelectInputBlockEditForm extends preact.Component {
    // nameInput;
    /**
     * @param {RawBlockData} snapshot
     * @access public
     */
    overrideValues(snapshot) {
        reHookValues(this, [{name: 'name', value: snapshot.name},
                            {name: 'label', value: snapshot.label}]);
        this.setState({multiple: snapshot.multiple});
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
        ]), {
            multiple: block.multiple,
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
    render(_, {multiple}) {
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
                <span class="form-label">{ __('Multiple') }?</span>
                <label class="form-checkbox mt-0">
                    <input
                        onClick={ this.emitMultiple.bind(this) }
                        checked={ multiple }
                        type="checkbox"
                        class="form-input"/><i class="form-icon"></i>
                </label>
            </FormGroupInline>
            <FormGroup>
                <label htmlFor="options" class="form-label">{ __('Options') }</label>
                <textarea placeholder="Todo" class="form-input code"></textarea>
            </FormGroup>
        </div>;
    }
    /**
     * @param {Event} e
     * @access private
     */
    emitMultiple(e) {
        const multiple = e.target.checked ? 1 : 0;
        this.setState({multiple});
        this.props.onValueChanged(multiple, 'multiple');
    }
}

const initialData = {
    name: __('inputName'),
    label: '',
    options: JSON.stringify([
        {text: 'Option label', value: 'option-1'},
    ]),
    multiple: 0,
};

/**
 * @returns {Object}
 */
export default {
    name: 'JetFormsSelectInput',
    friendlyName: 'JetForms: Select input',
    ownPropNames: Object.keys(initialData),
    initialData,
    defaultRenderer: 'plugins/JetForms:block-input-select',
    icon: 'box',
    reRender({name, label, options, multiple, id}, _renderChildren) {
        return [
            '<div class="form-group" data-block-type="JetFormsSelectInput" data-block="', id, '">',
                !label ? '' : `<label class="form-label">${label}</label>`,
                '<select class="form-select" name="', name, '"', !multiple ? '' : ' multiple', '>'
            ].concat(
                JSON.parse(options).concat({text: '-', value: '-'}).map(({value, text}) =>
                    ['<option value="', value ,'">', __(text), '</option>']
                ).flat()
            ).concat([
                '</select>',
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
