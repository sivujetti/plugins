import {__, hookForm, reHookValues, hasErrors, Textarea, InputErrors,
        FormGroupInline} from '@sivujetti-commons-for-edit-app';

class SelectInputOptionEditForm extends preact.Component {
    /**
     * @param {{item: {text: String;}; onValueChanged: (value: String, key: 'text') => void; done: () => void;}} props
     */
    constructor(props) {
        super(props);
        this.state = hookForm(this, [
            {name: 'text', value: props.item.text, validations: [['minLength', 1]], label: __('Option text'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onValueChanged(value, 'text'); }},
        ]);
    }
    /**
     * @param {{text: String;}} item
     * @access public
     */
    overrideValues(item) {
        reHookValues(this, [{name: 'text', value: item.text}]);
    }
    /**
     * @access protected
     */
    render({done}) {
        return <div class="form-horizontal pt-0">
            <button
                onClick={ () => done() }
                class="btn btn-sm"
                disabled={ hasErrors(this) }
                title={ __('Done') }>&lt;</button>
            <FormGroupInline className="mt-0">
                <label htmlFor="text" class="form-label">{ __('Option text') }</label>
                <Textarea vm={ this } prop="text" rows="3"/>
                <InputErrors vm={ this } prop="text"/>
            </FormGroupInline>
        </div>;
    }
}

export default SelectInputOptionEditForm;
