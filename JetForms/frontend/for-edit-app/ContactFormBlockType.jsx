import {http, __, env} from '@sivujetti-commons-for-edit-app';
import SendFormBehaviourConfigurer from './SendFormBehaviourConfigurer.jsx';

class ContactFormEditForm extends preact.Component {
    // parsedBehaviours;
    /**
     * @param {RawBlockData} snapshot
     * @access public
     */
    overrideValues(snapshot) {
        this.parsedBehaviours = JSON.parse(snapshot.behaviours);
        this.setState({sendFormBehaviour: this.parsedBehaviours[0]});
    }
    /**
     * @access protected
     */
    componentWillMount() {
        this.overrideValues(this.props.snapshot);
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({onValueChanged}, {sendFormBehaviour}) {
        return <SendFormBehaviourConfigurer
            behaviour={ sendFormBehaviour }
            onConfigurationChanged={ vals => {
                // Mutates this.state.sendFormBehaviour and this.parsedBehaviours. Also: does not setState
                this.parsedBehaviours[0].data = Object.assign(this.state.sendFormBehaviour.data, vals);
                const jsonified = JSON.stringify(this.parsedBehaviours);
                onValueChanged(jsonified, 'behaviours', false, env.normalTypingDebounceMillis);
            } }/>;
    }
}

const initialData = {blockType: 'JetFormsContactForm', data: {
    behaviours: JSON.stringify([
        {name: 'SendMail', data: {
            subjectTemplate: __('New contact form entry on [siteName]'),
            toAddress: 'sivuston-omistaja@mail.com',
            toName: 'Sivuston Omistaja',
            fromAddress: 'no-reply@sivuston-nimi.com',
            fromName: 'Sivuston nimi',
            bodyTemplate: [
                `${__('New contact form entry on [siteName]')}.`,
                ``,
                `${__('Sender')}:`,
                `[name]`,
                `${__('Email')}:`,
                `[email]`,
                `${__('Message')}:`,
                `[message]`,
                ``,
                `------------`,
                `(${__('Sent by JetForms')})`,
                ``,
            ].join('\n')
        }}
    ])
}, children: [
    {blockType: 'JetFormsTextInput', data: {name: 'name', isRequired: 1, label: '',
        placeholder: __('Name')}, children: []},
    {blockType: 'JetFormsEmailInput', data: {name: 'email', isRequired: 1, label: '',
        placeholder: __('Email')}, children: []},
    {blockType: 'JetFormsTextareaInput', data: {name: 'message', isRequired: 0, label: '',
        placeholder: __('Message')}, children: []},
    {blockType: 'Button', data: {html: __('Send'), tagType: 'submit', url: '',
        cssClass: ''}, children: []},
]};

export default {
    name: 'JetFormsContactForm',
    friendlyName: 'JetForms: Contact form',
    ownPropNames: Object.keys(initialData.data),
    initialData,
    defaultRenderer: 'sivujetti:jet-forms-block-contact-form',
    reRender(block, _renderChildren) {
        return http.post('/api/blocks/render', {block: block.toRaw()}).then(resp => resp.result);
    },
    createSnapshot: from => ({
        behaviours: from.behaviours,
    }),
    editForm: ContactFormEditForm,
};
