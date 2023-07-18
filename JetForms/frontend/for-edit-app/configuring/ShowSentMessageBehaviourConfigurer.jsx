import {__, hookForm, unhookForm, reHookValues, FormGroupInline, Textarea, InputErrors,
        validationConstraints} from '@sivujetti-commons-for-edit-app';

class ShowSentMessageBehaviourConfigurer extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        this.setState(hookForm(this, [
            {name: 'message', value: this.props.message, validations: [
                ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Message'),
             onAfterValueChanged: (value, hasErrors) => { if (!hasErrors) this.props.onConfigurationChanged({message: value}); }},
        ]));
    }
    /**
     * @param {{at: 'beforeFirstInput'; message: String;} & ConfigureBehaviourPanelProps} props
     * @access protected
     */
    componentWillReceiveProps(props) {
        if (props.message !== this.state.values.message)
            reHookValues(this, [{name: 'message', value: props.message}]);
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
    render() {
        return [
            <select class="form-select" disabled>
                <option>Lomakkeen yläpuolella</option>
            </select>,
            <FormGroupInline>
                <label class="form-label" htmlFor="message">{ __('Message') }</label>
                <Textarea vm={ this } prop="message" rows="1"/>
                <InputErrors vm={ this } prop="message"/>
            </FormGroupInline>
        ];
    }
}

export default () => ({
    configurerLabel: __('näytä käyttäjälle viesti'),
    getButtonLabel(data) { return data.at === 'beforeFirstInput' ? __('lomakkeen yläpuolella') : '?'; },
    configurerCls: ShowSentMessageBehaviourConfigurer,
    isTerminator: true,
});
