import {
    __,
    env,
    FormGroupInline,
    handleSubmit,
    hasErrors,
    hookForm,
    http,
    Icon,
    Input,
    InputErrors,
    LoadingSpinner,
    reHookValues,
    Textarea,
    validationConstraints,
} from '@sivujetti-commons-for-edit-app';

const settingBoxes = [
    {
        name: 'jet-captcha',
        title: `JetCaptcha (${__('Default').toLowerCase()})`,
        description: __('Invisible CAPTCHA test for the user, based\non the time taken to complete the form'),
        getFormGroups(vm) {
            return [
                <FormGroupInline>
                    <label htmlFor="jetCaptchaMinFillTime" class="form-label">
                        { __('Min. form fill time') }
                        <span class="tooltip tooltip-right p-absolute mt-1 ml-1" data-tooltip={ __('Submission time in seconds; forms submitted faster\nthan this will be interpreted as sent by a bot') }>
                            <Icon iconId="info-circle" className="color-dimmed3 size-xs"/>
                        </span>
                    </label>
                    <Input vm={ vm } prop="minFormFillTime" id="jetCaptchaMinFillTime" inputMode="numeric"/>
                    <InputErrors vm={ vm } prop="minFormFillTime"/>
                </FormGroupInline>,
            ];
        }
    },
    {
        name: 'grecaptcha',
        title: 'Google reCaptcha',
        description: __('Invisible CAPTCHA test for the user, using\nGoogle\'s reCAPTCHA v3 service'),
        getFormGroups(vm) {
            return [
                <FormGroupInline>
                    <label htmlFor="grecaptchaSiteKey" class="form-label">
                        { __('Site key') }
                        <span class="tooltip tooltip-right tooltip-auto-width p-absolute mt-1 ml-1" data-tooltip={ __('A string found on the settings page of Google\'s\nadmin panel (google.com/recaptcha/admin)') }>
                            <Icon iconId="info-circle" className="color-dimmed3 size-xs"/>
                        </span>
                    </label>
                    <Textarea vm={ vm } prop="siteKey" id="grecaptchaSiteKey"/>
                    <InputErrors vm={ vm } prop="siteKey"/>
                </FormGroupInline>,
                <FormGroupInline>
                    <label htmlFor="grecaptchaSecretKey" class="form-label">{ __('Secret key') }</label>
                    <Textarea vm={ vm } prop="secretKey" id="grecaptchaSecretKey"/>
                    <InputErrors vm={ vm } prop="secretKey"/>
                </FormGroupInline>,
                <FormGroupInline>
                    <label htmlFor="minScore" class="form-label">{ __('Min. score') }</label>
                    <Input vm={ vm } prop="minScore" id="minScore" inputMode="numeric"/>
                    <InputErrors vm={ vm } prop="minScore"/>
                </FormGroupInline>,
            ];
        }
    }
];

class CaptchaDataEditDialog extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        http.get('/plugins/jet-forms/settings/captchaData')
            .then(captchaData => { this.setState(this.createState(captchaData)); })
            .catch(err => {
                this.setState({captchaData: null, message: __('Failed to fetch settings.')});
                env.window.console.error(err);
            });
    }
    /**
     * @param {{floatingDialog: FloatingDialog;}} props
     * @access protected
     */
    render(_, {captchaData, message, formIsSubmittingClass}) {
        let content;
        if (captchaData === undefined) {
            content = <LoadingSpinner className="mb-2"/>;
        } else if (!message) {
            content = [
                <p class="text-prose">{ __('In this view, you can edit the general captcha settings for your site.') }</p>,
                <ul class="color-dimmed list mb-2 styles-list">
                    { settingBoxes.map(impl => <li class="p-2">
                        <div class="d-grid pt-2 pr-2" style="grid-template-columns: 1fr auto;">
                            <h6 class="pt-2 pl-2">
                                { impl.title }
                                    <span class="tooltip tooltip-right tooltip-auto-width p-absolute ml-1" data-tooltip={ impl.description }>
                                        <Icon iconId="info-circle" className="color-dimmed3 size-xs"/>
                                </span>
                            </h6>
                            { impl.name !== 'jet-captcha'
                                ? <button onClick={ () => this.clearSettings(impl.name) } class="btn btn-sm color-dimmed" type="button">{ __('Clear') }</button>
                                : null }
                        </div>
                        <div class="form-horizontal p-2">
                            { impl.getFormGroups(this) }
                        </div>
                    </li>) }
                </ul>
            ];
        } else {
            content = <div>{ message }</div>;
        }
        return <form onSubmit={ e => handleSubmit(this, this.saveSettingsToBacked.bind(this), e) }>
            { content }
            <div class="mt-8">
                <button
                    class={ `btn btn-primary mr-2${formIsSubmittingClass}` }
                    type="submit"
                    disabled={ hasErrors(this) }>{ __('Save settings') }</button>
                <button
                    onClick={ () => this.props.floatingDialog.close() }
                    class="btn btn-link"
                    type="button">{ __('Cancel') }</button>
            </div>
        </form>;
    }
    /**
     * @param {{settings: Array<{name: string; data: {siteKey: string; secretKey: string; minScore: number;}|{minFormFillTime: number;}|{[prop: string]: any;};}>;}|null} captchaData
     * @access private
     */
    createState(captchaData) {
        const dataAll = captchaData || {};
        const settings = dataAll.settings || [];
        const jetCaptcha = settings.find(({name}) => name === 'jet-captcha') || {};
        const reCaptcha = settings.find(({name}) => name === 'grecaptcha') || {};
        return hookForm(this, [
            // JetCaptcha
            {name: 'minFormFillTime', value: jetCaptcha.minFormFillTime || '4',
                validations: [['min', 1], ['max', 60 * 24]],
                label: __('Min. form fill time')},
            // ReCaptcha
            {name: 'siteKey', value: reCaptcha.siteKey || '',
                validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
                label: __('Site key')},
            {name: 'secretKey', value: reCaptcha.secretKey || '',
                validations: [['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]],
                label: __('Secret key')},
            {name: 'minScore', value: (reCaptcha.minScore || 0.5).toString(),
                validations: [['min', 0], ['max', 1]], label: __('Min. score')},
        ], {
            captchaData: dataAll,
        });
    }
    /**
     * @param {string} kind
     * @access private
     */
    clearSettings(kind) {
        if (kind === 'grecaptcha')
            reHookValues(this, [
                {name: 'siteKey', value: ''},
                {name: 'secretKey', value: ''},
                {name: 'minScore', value: '0.5'},
            ]);
    }
    /**
     * @access private
     */
    async saveSettingsToBacked() {
        const {values} = this.state;
        const data = {
            jetCaptcha: {
                name: 'jet-captcha',
                minFormFillTime: parseInt(values.minFormFillTime, 10),
            },
            grecaptcha: {
                name: 'grecaptcha',
                ...(values.siteKey.trim().length > 1 && values.secretKey.trim().length > 1 ? {
                    siteKey: values.siteKey,
                    secretKey: values.secretKey,
                } : {
                    siteKey: '',
                    secretKey: '',
                }),
                minScore: parseFloat(values.minScore),
            },
        };
        return http.put('/plugins/jet-forms/settings/captchaData', data)
            .then(resp => {
                if (resp.ok !== 'ok') throw new Error;
                this.props.floatingDialog.close();
            });
    }
}

export default CaptchaDataEditDialog;
