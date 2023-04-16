import {__, http, env, LoadingSpinner, hookForm, unhookForm, FormGroupInline, Input,
        InputErrors, handleSubmit, Icon, validationConstraints} from '@sivujetti-commons-for-edit-app';

class MailSendSettingsManageDialog extends preact.Component {
    /**
     * @param {{floatingDialog: FloatingDialog;}} props
     */
    constructor(props) {
        super(props);
        this.state = {settings: null};
        http.get('/plugins/jet-forms/settings/mailSendSettings')
            .then(settings => { this.createState(settings); })
            .catch(env.window.console.error);
    }
    /**
     * @param {RawSendMailSettings} settings
     * @access private
     */
    createState(settings) {
        this.setState(hookForm(this, [
            {name: 'SMTP_host', value: settings.SMTP_host || 'mail.domain.com', validations: [['required'],
                ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Host')},
            {name: 'SMTP_port', value: settings.SMTP_port || '587', validations: [['required'], ['regexp', '^[0-9]*$'],
                ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Port')},
            {name: 'SMTP_username', value: settings.SMTP_username || 'my-username', validations: [['required'],
                ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Username')},
            {name: 'SMTP_password', value: settings.SMTP_password || 'my-pass', validations: [['required'],
                ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]], label: __('Password')},
        ], {
            sendingMethod: settings.sendingMethod || 'mail',
            SMTP_secureProtocol: settings.SMTP_secureProtocol || 'tls',
            showPasswordVisually: false,
        }));
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
    render(_, {sendingMethod, formIsSubmittingClass, showPasswordVisually}) {
        return <form onSubmit={ e => handleSubmit(this, this.applyCreateGlobalBlockTree.bind(this), e) }>
            <div class="mb-1">{ __('jetFormsTodo1') }</div>
            { sendingMethod ? [<div>
                <div class="form-label">{ __('Send method') }</div>
                <div class="button-options">
                    <button class={ `form-radio btn${sendingMethod === 'mail' ? ' selected' : ''}` } onClick={ () => this.handleSendMethodRadioClicked('mail') } type="button">
                        <span class="d-block mb-2">
                            <input type="radio" name="sendingMethod" checked={ sendingMethod === 'mail' } tabIndex="-1"/>
                            <i class="form-icon"></i><b class="h4">mail()</b>
                        </span>
                        <span>{ __('jetFormsTodo2') }</span>
                    </button>
                    <button class={ `form-radio btn${sendingMethod === 'smtp' ? ' selected' : ''}` } onClick={ () => this.handleSendMethodRadioClicked('smtp') } type="button">
                        <span class="d-block mb-2">
                            <input type="radio" name="sendingMethod" checked={ sendingMethod === 'smtp' } tabIndex="-1"/>
                            <i class="form-icon"></i><b class="h4">SMTP</b>
                        </span>
                        <span>{ __('jetFormsTodo3') }</span>
                    </button>
                </div>
            </div>,
            sendingMethod === 'smtp' ? <div class="form-horizontal">
                <FormGroupInline>
                    <label htmlFor="SMTP_host" class="form-label">{ __('Host') }</label>
                    <Input vm={ this } prop="SMTP_host"/>
                    <InputErrors vm={ this } prop="SMTP_host"/>
                </FormGroupInline>
                <FormGroupInline>
                    <label htmlFor="SMTP_port" class="form-label">{ __('Port') }</label>
                    <Input vm={ this } prop="SMTP_port"/>
                    <InputErrors vm={ this } prop="SMTP_port"/>
                </FormGroupInline>
                <FormGroupInline>
                    <label htmlFor="SMTP_username" class="form-label">{ __('Username') }</label>
                    <Input vm={ this } prop="SMTP_username"/>
                    <InputErrors vm={ this } prop="SMTP_username"/>
                </FormGroupInline>
                <FormGroupInline>
                    <label htmlFor="SMTP_password" class="form-label">{ __('Password') }</label>
                    <div class="has-icon-right">
                        <Input vm={ this } prop="SMTP_password" type={ !showPasswordVisually ? 'password' : 'text' }/>
                        <button
                            onClick={ () => this.setState({showPasswordVisually: !showPasswordVisually}) }
                            class="sivujetti-form-icon btn no-color"
                            type="button">
                            <Icon iconId={ !showPasswordVisually ? 'eye' : 'eye-off' } className="size-sm color-dimmed3"/>
                        </button>
                    </div>
                    <InputErrors vm={ this } prop="SMTP_password"/>
                </FormGroupInline>
                <FormGroupInline>
                    <label htmlFor="SMTP_secureProtocol" class="form-label">{ __('Encryption') }</label>
                    <select value={ this.state.SMTP_secureProtocol } onChange={ e => this.setState({SMTP_secureProtocol: e.target.value}) } class="form-select">
                        <option value="tls">tls</option>
                        <option value="ssl">ssl</option>
                        <option value="none">-</option>
                    </select>
                </FormGroupInline>
            </div> : null] : <LoadingSpinner/> }
            <div class="mt-8">
                <button
                    class={ `btn btn-primary mr-2${formIsSubmittingClass}` }
                    type="submit">{ __('Save send mail settings') }</button>
                <button
                    onClick={ () => this.props.floatingDialog.close() }
                    class="btn btn-link"
                    type="button">{ __('Cancel') }</button>
            </div>
        </form>;
    }
    /**
     * @param {'mail'|'smtp'} newValue
     * @access private
     */
    handleSendMethodRadioClicked(newValue) {
        if (this.state.sendingMethod !== newValue)
            this.setState({sendingMethod: newValue});
    }
    /**
     * @access private
     */
    applyCreateGlobalBlockTree() {
        const mailSendSettings = Object.assign(
            {
                sendingMethod: this.state.sendingMethod,
                SMTP_secureProtocol: this.state.SMTP_secureProtocol,
            },
            this.state.sendingMethod === 'mail'
                ? {
                    SMTP_host: '',
                    SMTP_port: '',
                    SMTP_username: '',
                    SMTP_password: '',
                }
                : this.state.values
        );
        return http.put('/plugins/jet-forms/settings/mailSendSettings', mailSendSettings)
            .then(resp => {
                if (resp.ok !== 'ok') throw new Error;
                this.props.floatingDialog.close();
            });
    }
}

/**
 * @typedef RawSendMailSettings
 *
 * @prop {String?} sendingMethod
 * @prop {String?} SMTP_host
 * @prop {String?} SMTP_port
 * @prop {String?} SMTP_username
 * @prop {String?} SMTP_password
 * @prop {String?} SMTP_secureProtocol
 */

export default MailSendSettingsManageDialog;
