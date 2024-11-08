import {__, api, env, http, Icon} from '@sivujetti-commons-for-edit-app';
import {openEditCaptchaSettingsDialog} from '../EditAppLeftColumnSection.jsx';
/** @typedef {import('../Settings/CaptchaDataEditDialog.jsx').CaptchaData} CaptchaData */

/** @extends {preact.Component<ConfigureBehaviourPanelProps && {selectedImpl: string|null;}, any>} */
class RunCaptchaBehaviourConfigurer extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        http.get('/plugins/jet-forms/settings/captchaData')
            .then(captchaData => { this.setState(this.createState(captchaData)); })
            .catch(err => {
                this.setState({availableMethods: null, message: __('Failed to fetch settings.')});
                env.window.console.error(err);
            });
    }
    /**
     * @access protected
     */
    render({selectedImpl}, {availableMethods, message}) {
        if (!availableMethods) return;
        if (message) return <div>{ message }</div>;
        return [
            <div class="with-icon text-small py-2">
                <span><Icon iconId="info-circle" className="size-xs color-dimmed3"/></span>
                <span class="color-dimmed">{ [
                    __('Voit konfiguroida tässä listattavia menetelmiä'),
                    ' ',
                    <a onClick={ e => { openEditCaptchaSettingsDialog(e); api.inspectorPanel.close(); } } href="#edit-captcha-settings">
                        { __('Edit captcha settings').toLowerCase() }
                    </a>,
                    __(' -näkymässä')
                ] }</span>
            </div>,
            <select
                onChange={ e => this.props.onConfigurationChanged({selectedImpl: e.target.value || null}) }
                value={ selectedImpl || '' }
                class="form-select mt-2"
                name="captchaMethod">
                { availableMethods.map(name =>
                    <option value={ name }>{ captchaNameToFriendlyName(name) }</option>
                ) }
                <option value="">{ __('None') }</option>
            </select>
        ];
    }
    /**
     * @param {CaptchaData|null} captchaData
     * @access private
     */
    createState(captchaData) {
        const dataAll = captchaData || {};
        const settings = dataAll.settings || [];
        const grecaptcha = settings.find(({name}) => name === 'grecaptcha') || {};
        return {
            availableMethods: [
                'jet-captcha',
                ...(grecaptcha && grecaptcha.siteKey && grecaptcha.secretKey ? [grecaptcha.name] : []),
            ]
        };
    }
}

/**
 * @param {string} name
 * @returns {string}
 */
function captchaNameToFriendlyName(name) {
    return ({
        'grecaptcha': 'reCAPTCHA',
        'jet-captcha': 'JetCaptcha',
    }[name]) || name;
}

export default () => ({
    configurerLabel: __('suorita captcha-testi menetelmällä'),
    getButtonLabel(data) {
        return data.selectedImpl
            ? captchaNameToFriendlyName(data.selectedImpl)
            : __('None').toLowerCase();
    },
    configurerCls: RunCaptchaBehaviourConfigurer
});
