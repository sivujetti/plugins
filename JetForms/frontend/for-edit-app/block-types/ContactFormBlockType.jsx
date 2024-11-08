import {
    __,
    Icon,
    objectUtils,
    Popup,
} from '@sivujetti-commons-for-edit-app';
import ConfigureBehaviourPanel, {
    createEditPanelState,
    getBehaviourConfigurerImpl,
    customBehaviourImpls,
} from '../configuring/ConfigureBehaviourPanel.jsx';

const createPropsMutators = [];

class ContactFormEditForm extends preact.Component {
    // outerEl;
    // addBehaviourBtn;
    // customTerminatorsExist;
    /**
     * @access protected
     */
    componentWillMount() {
        const {block} = this.props;
        this.outerEl = preact.createRef();
        this.addBehaviourBtn = preact.createRef();
        this.customTerminatorsExist = Array.from(customBehaviourImpls.values()).reduce((has, {isTerminator}) =>
            has ? has : isTerminator === true
        , false);
        //
        this.setState({behaviours: objectUtils.cloneDeep(block.behaviours),
                        captchaPseudoBehaviour: createCaptchaPseudoBehaviour(block.captchaToUse),
                        editPanelState: createEditPanelState(), block});
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    componentWillReceiveProps(props) {
        const {block} = props;
        if (block === this.props.block)
            return;
        const {captchaPseudoBehaviour} = this.state;
        if (captchaPseudoBehaviour && block.captchaToUse !== captchaPseudoBehaviour.data.selectedImpl) {
            const openBehaviourNext = createCaptchaPseudoBehaviour(block.captchaToUse);
            this.setState({
                captchaPseudoBehaviour: openBehaviourNext,
                editPanelState: {...this.state.editPanelState, behaviour: openBehaviourNext}
            });
        } else if (JSON.stringify(block.behaviours) !== JSON.stringify(this.state.behaviours)) {
            const behaviours = objectUtils.cloneDeep(block.behaviours);
            const openBehaviourName = this.state.editPanelState.behaviour?.name;
            const openBehaviourNext = behaviours.find(({name}) => name === openBehaviourName);
            this.setState({
                behaviours,
                editPanelState: createEditPanelState(openBehaviourNext, this.state.editPanelState.leftClass,
                                                        this.state.editPanelState.rightClass)
            });
        }
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({block, emitValueChanged, emitValueChangedThrottled}, {behaviours, captchaPseudoBehaviour, editPanelState, curPopupRenderer}) {
        if (!editPanelState) return;
        const last = behaviours.at(-1);
        const hasTerminator = getBehaviourConfigurerImpl(last.name).isTerminator;
        const names = getAvailableBehaviours(behaviours.map(({name}) => name), !hasTerminator);
        const [before, after] = hasTerminator
            ? [behaviours.slice(0,-1), [last]] // [...notLast, btn|null, ...[last]]
            : [behaviours,             []];    // [...all,     btn|null, ...[]]
        const vm = this;
        const isEmpty = (behaviours.length - (hasTerminator ? 1 : 0)) === 0;
        const addBehaviourOddCls = createOddCls(before.length);
        return <div class="anim-outer pt-1">
            <div class={ `instructions-list d-flex ${editPanelState.leftClass}` } ref={ this.outerEl }>
                <span class="mr-1">{ __('Kun käyttäjä lähettää tämän lomakkeen niin') }</span>
                { [
                    captchaPseudoBehaviour,
                    ...before,
                    ...(names.length ? [
                        <span class={ `group-p${addBehaviourOddCls} perhaps ml-1` }>
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
                    const oddCls = createOddCls(i + 1);
                    const hideRemoveBtn = (isTerminator && !this.customTerminatorsExist) || i === 0;
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
                    if (editPanelState.behaviour.name !== 'RunCaptchaTest') {
                        const behavioursNew = behaviours.map(beh => beh !== editPanelState.behaviour
                            ? beh
                            : {...beh, ...{data: {...beh.data, ...vals}}}
                        );
                        emitValueChangedThrottled(behavioursNew, 'behaviours');
                    } else {
                        emitValueChanged(vals.selectedImpl, 'captchaToUse');
                    }
                } }
                endEditMode={ () => {
                    this.setState({editPanelState: createEditPanelState(null, 'reveal-from-left', 'fade-to-right')});
                } }
                panelHeight={ editPanelState.leftClass === ''
                    ? 0
                    : this.outerEl.current.getBoundingClientRect().height
                }
                block={ block }/>
            { curPopupRenderer
                ? <Popup
                    Renderer={ curPopupRenderer }
                    rendererProps={ {
                        availableBehaviours: names,
                        oddCls: addBehaviourOddCls,
                        /** @param {string} name */
                        confirmAddBehaviour(name) {
                            const data = name === 'StoreSubmissionToLocalDb'
                                ? {}
                                : name === 'SendMail'
                                    ? createDefaultOwnProps().behaviours.find(b => b.name === name)?.data
                                    : null;
                            if (data === null) throw new Error('todo');
                            const behavioursNew = addBehaviourTo({name, data}, behaviours);
                            vm.setState({curPopupRenderer: null});
                            emitValueChanged(behavioursNew, 'behaviours');
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
        else {
            const behavioursNew = this.state.behaviours.filter(beh => beh !== behaviour);
            this.props.emitValueChanged(behavioursNew, 'behaviours');
        }
    }
}

class AddBehaviourPopup extends preact.Component {
    /**
     * @param {{availableBehaviours: Array<string>; confirmAddBehaviour: (name: string) => void; oddCls: string;}}
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
 * @param {string} nodeName
 * @param {EventTarget} target
 * @returns {SVGUseElement|null}
 */
function getUseEl(nodeName, target) {
    return nodeName === 'use' ? target : nodeName === 'svg' ? target.children[0] : null;
}

/**
 * @returns {ContactFormBlockProps}
 */
function createDefaultOwnProps() {
    return createPropsMutators.reduce((out, fn) => fn(out), {
        behaviours: [
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
            }},
            {name: 'ShowSentMessage', data: {
                at: 'beforeFirstInput',
                message: __('Thank you for your message.')
            }}
        ],
        captchaToUse: 'jet-captcha',
    });
}

/**
 * @param {Array<string>} alreadyAdded
 * @param {boolean} includeTerminators
 * @returns {Array<string>}
 */
function getAvailableBehaviours(alreadyAdded, includeTerminators) {
    const customs1 = Array.from(customBehaviourImpls.entries());
    const customs = includeTerminators ? customs1 : customs1.filter(([_, impl]) => !impl.isTerminator);
    return [
        'SendMail',
        'StoreSubmissionToLocalDb',
        ...customs.map(([key, _]) => key)
    ].filter(fromAll => alreadyAdded.indexOf(fromAll) < 0);
}

/**
 * @param {number} n
 * @returns {string}
 */
function createOddCls(n) {
    return n % 2 > 0 ? ' group-p-odd' : '';
}

/**
 * @param {string|null} captchaToUse
 * @returns {Behaviour}
 */
function createCaptchaPseudoBehaviour(captchaToUse) {
    return {name: 'RunCaptchaTest', data: {selectedImpl: captchaToUse}};
}

export default {
    /**
     * @param {string} name
     * @param {BehaviourConfigurerImpl} configurer
     */
    registerBehaviour(name, configurer) {
        customBehaviourImpls.set(name, configurer);
    },
    /**
     * @param {(props: ContactFormBlockProps) => ContactFormBlockProps} fn
     */
    configurePropsWith(fn) {
        createPropsMutators.push(fn);
    },
    name: 'JetFormsContactForm',
    friendlyName: 'Contact form (JetForms)',
    editForm: ContactFormEditForm,
    stylesEditForm: 'default',
    icon: 'message-2',
    createOwnProps(_defProps) {
        return createDefaultOwnProps();
    }
};
