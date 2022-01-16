import {http, __} from '@sivujetti-commons-for-edit-app';

class ContactFormEditForm extends preact.Component {
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({block}) {
        return <div>
            <p>todo</p>
            <p>Behaviours: { JSON.parse(block.behaviours).map(({name}) => name).join(', ') }</p>
        </div>;
    }
}

const initialData = {blockType: 'JetFormsContactForm', data: {
    behaviours: JSON.stringify([
        {name: 'SendMail', data: {
            subjectTemplate: __('New contact form entry on [siteName]'),
            toAddress: 'sivuston-omistaja@mail.com',
            fromAddress: 'no-reply@sivuston-nimi.com',
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
                `(${__('(Sent by JetForms)')})`,
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
    {blockType: 'Button', data: {text: __('Send'), tagType: 'button', url: '',
        cssClass: ''}, children: []},
]};

export default {
    name: 'JetFormsContactForm',
    friendlyName: 'Contact form',
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
