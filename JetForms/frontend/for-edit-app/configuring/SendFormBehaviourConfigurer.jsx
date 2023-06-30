import {__, api, Icon, hookForm, unhookForm, reHookValues, Input, Textarea, FormGroupInline,
        FormGroup, InputErrors, validationConstraints} from '@sivujetti-commons-for-edit-app';
import {createTrier} from '../../../../../../frontend/edit-app/src/block/dom-commons.js';
import setFocusTo from '../../../../../../frontend/edit-app/src/block-types/auto-focusers.js';

class SendFormBehaviourConfigurer extends preact.Component {
    // subjectInputEl;
    // bodyTemplateInputEl;
    // showTechnicalInputs;
    /**
     * @access protected
     */
    componentWillMount() {
        this.subjectInputEl = preact.createRef();
        this.bodyTemplateInputEl = preact.createRef();
        this.showTechnicalInputs = api.user.getRole() < api.user.ROLE_EDITOR;
        this.setState(hookForm(this, [
            {name: 'subjectTemplate', value: this.props.subjectTemplate, validations: [['required'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Subject'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({subjectTemplate: value}); }},
            {name: 'toAddress', value: this.props.toAddress, validations: [['required'], ['regexp', '^.+@.+$'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('To (email)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({toAddress: value}); }},
            {name: 'toName', value: this.props.toName, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('To (name)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({toName: value}); }},
            {name: 'fromAddress', value: this.props.fromAddress, validations: [['required'], ['regexp', '^.+@.+$'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('From (email)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({fromAddress: value}); }},
            {name: 'fromName', value: this.props.fromName, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('From (name)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({fromName: value}); }},
            {name: 'bodyTemplate', value: this.props.bodyTemplate, validations: [['required'], ['maxLength', validationConstraints.HARD_LONG_TEXT_MAX_LEN]], label: __('Body'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({bodyTemplate: value}); }},
        ]));
    }
    /**
     * @param {{subjectTemplate: String; toAddress: String; toName: String; fromAddress: String; fromName: String; bodyTemplate; onConfigurationChanged: (vals: {[propName: String]: any;}) => void;}} props
     * @access protected
     */
    componentWillReceiveProps(props) {
        const {subjectTemplate, toAddress, toName, fromAddress, fromName, bodyTemplate} = props;
        const [subjectTemplate2, toAddress2, toName2, fromAddress2, fromName2, bodyTemplate2] = [
            this.props.subjectTemplate, this.props.toAddress, this.props.toName, this.props.fromAddress,
            this.props.fromName, this.props.bodyTemplate
        ];
        if (subjectTemplate + toAddress + toName + fromAddress + fromName + bodyTemplate !==
            subjectTemplate2 + toAddress2 + toName2 + fromAddress2 + fromName2 + bodyTemplate2)
            reHookValues(this, [
                {name: 'subjectTemplate', value: subjectTemplate},
                {name: 'toAddress', value: toAddress},
                {name: 'toName', value: toName},
                {name: 'fromAddress', value: fromAddress},
                {name: 'fromName', value: fromName},
                {name: 'bodyTemplate', value: bodyTemplate}
            ]);
    }
    /**
     * @access protected
     */
    componentDidMount() {
        setFocusTo(this.subjectInputEl);
        if (this.showTechnicalInputs) createTrier(() => {
            const textareaEl = this.bodyTemplateInputEl.current.inputEl.current;
            if (!textareaEl || textareaEl.value === undefined) return false;
            window.autosize(textareaEl);
            return true;
        }, 50, 10)();
    }
    /**
     * @access protected
     */
    componentWillUnmount() {
        unhookForm(this);
    }
    /**
     * @access protected
     */
    render(_) {
        return <div class="form-horizontal pt-0">
            { this.showTechnicalInputs ?
            <FormGroupInline>
                <label htmlFor="subjectTemplate" class="form-label">{ __('Subject') }</label>
                <Input vm={ this } prop="subjectTemplate" ref={ this.subjectInputEl }/>
                <InputErrors vm={ this } prop="subjectTemplate"/>
            </FormGroupInline> : <div class="with-icon text-tiny py-1">
                <Icon iconId="info-circle" className="size-xs"/>
                <span class="color-dimmed">{ __('useYourOwnEmailHereHint') }</span>
            </div> }
            <FormGroupInline>
                <label htmlFor="toAddress" class="form-label" title={ __('To (email)') }>{ __('To (email)') }</label>
                <Input vm={ this } prop="toAddress"/>
                <InputErrors vm={ this } prop="toAddress"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="toName" class="form-label" title={ __('To (name)') }>{ __('To (name)') }</label>
                <Input vm={ this } prop="toName"/>
                <InputErrors vm={ this } prop="toName"/>
            </FormGroupInline>
            { this.showTechnicalInputs ? [<FormGroupInline>
                <label htmlFor="fromAddress" class="form-label">{ __('From (email)') }</label>
                <Input vm={ this } prop="fromAddress"/>
                <InputErrors vm={ this } prop="fromAddress"/>
            </FormGroupInline>,
            <FormGroupInline>
                <label htmlFor="fromName" class="form-label">{ __('From (name)') }</label>
                <Input vm={ this } prop="fromName"/>
                <InputErrors vm={ this } prop="fromName"/>
            </FormGroupInline>,
            <FormGroup>
                <label htmlFor="bodyTemplate" class="form-label">{ __('Body') }</label>
                <Textarea vm={ this } prop="bodyTemplate" class="form-input code" ref={ this.bodyTemplateInputEl }/>
                <InputErrors vm={ this } prop="bodyTemplate"/>
            </FormGroup>] : null }
        </div>;
    }
}

export default SendFormBehaviourConfigurer;
