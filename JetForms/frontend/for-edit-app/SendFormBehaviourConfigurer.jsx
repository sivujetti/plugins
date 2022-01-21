import {__, hookForm, unhookForm, reHookValues, Input, Textarea, FormGroupInline, FormGroup, InputErrors} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../frontend/edit-app/src/constants.js';
import setFocusTo from '../../../../../frontend/edit-app/src/block-types/auto-focusers.js';

class SendFormBehaviourConfigurer extends preact.Component {
    // subjectInputEl;
    /**
     * @access protected
     */
    componentWillMount() {
        this.subjectInputEl = preact.createRef();
        const {data} = this.props.behaviour;
        this.setState(hookForm(this, [
            {name: 'subjectTemplate', value: data.subjectTemplate, validations: [['required'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Subject'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({subjectTemplate: value}); }},
            {name: 'toAddress', value: data.toAddress, validations: [['required'], ['regexp', '^.+@.+$'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('To'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({toAddress: value}); }},
            {name: 'fromAddress', value: data.fromAddress, validations: [['required'], ['regexp', '^.+@.+$'], ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('From'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({fromAddress: value}); }},
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
            {name: 'fromAddress', value: data.fromAddress},
            {name: 'bodyTemplate', value: data.bodyTemplate}
        ]);
    }
    /**
     * @access protected
     */
    componentDidMount() {
        setFocusTo(this.subjectInputEl);
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
                <label htmlFor="toAddress" class="form-label">{ __('To') }</label>
                <Input vm={ this } prop="toAddress"/>
                <InputErrors vm={ this } prop="toAddress"/>
            </FormGroupInline>
            <FormGroupInline>
                <label htmlFor="fromAddress" class="form-label">{ __('From') }</label>
                <Input vm={ this } prop="fromAddress"/>
                <InputErrors vm={ this } prop="fromAddress"/>
            </FormGroupInline>
            <FormGroup>
                <label htmlFor="bodyTemplate" class="form-label">{ __('Body') }</label>
                <Textarea vm={ this } prop="bodyTemplate"/>
                <InputErrors vm={ this } prop="bodyTemplate"/>
            </FormGroup>
        </div>;
    }
}

export default SendFormBehaviourConfigurer;
