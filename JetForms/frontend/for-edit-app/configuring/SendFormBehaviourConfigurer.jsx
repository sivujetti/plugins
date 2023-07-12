import {__, api, Icon, hookForm, unhookForm, reHookValues, Input, Textarea, FormGroupInline,
        FormGroup, InputErrors, validationConstraints, stringUtils} from '@sivujetti-commons-for-edit-app';
import {createTrier} from '../../../../../../frontend/edit-app/src/block/dom-commons.js';
import setFocusTo from '../../../../../../frontend/edit-app/src/block-types/auto-focusers.js';
import blockTreeUtils from '../../../../../../frontend/edit-app/src/left-column/block/blockTreeUtils.js';

class SendFormBehaviourConfigurer extends preact.Component {
    // toAddrInputEl;
    // bodyTemplateInputEl;
    // showTechnicalInputs;
    /**
     * @access protected
     */
    componentWillMount() {
        this.toAddrInputEl = preact.createRef();
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
        ], {
            replyToAddress: this.props.replyToAddress,
            replyToName: this.props.replyToName,
        }));
    }
    /**
     * @param {{subjectTemplate: String; toAddress: String; toName: String; fromAddress: String; fromName: String; replyToAddress: String; replyToName: String; bodyTemplate: String;} & ConfigureBehaviourPanelProps} props
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
        const {replyToAddress, replyToName} = props;
        const [replyToAddress2, replyToName2] = [
            this.props.replyToAddress, this.props.replyToName
        ];
        if (replyToAddress + replyToName !== replyToAddress2 + replyToName2)
            this.setState({replyToAddress, replyToName});
    }
    /**
     * @access protected
     */
    componentDidMount() {
        setFocusTo(this.toAddrInputEl);
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
    render(_, {replyToAddress, replyToName}) {
        const replyToInputs = getRelevantInputsForReplyTo(this.props.blockCopy);
        return <div class="form-horizontal pt-0">
            { this.showTechnicalInputs ? null : <div class="with-icon text-tiny py-1">
                <Icon iconId="info-circle" className="size-xs"/>
                <span class="color-dimmed">{ __('useYourOwnEmailHereHint') }</span>
            </div> }
            <FormGroupInline className="mt-0">
                <label htmlFor="toAddress" class="form-label" title={ __('To address') }>
                    { __('To address') }
                    <span class="float-right color-dimmed mt-2 text-tinyish">({__('Display name')})</span>
                </label>
                <div>
                    <div>
                        <Input vm={ this } prop="toAddress" ref={ this.toAddrInputEl }/>
                        <InputErrors vm={ this } prop="toAddress"/>
                    </div>
                    <div class="mt-1">
                        <Input vm={ this } prop="toName" placeholder={ __('Firstname Lastname') }/>
                        <InputErrors vm={ this } prop="toName"/>
                    </div>
                </div>
            </FormGroupInline>
            { this.showTechnicalInputs ? [<FormGroupInline>
                <label htmlFor="fromAddress" class="form-label">{ __('From') }</label>
                <div>
                    <div>
                        <Input vm={ this } prop="fromAddress"/>
                        <InputErrors vm={ this } prop="fromAddress"/>
                    </div>
                    <div class="mt-1">
                        <Input vm={ this } prop="fromName" placeholder={ stringUtils.capitalize(__('website.com')) }/>
                        <InputErrors vm={ this } prop="fromName"/>
                    </div>
                </div>
            </FormGroupInline>,
            <FormGroupInline>
                <label htmlFor="replyToAddress" class="form-label">{ __('Reply-to') }</label>
                <div>
                    <ReplyToAddrOrDisplayName
                        name="replyToAddress"
                        val={ replyToAddress }
                        relevantFormInputInfos={ replyToInputs.emailInputs }
                        onValueSelected={ (name, val) => this.props.onConfigurationChanged({[name]: val}) }/>
                    <ReplyToAddrOrDisplayName
                        name="replyToName"
                        val={ replyToName }
                        relevantFormInputInfos={ replyToInputs.textInputs }
                        onValueSelected={ (name, val) => this.props.onConfigurationChanged({[name]: val}) }/>
                </div>
            </FormGroupInline>,
            <FormGroup>
                <label htmlFor="subjectTemplate" class="form-label">{ __('Subject') }</label>
                <Textarea vm={ this } prop="subjectTemplate"/>
                <InputErrors vm={ this } prop="subjectTemplate"/>
            </FormGroup>,
            <FormGroup>
                <label htmlFor="bodyTemplate" class="form-label">{ __('Body') }</label>
                <Textarea vm={ this } prop="bodyTemplate" class="form-input code" ref={ this.bodyTemplateInputEl }/>
                <InputErrors vm={ this } prop="bodyTemplate"/>
            </FormGroup>] : null }
        </div>;
    }
}

/**
 * @param {{name: 'replyToAddress'|'replyToName'; val: String; relevantFormInputInfos: Array<RelevantInputInfo>; onValueSelected: todo;}} props
 * @returns {preact.VNode}
 */
function ReplyToAddrOrDisplayName({name, val, relevantFormInputInfos, onValueSelected}) {
    const isAddress = name === 'replyToAddress';
    const message = isAddress
        ? 'Lomakkeesta ei löytynyt sähköpostikenttiä, jota voitaisiin käyttää reply-to -osoitteena'
        : 'Lomakkeesta ei löytynyt tekstikenttiä, jota voitaisiin käyttää reply-to -nimenä';
    const noval = {name: '', label: relevantFormInputInfos.length ? '-' : __(message)};
    const selectables = relevantFormInputInfos.length ? [...relevantFormInputInfos, noval] : [noval];
    return <div class={ isAddress ? 'mb-1' : '' }>
        <select
            name={ name }
            class="form-select"
            value={ val }
            onChange={ e => {
                if (!relevantFormInputInfos.length && !e.target.value) return;
                onValueSelected(name, e.target.value);
            } }>
            { selectables.map(({name, label}) =>
                <option value={ name || '' }>{ label }</option>
            ) }
        </select>
    </div>;
}

/**
 * @param {RawBlock} block
 * @returns {RelevantInputs}
 */
function getRelevantInputsForReplyTo(block) {
    const out = {emailInputs: [], textInputs: []};
    blockTreeUtils.traverseRecursively([block], itm => {
        if (itm.type === 'JetFormsEmailInput')
            out.emailInputs.push({name: itm.name, label: getDetailedLabel(itm)});
        if (itm.type === 'JetFormsTextInput')
            out.textInputs.push({name: itm.name, label: getDetailedLabel(itm)});
    });
    return out;
}

/**
 * @param {RawBlock} itm JetFormsEmailInput|JetFormsTextInput
 * @returns {String}
 */
function getDetailedLabel(itm) {
    const labelOrPlaceholder = itm.label || itm.placeholder;
    return labelOrPlaceholder ? `${labelOrPlaceholder} (${itm.name})` : itm.name;
}

/**
 * @typedef RelevantInputs
 * @prop {Array<RelevantInputInfo>} emailInputs
 * @prop {Array<RelevantInputInfo>} textInputs
 *
 * @typedef RelevantInputInfo
 * @prop {String} name
 * @prop {String} label
*/

export default SendFormBehaviourConfigurer;
