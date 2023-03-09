import {http, __, env} from '@sivujetti-commons-for-edit-app';
import SendFormBehaviourConfigurer from './SendFormBehaviourConfigurer.jsx';

class ContactFormEditForm extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, grabChanges} = this.props;
        const updateState = behaviours => {
            this.setState({asJson: behaviours, parsed: JSON.parse(behaviours)});
        };
        updateState(getBlockCopy().behaviours);
        grabChanges((block, _origin, _isUndo) => {
            if (this.state.asJson !== block.behaviours)
                updateState(block.behaviours);
        });
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({emitValueChanged}, {parsed}) {
        return <SendFormBehaviourConfigurer
            behaviour={ parsed[0] }
            onConfigurationChanged={ vals => {
                Object.assign(parsed[0].data, vals); // Mutates state temporarily
                emitValueChanged(JSON.stringify(parsed), 'behaviours', false, env.normalTypingDebounceMillis);
            } }/>;
    }
}

const createBehavioursMutators = [];

function createBehaviours() {
    return createBehavioursMutators.reduce((out, fn) => fn(out), [
        {name: 'SendMail', data: {
            subjectTemplate: __('New contact form entry on [siteName]'),
            toAddress: 'sivuston-omistaja@mail.com',
            toName: 'Sivuston Omistaja',
            fromAddress: 'no-reply@sivuston-nimi.com',
            fromName: 'Sivuston nimi',
            bodyTemplate: [
                `${__('New contact form entry on [siteName]')}.`,
                ``,
                `[resultsAll]`,
                ``,
                `------------`,
                `(${__('Sent by JetForms')})`,
                ``,
            ].join('\n')
        }}
    ]);
}

export default {
    name: 'JetFormsContactForm',
    friendlyName: 'Contact form (JetForms)',
    ownPropNames: ['behaviours'],
    initialChildren: [
        {blockType: 'JetFormsTextInput', initialOwnData: {name: 'input_1', isRequired: 1, label: '',
            placeholder: __('Name')}, initialDefaultsData: null},
        {blockType: 'JetFormsEmailInput', initialOwnData: {name: 'input_2', isRequired: 1, label: '',
            placeholder: __('Email')}, initialDefaultsData: null},
        {blockType: 'JetFormsTextareaInput', initialOwnData: {name: 'input_3', isRequired: 0, label: '',
            placeholder: __('Message')}, initialDefaultsData: null},
        {blockType: 'Button', initialOwnData: {html: __('Send'), tagType: 'submit', url: ''},
            initialDefaultsData: null},
    ],
    configureBehavioursWith(fn) {
        createBehavioursMutators.push(fn);
    },
    initialData: () => ({
        behaviours: JSON.stringify(createBehaviours())
    }),
    defaultRenderer: 'plugins/JetForms:block-contact-form',
    icon: 'message-2',
    reRender(block, _renderChildren) {
        return http.post(`/api/blocks/render`, {block}).then(resp => resp.result);
    },
    createSnapshot: from => ({
        behaviours: from.behaviours,
    }),
    editForm: ContactFormEditForm,
};
