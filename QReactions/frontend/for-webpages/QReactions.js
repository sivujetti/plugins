import {http, env} from '@sivujetti-commons-for-web-pages';

/**
 * Makes .q-reaction elements alive.
 */
class QReactions {
    // browserStorage;
    // reactionButtons;
    /**
     * @param {Storage} browserStorage = env.window.localStorage
     */
    constructor(browserStorage = env.window.localStorage) {
        this.browserStorage = browserStorage;
        this.reactionButtons = [];
    }
    /**
     * Adds reaction counts and click handlers to parentElement.
     * querySelectorAll('.q-reaction-buttons > [data-block-root] > button')[*].
     *
     * @param {HTMLElement} parentElement
     * @access public
     */
    interactifyAllElements(parentElement) {
        this.reactionButtons = extractValidReactionButtonWrappers(parentElement.querySelectorAll('.q-reaction-buttons'));
        if (!this.reactionButtons.length) return;
        //
        const submitted = this.getReactionsFromBrowserStore();
        this.reactionButtons.forEach(wrapper => {
            wrapper.buttons.forEach((button, i) => {
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
            });
        });
    }
    /**
     * @param {Number} buttonIndex
     * @param {ReactionButtonsWrapper} wrapper
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
     * @param {ReactionButtonsWrapper} wrapper
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
 * @param {HTMLCollection} outerEls
 * @returns {Array<ReactionButtonsWrapper>}
 */
function extractValidReactionButtonWrappers(outerEls) {
    return Array.from(outerEls)
        .map(el => {
            const buttons = extractValidReactionButtons(el.querySelectorAll('[data-block-root] > button'));
            return buttons.length ? {
                buttons,
                linkedTo: {
                    entityType: getValidAttrValueOrThrow(el.getAttribute('data-linked-to-entity-type'),
                                                        'Entity type'),
                    entityId: getValidAttrValueOrThrow(el.getAttribute('data-linked-to-entity-id'),
                                                       'Entity id'),
                },
                el,
                errorEl: null,
            } : null;
        })
        .filter(wrapper => wrapper !== null);
}

/**
 * @param {HTMLCollection} buttonElements
 */
function extractValidReactionButtons(buttonElements) {
    return Array.from(buttonElements).map(el => ({
        reactionType: getValidAttrValueOrThrow(el.getAttribute('data-button-type'),
                                              'Button type'),
        userHasAlreadyClicked: false,
        isCurrentlySyncingClick: false,
        el,
    }));
}

/**
 * @param {ReactionButton} button
 */
function updateButtonClickStatus(button) {
    button.userHasAlreadyClicked = true;
    button.el.setAttribute('data-reacted', true);
}

/**
 * @param {ReactionButtonsWrapper} wrapper
 * @param {String} message
 */
function showError(wrapper, message) {
    if (!wrapper.errorEl) {
        wrapper.errorEl = document.createElement('div');
        wrapper.errorEl.addEventListener('click', () => {
            wrapper.errorEl.textContent = '';
        });
        wrapper.el.querySelector('[data-block-root]').appendChild(wrapper.errorEl);
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
 * @typedef ReactionButtonsWrapper
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
