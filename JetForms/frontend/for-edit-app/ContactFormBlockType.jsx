import {http, __} from '@sivujetti-commons';

class ContactFormEditForm extends preact.Component {
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({block}) {
        return <div>
            <p>todo</p>
            <p>Fields: { JSON.parse(block.fields).map(({label}) => label).join(', ') }</p>
            <p>Behaviours: { JSON.parse(block.behaviours).map(({name}) => name).join(', ') }</p>
        </div>;
    }
}

const initialData = {
    fields: JSON.stringify([
        {name: "name", label : __('Name'), type: "text", isRequired: true},
        {name: "email", label : __('Email'), type: "email", isRequired: true},
        {name: "message", label : __('Message'), type: "textarea", isRequired: false},
    ]),
    behaviours: JSON.stringify([
        {name: 'SendMail', data: {
            subjectTemplate: __('Uusi yhteydenotto sivustolta [siteName]'),
            toAddress: 'sivuston-omistaja@mail.com',
            fromAddress: 'no-reply@sivuston-nimi.com',
            bodyTemplate: `${__('Uusi yhteydenotto sivustolta')} [siteName].\n\n${__('Lähettäjä')}:\n[name]\n${__('Email')}:\n[email]\n${__('Viesti')}:\n[message]\n\n------------\n${__('(Tämä viesti lähetettiin JetForms-lisäosalla)')}\n`
        }}
    ])
};

export default {
    name: 'JetFormsContactForm',
    friendlyName: 'Contact form',
    ownPropNames: Object.keys(initialData),
    initialData,
    defaultRenderer: 'sivujetti:jet-forms-block-contact-form',
    reRender(block, _renderChildren) {
        return http.post('/api/blocks/render', {block: block.toRaw()}).then(resp => resp.result);
    },
    editForm: ContactFormEditForm,
};
