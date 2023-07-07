import {__, http, env, Icon, Popup} from '@sivujetti-commons-for-edit-app';
import ConfigureBehaviourPanel, {createEditPanelState, getBehaviourConfigurerImpl,
        customBehaviourImpls} from './configuring/ConfigureBehaviourPanel.jsx';
import SendFormBehaviourConfigurer from './SendFormBehaviourConfigurer.jsx';

const createPropsMutators = [];

const TerminatorBehaviour1 = 'ShowSentMessage';
const useNaturalLangBuilderFeat = true;

class ContactFormEditForm extends preact.Component {
    // outerEl;
    // addBehaviourBtn;
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
        this.addBehaviourBtn = preact.createRef();
        const {behaviours} = getBlockCopy();
        this.setState({asJson: behaviours, parsed: JSON.parse(behaviours),
                        editPanelState: createEditPanelState()});
        grabChanges((block, _origin, isUndo) => {
            if (isUndo) return;
            if (this.state.asJson !== block.behaviours) {
                const parsed = JSON.parse(block.behaviours);
                const openBehaviourName = this.state.editPanelState.behaviour?.name;
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
    render({emitValueChanged}, {parsed, editPanelState, curPopupRenderer}) {
        if (!useNaturalLangBuilderFeat)
            return <SendFormBehaviourConfigurer
                behaviour={ parsed[0] }
                onConfigurationChanged={ vals => {
                    Object.assign(parsed[0].data, vals); // Mutates state temporarily
                    emitValueChanged(JSON.stringify(parsed), 'behaviours', false, env.normalTypingDebounceMillis);
                } }/>;
        if (!editPanelState) return;
        const names = getAvailableBehaviours(parsed.map(({name}) => name));
        const last = parsed.at(-1);
        const hasTerminator = last.name === TerminatorBehaviour1;
        const [before, after] = hasTerminator
            ? [parsed.slice(0,-1), [last]] // [...notLast, btn|null, ...[last]]
            : [parsed,             []];    // [...all,     btn|null, ...[]]
        const vm = this;
        const isEmpty = (parsed.length - (hasTerminator ? 1 : 0)) === 0;
        const addBehOddCls = before.length % 2 > 0 ? ' group-p-odd' : '';
        return <div class="anim-outer pt-1">
            <div class={ `instructions-list d-flex ${editPanelState.leftClass}` } ref={ this.outerEl }>
                <span class="mr-1">Kun käyttäjä lähettää tämän lomakkeen niin</span>
                { [
                    ...before,
                    ...(names.length ? [
                        <span class={ `group-p${addBehOddCls} perhaps ml-1` }>
                            <button
                            onClick={ () => this.setState({curPopupRenderer: AddBehaviourPopup}) }
                            class="poppable d-flex px-1"
                            id="button"
                            ref={ this.addBehaviourBtn }>{ __(!isEmpty ? 'ja sitten' : 'lähetä täytetyt tiedot …') } <Icon iconId="plus" className="size-xs ml-1"/></button>
                        </span>
                    ] : []),
                    ...after
                ].map((itm, i) => {
                    if (itm.type === 'span') return itm;
                    const impl = getBehaviourConfigurerImpl(itm.name);
                    if (!impl) return <div class="group-p mx-1 px-2 no-round-right">Unknown behaviour { itm.name }</div>;
                    const {configurerLabel, getButtonLabel} = impl;
                    const confBtnText = getButtonLabel(itm.data);
                    const isTerminator = itm.name === TerminatorBehaviour1;
                    const oddCls = (i % 2) > 0 ? ' group-p-odd' : '';
                    const a = !isTerminator ? '2.3rem' : '1.3rem';
                    return [
                        i > 0 ? <span class="pl-0 mr-1">{
                            !isTerminator ? __(', ja sitten') : __(', ja lopuksi')
                        }</span> : null,
                        <span class={ `group-p${oddCls} px-2 no-round-right text-ellipsis no-round-right` } title={ configurerLabel }>
                            { configurerLabel }
                        </span>,
                        <span class={ `group-p${oddCls} no-round-left pl-0` }>
                            <button
                                onClick={ e => this.handleConfigOrDeleteBtnClicked(itm, e.target) }
                                class={ `with-icon poppable${!confBtnText ? ' pl-0' : ''}${confBtnText ? ' pr-0' : 'pr-1'}` }
                                title={ __('Edit or delete behaviour') }>
                                { confBtnText
                                    ? [
                                        <span class="d-inline-block text-ellipsis" style={ `max-width: calc(100% - ${a})` }>{ confBtnText }</span>,
                                        <Icon iconId="settings" className="size-xs color-dimmed ml-1 mr-1"/>
                                    ] : null }
                                { !isTerminator
                                    ? <Icon iconId="x" className="size-xs color-dimmed mr-0"/>
                                    : null }
                            </button>
                        </span>
                    ];
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
            { curPopupRenderer
                ? <Popup
                    Renderer={ curPopupRenderer }
                    rendererProps={ {
                        availableBehaviours: names,
                        oddCls: addBehOddCls,
                        /** @param {String} name */
                        confirmAddBehaviour(name) {
                            const data = name === 'StoreSubmissionToLocalDb'
                                ? {}
                                : name === 'SendMail'
                                    ? createProps().behaviours.find(b => b.name === name)?.data
                                    : null;
                            if (data === null) throw new Error('todo');
                            const parsedNew = addBehaviourTo({name, data}, parsed);
                            vm.setState({curPopupRenderer: null});
                            emitValueChanged(JSON.stringify(parsedNew), 'behaviours', false, env.normalTypingDebounceMillis);
                        },
                    } }
                    btn={ this.addBehaviourBtn.current }
                    close={ () => this.setState({curPopupRenderer: null}) }/>
                : null
            }
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
    /**
     * @param {Behaviour} behaviour
     * @param {EventTarget} target
     * @access private
     */
    handleConfigOrDeleteBtnClicked(behaviour, target) {
        const {nodeName} = target;
        const a = nodeName === 'BUTTON' || nodeName === 'SPAN' || nodeName === '#text';
        const useEl = a ? null : getUseEl(nodeName, target);
        if (a || useEl && useEl.nodeName === 'use' && useEl.href.baseVal.endsWith('-settings'))
            this.showConfigurerPanel(behaviour);
        else
            this.removeBehaviourAndEmit(behaviour);
    }
    /**
     * @param {Behaviour} behaviour
     * @access private
     */
    removeBehaviourAndEmit(behaviour) {
        const parsedNew = this.state.parsed.filter(beh => beh !== behaviour);
        this.props.emitValueChanged(JSON.stringify(parsedNew), 'behaviours', false, env.normalTypingDebounceMillis);
    }
}

class AddBehaviourPopup extends preact.Component {
    /**
     * @param {{availableBehaviours: Array<String>; confirmAddBehaviour: (name: String) => void; oddCls: String;}}
     * @access protected
     */
    render({availableBehaviours, confirmAddBehaviour, oddCls}) {
        return <div class="instructions-list d-flex">
            { availableBehaviours.map(name =>
                <button
                    onClick={ () => confirmAddBehaviour(name) }
                    className={ `group-p${oddCls} poppable perhaps` }
                    type="button">{ getBehaviourConfigurerImpl(name).configurerLabel }</button>
            ) }
        </div>;
    }
}

/**
 * @param {Behaviour} newBehaviour
 * @param {Array<Behaviour>} to
 * @returns {Array<Behaviour>}
 */
function addBehaviourTo(newBehaviour, to) {
    const last = to.at(-1);
    if (last.name === TerminatorBehaviour1)
        return [...to.slice(0, -1), newBehaviour, last];  // [...notLast, newItem, last]
    return [...to, newBehaviour]; // [...all, newItem]
}

/**
 * @param {String} nodeName
 * @param {EventTarget} target
 * @returns {SVGUseElement|null}
 */
function getUseEl(nodeName, target) {
    return nodeName === 'use' ? target : nodeName === 'svg' ? target.children[0] : null;
}

function createProps() {
    return createPropsMutators.reduce((out, fn) => fn(out), {
        behaviours: [{name: 'SendMail', data: {
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
        }}, ...(!useNaturalLangBuilderFeat
            ? []
            : [{name: TerminatorBehaviour1, data: {at: 'beforeFirstInput'}}]
        )],
        useCaptcha: 1,
    });
}

/**
 * @param {Array<String>} alreadyAdded
 * @returns {Array<String>}
 */
function getAvailableBehaviours(alreadyAdded) {
    return [
        'SendMail',
        'StoreSubmissionToLocalDb',
    ].filter(fromAll => alreadyAdded.indexOf(fromAll) < 0);
}

/**
 * @typedef Behaviour
 * @prop {String} name
 * @prop {{[key: String]: any;}} data
 */

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
    configurePropsWith(fn) {
        createPropsMutators.push(fn);
    },
    initialData: createProps,
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
