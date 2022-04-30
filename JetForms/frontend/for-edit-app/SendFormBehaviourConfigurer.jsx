import {__, hookForm, unhookForm, reHookValues, Input, Textarea, FormGroupInline, FormGroup, InputErrors} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import {createTrier} from '../../../../../frontend/webpage/src/EditAppAwareWebPage.js';

class SendFormBehaviourConfigurer extends preact.Component {
    // subjectInputEl;
    // bodyTemplateInputEl;
    /**
     * @access protected
     */
    componentWillMount() {
        this.subjectInputEl = preact.createRef();
        this.bodyTemplateInputEl = preact.createRef();
        const {data} = this.props.behaviour;
        this.setState(hookForm(this, [
            {name: 'subjectTemplate', value: data.subjectTemplate, validations: [['required'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Subject'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({subjectTemplate: value}); }},
            {name: 'toAddress', value: data.toAddress, validations: [['required'], ['regexp', '^.+@.+$'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('To (email)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({toAddress: value}); }},
            {name: 'toName', value: data.toName, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('To (name)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({toName: value});console.log(value); }},
            {name: 'fromAddress', value: data.fromAddress, validations: [['required'], ['regexp', '^.+@.+$'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('From (email)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({fromAddress: value}); }},
            {name: 'fromName', value: data.fromName, validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('From (name)'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({fromName: value});console.log(value); }},
            {name: 'bodyTemplate', value: data.bodyTemplate, validations: [['required'], ['maxLength', validationConstraints.HARD_LONG_TEXT_MAX_LEN]], label: __('Body'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({bodyTemplate: value}); }},
        ]));
    }
    /**
     * @access protected
     */
    componentWillReceiveProps(props) {
        if (props.behaviour === this.props.behaviour)
            return;
        const {data} = props.behaviour;
        reHookValues(this, [
            {name: 'subjectTemplate', value: data.subjectTemplate},
            {name: 'toAddress', value: data.toAddress},
            {name: 'toName', value: data.toName},
            {name: 'fromAddress', value: data.fromAddress},
            {name: 'fromName', value: data.fromName},
            {name: 'bodyTemplate', value: data.bodyTemplate}
        ]);
    }
    /**
     * @access protected
     */
    componentDidMount() {
        setFocusTo(this.subjectInputEl);
        createTrier(() => {
            let textareaEl = this.bodyTemplateInputEl.current.inputEl.current;
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
            <FormGroupInline>
                <label htmlFor="subjectTemplate" class="form-label">{ __('Subject') }</label>
                <Input vm={ this } prop="subjectTemplate" ref={ this.subjectInputEl }/>
                <InputErrors vm={ this } prop="subjectTemplate"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="toAddress" class="form-label">{ __('To (email)') }</label>
                <Input vm={ this } prop="toAddress"/>
                <InputErrors vm={ this } prop="toAddress"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="toName" class="form-label">{ __('To (name)') }</label>
                <Input vm={ this } prop="toName"/>
                <InputErrors vm={ this } prop="toName"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="fromAddress" class="form-label">{ __('From (email)') }</label>
                <Input vm={ this } prop="fromAddress"/>
                <InputErrors vm={ this } prop="fromAddress"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="fromName" class="form-label">{ __('From (name)') }</label>
                <Input vm={ this } prop="fromName"/>
                <InputErrors vm={ this } prop="fromName"/>
            </FormGroupInline>
            <FormGroup>
                <label htmlFor="bodyTemplate" class="form-label">{ __('Body') }</label>
                <Textarea vm={ this } prop="bodyTemplate" class="form-input code" ref={ this.bodyTemplateInputEl }/>
                <InputErrors vm={ this } prop="bodyTemplate"/>
            </FormGroup>
        </div>;
    }
}

export default SendFormBehaviourConfigurer;
