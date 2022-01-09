import {http} from '@sivujetti-commons';
import {__} from '../../../../../frontend/edit-app/src/commons/main.js';

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
            subjectTemplate: __('Uusi yhteydenotto sivustolta [siteName]'),
            toAddress: 'sivuston-omistaja@mail.com',
            fromAddress: 'no-reply@sivuston-nimi.com',
            bodyTemplate: [
                `${__('Uusi yhteydenotto sivustolta')} [siteName].`,
                ``,
                `${__('Lähettäjä')}:`,
                `[name]`,
                `${__('Email')}:`,
                `[email]`,
                `${__('Viesti')}:`,
                `[message]`,
                ``,
                `------------`,
                `${__('(Tämä viesti lähetettiin JetForms-lisäosalla)')}`,
                ``,
            ].join('\n')
        }}
    ])
}, children: [
    {blockType: 'JetFormsTextInput', data: {name: 'name', isRequired: 1, label: '', placeholder: __('Name')}, children: []},
    {blockType: 'JetFormsEmailInput', data: {name: 'email', isRequired: 1, label: '', placeholder: __('Email')}, children: []},
    {blockType: 'JetFormsTextareaInput', data: {name: 'message', isRequired: 0, label: '', placeholder: __('Message')}, children: []},
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
