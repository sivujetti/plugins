import {__, http, env, Icon} from '@sivujetti-commons-for-edit-app';
import ConfigureBehaviourPanel, {createEditPanelState, getBehaviourConfigurerImpl, customBehaviourImpls} from './configuring/ConfigureBehaviourPanel.jsx';
import SendFormBehaviourConfigurer from './SendFormBehaviourConfigurer.jsx';

const createBehavioursMutators = [];

const useNaturalLangBuilderFeat = true;

class ContactFormEditForm extends preact.Component {
    // outerEl;
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, grabChanges} = this.props;
        if (!useNaturalLangBuilderFeat) {
        const updateState = behaviours => {
            this.setState({asJson: behaviours, parsed: JSON.parse(behaviours)});
        };
        updateState(getBlockCopy().behaviours);
        grabChanges((block, _origin, _isUndo) => {
            if (this.state.asJson !== block.behaviours)
                updateState(block.behaviours);
        });
        } else {
        this.outerEl = preact.createRef();
        const {behaviours} = getBlockCopy();
        this.setState({asJson: behaviours, parsed: JSON.parse(behaviours),
                        editPanelState: createEditPanelState()});
        grabChanges((block, _origin, isUndo) => {
            if (isUndo) return;
            if (this.state.asJson !== block.behaviours) {
                const parsed = JSON.parse(block.behaviours);
                const openBehaviourName = this.state.editPanelState.behaviour.name;
                const openBehaviourNext = parsed.find(({name}) => name === openBehaviourName);
                this.setState({asJson: block.behaviours, parsed,
                    editPanelState: createEditPanelState(openBehaviourNext, this.state.editPanelState.leftClass,
                                                            this.state.editPanelState.rightClass)});
            }
        });
        }
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({emitValueChanged}, {parsed, editPanelState}) {
        if (!useNaturalLangBuilderFeat)
            return <SendFormBehaviourConfigurer
                behaviour={ parsed[0] }
                onConfigurationChanged={ vals => {
                    Object.assign(parsed[0].data, vals); // Mutates state temporarily
                    emitValueChanged(JSON.stringify(parsed), 'behaviours', false, env.normalTypingDebounceMillis);
                } }/>;
        if (!editPanelState) return;
        return <div class="anim-outer pt-1">
            <div class={ editPanelState.leftClass } ref={ this.outerEl }>
                Kun käyttäjä lähettää lomakkeen niin
                { parsed.map((behaviour, i) => {
                    const impl = getBehaviourConfigurerImpl(behaviour.name);
                    if (!impl) return <div>Unknown behaviour { behaviour.name }</div>;
                    const {configurerLabel, getButtonLabel} = impl;
                    return [i > 0 ? ', ja sitten' : '', <span>
                        { configurerLabel }
                        <button onClick={ () => this.showConfigurerPanel(behaviour) } class="with-icon">
                            { getButtonLabel(behaviour.data) }<Icon iconId="settings" className="size-xs ml-1 mr-0"/>
                        </button>
                    </span>];
                }).flat() }
            </div>
            <ConfigureBehaviourPanel
                behaviour={ editPanelState.behaviour }
                cssClass={ editPanelState.rightClass }
                onConfigurationChanged={ vals => {
                    const parsedNew = parsed.map(beh => beh !== editPanelState.behaviour
                        ? beh
                        : {...beh, ...{data: {...beh.data, ...vals}}}
                    );
                    emitValueChanged(JSON.stringify(parsedNew), 'behaviours', false, env.normalTypingDebounceMillis);
                } }
                endEditMode={ () => {
                    this.setState({editPanelState: createEditPanelState(null, 'reveal-from-left', 'fade-to-right')});
                } }
                panelHeight={  editPanelState.leftClass === ''
                    ? 0
                    : this.outerEl.current.getBoundingClientRect().height
                }/>
        </div>;
    }
    /**
     * @param {Behaviour} behaviour
     * @access private
     */
    showConfigurerPanel(behaviour) {
        this.setState({editPanelState: createEditPanelState(behaviour,
                                        'fade-to-left',
                                        'reveal-from-right')});
    }
}

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
    ].concat(!useNaturalLangBuilderFeat
        ? []
        : [{name: 'ShowSentMessage', data: {at: 'beforeFirstInput'}}]
    ));
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
            placeholder: __('Message'), numRows: 0}, initialDefaultsData: null},
        {blockType: 'Button', initialOwnData: {html: __('Send'), tagType: 'submit', url: ''},
            initialDefaultsData: null},
    ],
    registerBehaviour(name, configurer) {
        customBehaviourImpls.set(name, configurer);
    },
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
