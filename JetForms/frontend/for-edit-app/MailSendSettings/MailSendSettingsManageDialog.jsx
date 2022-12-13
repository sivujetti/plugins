import {__, http, env, LoadingSpinner, hookForm, unhookForm, FormGroupInline, Input, InputErrors, handleSubmit} from '@sivujetti-commons-for-edit-app';
import {validationConstraints} from '../../../../../../frontend/edit-app/src/constants.js';

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
    render(_, {sendingMethod, formIsSubmittingClass}) {
        return <form onSubmit={ e => handleSubmit(this, this.applyCreateGlobalBlockTree.bind(this), e) }>
            <div class="mb-1">{ __('jetFormsTodo1') }</div>
            { sendingMethod ? [<div>
                <div class="form-label">{ __('Send method') }</div>
                <div class="button-options">
                    <label class={ `form-radio box${sendingMethod === 'mail' ? ' selected' : ''}` }>
                        <span class="d-block mb-2">
                            <input type="radio" name="sendingMethod"
                                checked={ sendingMethod === 'mail' }
                                onClick={ this.handleSendMethodRadioClicked.bind(this) }
                                value="mail"/>
                            <i class="form-icon"></i><b class="h4">mail()</b>
                        </span>
                        <span>{ __('jetFormsTodo2') }</span>
                    </label>
                    <label class={ `form-radio box${sendingMethod === 'smtp' ? ' selected' : ''}` }>
                        <span class="d-block mb-2">
                            <input type="radio" name="sendingMethod"
                                checked={ sendingMethod === 'smtp' }
                                onClick={ this.handleSendMethodRadioClicked.bind(this) }
                                value="smtp"/>
                            <i class="form-icon"></i><b class="h4">SMTP</b>
                        </span>
                        <span>{ __('jetFormsTodo3') }</span>
                    </label>
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
                    <Input vm={ this } prop="SMTP_password"/>
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
     * @param {Event} e
     * @access private
     */
    handleSendMethodRadioClicked(e) {
        const newValue = e.target.value;
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
