import {http, env} from '@sivujetti-website-tools';

/**
 * Makes .q-reaction elements alive.
 */
class QReactions {
    /**
     * @param {Storage} browserStorage = env.window.localStorage
     */
    constructor(browserStorage = env.window.localStorage) {
        this.browserStorage = browserStorage;
        this.reactionsWrappers = [];
    }
    /**
     * Adds reaction counts and click handlers to parentElement.
     * querySelectorAll('.q-reactions > .q-reaction-buttons > button')[*].
     *
     * @param {HTMLElement} parentElement
     * @access public
     */
    interactifyAllElements(parentElement) {
        this.reactionsWrappers = extractValidReactionWrappers(parentElement.querySelectorAll('.q-reactions'));
        if (!this.reactionsWrappers.length) return;
        //
        const submitted = this.getReactionsFromBrowserStore();
        this.reactionsWrappers.forEach(wrapper => {
            for (let i = 0; i < wrapper.buttons.length; ++i) {
                const button = wrapper.buttons[i];
                if (submitted.some(reaction =>
                    reaction.reactionType === button.reactionType &&
                    reaction.linkedTo.entityType === wrapper.linkedTo.entityType &&
                    reaction.linkedTo.entityId === wrapper.linkedTo.entityId
                )) {
                    updateButtonClickStatus(button);
                }
                button.el.addEventListener('click', () =>
                    this.handleReactionButtonClicked(i, wrapper)
                );
            }
        });
    }
    /**
     * @param {Number} buttonIndex
     * @param {ReactionWrapperElement} wrapper
     * @access private
     */
    handleReactionButtonClicked(buttonIndex, wrapper) {
        const button = wrapper.buttons[buttonIndex];
        if (button.userHasAlreadyClicked || button.isCurrentlySyncingClick ||
            this.doesUserHaveReactionsFor(wrapper))
            return;
        const newReaction = {
            reactionType: button.reactionType,
            linkedTo: wrapper.linkedTo,
        };
        button.isCurrentlySyncingClick = true;
        button.el.setAttribute('disabled', true);
        http.post('/plugins/q-reactions/reactions', newReaction)
            .then(resp => {
                if (!resp.ok) throw new Error('Something funky happened');
                updateButtonClickStatus(button);
                this.addReactionToBrowserStore(newReaction);
            })
            .catch(err => {
                env.window.console.error(err);
                showError(wrapper, wrapper.el.getAttribute('data-error-message'));
            })
            .finally(() => {
                button.isCurrentlySyncingClick = false;
                button.el.removeAttribute('disabled');
            });
    }
    /**
     * @returns {Array<ReactionPostData>}
     * @access private
     */
    getReactionsFromBrowserStore() {
        const json = this.browserStorage.qReactions;
        return json ? JSON.parse(json) : [];
    }
    /**
     * @param {ReactionPostData} data
     * @access private
     */
    addReactionToBrowserStore(data) {
        const alreadySubmitted = this.getReactionsFromBrowserStore();
        this.browserStorage.qReactions = JSON.stringify(alreadySubmitted.concat({
            reactionType: data.reactionType,
            linkedTo: {entityType: data.linkedTo.entityType, entityId: data.linkedTo.entityId},
        }));
    }
    /**
     * @param {ReactionWrapperElement} wrapper
     * @returns {Boolean}
     * @access private
     */
    doesUserHaveReactionsFor(wrapper) {
        const alreadySubmitted = this.getReactionsFromBrowserStore();
        return alreadySubmitted.some(reaction =>
            reaction.linkedTo.entityType === wrapper.linkedTo.entityType &&
            reaction.linkedTo.entityId === wrapper.linkedTo.entityId
        );
    }
}

/**
 * @param {HTMLCollection} candidateEls
 * @returns {Array<ReactionWrapperElement>}
 */
function extractValidReactionWrappers(candidateEls) {
    const out = [];
    for (let i = 0; i < candidateEls.length; ++i) {
        const el = candidateEls[i];
        const buttons = extractValidReactionButtons(el.querySelectorAll('.q-reaction-buttons > button'));
        if (!buttons.length) return;
        out.push({
            buttons,
            linkedTo: {
                entityType: getValidAttrValueOrThrow(el.getAttribute('data-linked-to-entity-type'),
                                                     'Entity type'),
                entityId: getValidAttrValueOrThrow(el.getAttribute('data-linked-to-entity-id'),
                                                   'Entity id'),
            },
            el,
            errorEl: null,
        });
    }
    return out;
}

/**
 * @param {HTMLCollection} buttonElements
 */
function extractValidReactionButtons(buttonElements) {
    const out = [];
    for (let i = 0; i < buttonElements.length; ++i) {
        const el = buttonElements[i];
        out.push({
            reactionType: getValidAttrValueOrThrow(el.getAttribute('data-button-type'),
                                                   'Button type'),
            userHasAlreadyClicked: false,
            isCurrentlySyncingClick: false,
            el,
        });
    }
    return out;
}

/**
 * @param {ReactionButton} button
 */
function updateButtonClickStatus(button) {
    button.userHasAlreadyClicked = true;
    button.el.setAttribute('data-reacted', true);
}

/**
 * @param {ReactionWrapperElement} wrapper
 * @param {String} message
 */
function showError(wrapper, message) {
    if (!wrapper.errorEl) {
        wrapper.errorEl = document.createElement('div');
        wrapper.errorEl.addEventListener('click', () => {
            wrapper.errorEl.textContent = '';
        });
        wrapper.el.appendChild(wrapper.errorEl);
    }
    wrapper.errorEl.textContent = message;
}

/**
 * @param {String} candidate
 * @param {String} explain = ''
 * @returns {String}
 * @throws {Error} If candidate contains forbidden characters
 */
function getValidAttrValueOrThrow(candidate, explain = '') {
    if (!/^[\w-]+$/.test(candidate))
        throw new Error(`${explain} (${candidate}) contains forbidden characters.`);
    return candidate;
}

/**
 * @typedef ReactionWrapperElement
 * @prop {Array<ReactionButton>} buttons
 * @prop {ReactionLinkedTo} linkedTo
 * @prop {HTMLElement} el
 * @prop {HTMLElement|null} errorEl
 *
 * @typedef ReactionButton
 * @prop {String} reactionType
 * @prop {Boolean} userHasAlreadyClicked
 * @prop {Boolean} isCurrentlySyncingClick
 * @prop {HTMLButtonElement} el
 *
 * @typedef ReactionLinkedTo
 * @prop {String} entityType
 * @prop {String} entityId
 *
 * @typedef ReactionPostData
 * @prop {String} reactionType
 * @prop {ReactionLinkedTo} linkedTo
 */

export default QReactions;
