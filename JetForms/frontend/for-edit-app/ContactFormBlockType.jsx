import {__, http, env, Icon, Popup} from '@sivujetti-commons-for-edit-app';
import ConfigureBehaviourPanel, {createEditPanelState, getBehaviourConfigurerImpl,
        customBehaviourImpls} from './configuring/ConfigureBehaviourPanel.jsx';
import SendFormBehaviourConfigurer from './SendFormBehaviourConfigurer.jsx';

const createPropsMutators = [];

const childChangeEvents = ['theBlockTree/applySwap', 'theBlockTree/applyAdd(Drop)Block', 'theBlockTree/deleteBlock', 'theBlockTree/undoAdd(Drop)Block', 'theBlockTree/cloneItem', 'theBlockTree/undo'];

const useNaturalLangBuilderFeat = true;

class ContactFormEditForm extends preact.Component {
    // outerEl;
    // addBehaviourBtn;
    // customTerminatorsExist;
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
        this.customTerminatorsExist = Array.from(customBehaviourImpls.values()).reduce((has, {isTerminator}) =>
            has ? has : isTerminator === true
        , false);
        //
        const blockCopy = getBlockCopy();
        const {behaviours, id} = blockCopy;
        this.setState({asJson: behaviours, parsed: JSON.parse(behaviours),
                        editPanelState: createEditPanelState(), blockCopy});
        //
        this.unregistrables = [this.props.observeStore('theBlockTree', (_, [event, data]) => {
            if ((event === 'theBlockTree/updatePropsOf' && data[0] === id) ||
                (event === 'theBlockTree/undo' && data[1] === id)) {
                const block = this.props.getBlockCopy();
                if (block.behaviours !== this.state.asJson) {
                    const parsed = JSON.parse(block.behaviours);
                    const openBehaviourName = this.state.editPanelState.behaviour?.name;
                    const openBehaviourNext = parsed.find(({name}) => name === openBehaviourName);
                    this.setState({asJson: block.behaviours, parsed, blockCopy: block,
                        editPanelState: createEditPanelState(openBehaviourNext, this.state.editPanelState.leftClass,
                                                                this.state.editPanelState.rightClass)});
                }
            } else if (childChangeEvents.indexOf(event) > -1) {
                const block = this.props.getBlockCopy();
                if (this.props.serializeTree(block.children) !== this.props.serializeTree(this.state.blockCopy.children))
                    this.setState({blockCopy: block});
            }
        })];
        }
    }
    /**
     * @access protected
     */
    componentWillUnmount() {
        this.unregistrables.forEach(unreg => unreg());
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({emitValueChanged}, {parsed, editPanelState, curPopupRenderer, blockCopy}) {
        if (!useNaturalLangBuilderFeat)
            return <SendFormBehaviourConfigurer
                behaviour={ parsed[0] }
                onConfigurationChanged={ vals => {
                    Object.assign(parsed[0].data, vals); // Mutates state temporarily
                    emitValueChanged(JSON.stringify(parsed), 'behaviours', false, env.normalTypingDebounceMillis);
                } }/>;
        if (!editPanelState) return;
        const last = parsed.at(-1);
        const hasTerminator = getBehaviourConfigurerImpl(last.name).isTerminator;
        const names = getAvailableBehaviours(parsed.map(({name}) => name), !hasTerminator);
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
                    const {isTerminator} = impl;
                    const oddCls = (i % 2) > 0 ? ' group-p-odd' : '';
                    const hideRemoveBtn = isTerminator && !this.customTerminatorsExist;
                    const a = !hideRemoveBtn ? '2.3rem' : '1.3rem';
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
                                { hideRemoveBtn
                                    ? null
                                    : <Icon iconId="x" className="size-xs color-dimmed mr-0"/> }
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
                panelHeight={ editPanelState.leftClass === ''
                    ? 0
                    : this.outerEl.current.getBoundingClientRect().height
                }
                blockCopy={ blockCopy }/>
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
        return <div class="instructions-list d-grid">
            { availableBehaviours.map(name =>
                <button
                    onClick={ () => confirmAddBehaviour(name) }
                    className={ `group-p${oddCls} poppable perhaps text-left` }
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
    if (getBehaviourConfigurerImpl(last.name).isTerminator)
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
            : [{name: 'ShowSentMessage', data: {at: 'beforeFirstInput', message: __('Thank you for your message.')}}]
        )],
        useCaptcha: 1,
    });
}

/**
 * @param {Array<String>} alreadyAdded
 * @param {Boolean} includeTerminators
 * @returns {Array<String>}
 */
function getAvailableBehaviours(alreadyAdded, includeTerminators) {
    const customs1 = Array.from(customBehaviourImpls.entries());
    const customs = includeTerminators ? customs1 : customs1.filter(([_, impl]) => !impl.isTerminator);
    return [
        ...[
            'SendMail',
            'StoreSubmissionToLocalDb',
        ],
        ...customs.map(([key, _]) => key)
    ].filter(fromAll => alreadyAdded.indexOf(fromAll) < 0);
}

export default {
    name: 'JetFormsContactForm',
    friendlyName: 'Contact form (JetForms)',
    ownPropNames: ['behaviours', 'useCaptcha'],
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
    /**
     * @param {String} name
     * @param {BehaviourConfigurerImpl} configurer
     */
    registerBehaviour(name, configurer) {
        customBehaviourImpls.set(name, configurer);
    },
    /**
     * @param {(props: ContactFormBlockPropsIr) => ContactFormBlockPropsIr} fn
     */
    configurePropsWith(fn) {
        createPropsMutators.push(fn);
    },
    /**
     * @returns {ContactFormBlockProps}
     */
    initialData() {
        const obj = createProps();
        obj.behaviours = JSON.stringify(obj.behaviours);
        return obj;
    },
    defaultRenderer: 'plugins/JetForms:block-contact-form',
    icon: 'message-2',
    reRender(block, _renderChildren) {
        return http.post(`/api/blocks/render`, {block}).then(resp => resp.result);
    },
    createSnapshot: from => ({
        behaviours: from.behaviours,
        useCaptcha: from.useCaptcha,
    }),
    editForm: ContactFormEditForm,
};
