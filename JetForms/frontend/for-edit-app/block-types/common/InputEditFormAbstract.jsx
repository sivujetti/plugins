import {__, api, FormGroupInline} from '@sivujetti-commons-for-edit-app';

class InputEditFormAbstract extends preact.Component {
    // showTechnicalInputs;
    /**
     * @param {BlockEditFormProps} props
     */
    constructor(props) {
        super(props);
        this.showTechnicalInputs = api.user.getRole() <= api.user.ROLE_ADMIN_EDITOR;
    }
    /**
     * @param {Event} e
     * @access protected
     */
    emitIsRequired(e) {
        const isRequired = e.target.checked ? 1 : 0;
        this.props.emitValueChanged(isRequired, 'isRequired');
    }
    /**
     * @returns {preact.VNode}
     * @access protected
     */
    renderIsRequiredFormGroup() {
        return <FormGroupInline>
            <span class="form-label">{ __('Required') }?</span>
            <label class="form-checkbox mt-0">
                <input
                    onClick={ this.emitIsRequired.bind(this) }
                    checked={ this.state.isRequired }
                    type="checkbox"
                    class="form-input"/><i class="form-icon"></i>
            </label>
        </FormGroupInline>;
    }
}

export default InputEditFormAbstract;
