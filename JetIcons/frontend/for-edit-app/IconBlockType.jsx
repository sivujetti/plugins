import {__, api, env, http, stringUtils, timingUtils, Icon, LoadingSpinner} from '@sivujetti-commons-for-edit-app';

const PAGE_SIZE = 40;

/** @type {Array<IconPackIcon>} */
let cachedAvailableIcons;
/** @type {Map<String, Number>} */
let cachedIconIndices;

class IconBlockEditForm extends preact.Component {
    // gridEl;
    // throttledReceiveFilterTerm;
    // scroller;
    // unregisterScroller;
    /**
     * @param {BlockEditFormProps} props
     */
    constructor(props) {
        super(props);
        const {getBlockCopy, grabChanges} = this.props;
        const iconIdInitial = getBlockCopy().iconId;
        this.gridEl = preact.createRef();
        const createState = (iconId = '', allIcons = null) => ({
            iconId: iconId,
            visibleIcons: getInitialPage(allIcons),
            curPageIdx: 0,
            searchTerm: '',
        });
        if (!cachedAvailableIcons) {
            this.state = createState(iconIdInitial);
            //
            const cachedResponse = env.window.localStorage.sivujettiIconBlockCachedTablerIcons;
            const promise = cachedResponse ? Promise.resolve({icons: JSON.parse(cachedResponse)}) : http.get('/plugins/jet-icons/icons-pack-icons/default');
            promise.then(resp => {
                if (!Array.isArray(resp.icons)) throw new Error('');
                cachedAvailableIcons = resp.icons;
                cachedIconIndices = cachedAvailableIcons.reduce((map, icon, i) => map.set(icon.iconId, i), new Map);
                if (!cachedResponse) env.window.localStorage.sivujettiIconBlockCachedTablerIcons = JSON.stringify(cachedAvailableIcons);
                this.setState(createState(iconIdInitial, cachedAvailableIcons));
            })
            .catch(env.window.console.error);
        } else {
            this.state = this.setState(createState(iconIdInitial, cachedAvailableIcons));
        }
        grabChanges((block, _origin, _isUndo) => {
            if (this.state.iconId !== block.iconId)
                this.setState({iconId: block.iconId});
        });
        this.throttledReceiveFilterTerm = timingUtils.debounce(e => {
            if (!cachedAvailableIcons) return;
            this.setState({searchTerm: e.target.value});
            const trimmed = e.target.value.trim();
            if (trimmed.length > 1) {
                const slugified = stringUtils.slugify(trimmed);
                this.setState({visibleIcons: cachedAvailableIcons.filter(({iconId}) => iconId.indexOf(slugified) > -1)});
                this.scroller.setIsDisabled(true);
            } else if (!trimmed.length) {
                this.clearSearchTerm();
            }
        }, env.normalTypingDebounceMillis);
    }
    /**
     * @access protected
     */
    componentDidMount() {
        const scrollEl = api.inspectorPanel.getEl();
        this.scroller = (function (el) {
            const state = {trig: null, currentSlots: []};
            return {
                /**
                 * @returns {Boolean}
                 */
                isReady() {
                    if (state.isDisabled) return false;
                    state.currentSlots = el.querySelectorAll('.item-grid .btn.with-icon');
                    return state.currentSlots.length > 0;
                },
                /**
                 * @param {Boolean} isDisabled
                 */
                setIsDisabled(isDisabled) {
                    state.isDisabled = isDisabled;
                    this.invalidate();
                },
                /**
                 */
                invalidate() {
                    state.currentSlots = [];
                    state.trig = null;
                },
                /**
                 * @returns {Number}
                 */
                getNextLoadPoint() {
                    if (!state.currentSlots.length) return;
                    //
                    if (state.trig !== null)
                        return state.trig;
                    //
                    const lastSlot = state.currentSlots[state.currentSlots.length - 1];
                    const lastSlotRect = lastSlot.getBoundingClientRect();
                    const diff = lastSlotRect.top - state.currentSlots[0].getBoundingClientRect().top;
                    const twoRowsFromBottomAbs = diff - lastSlotRect.height * 2;
                    state.trig = twoRowsFromBottomAbs - el.getBoundingClientRect().top;
                    return state.trig;
                }
            };
        })(scrollEl);
        this.unregisterScroller = (function (el, cmp) {
            const onScroll = e => {
                if (!cmp.scroller.isReady()) return;
                if (e.target.scrollTop > cmp.scroller.getNextLoadPoint()) {
                    cmp.scroller.invalidate();
                    //
                    const nextIdx = cmp.state.curPageIdx + 1;
                    cmp.setState({
                        visibleIcons: cachedAvailableIcons.slice(0, (nextIdx + 1) * PAGE_SIZE),
                        curPageIdx: nextIdx,
                    });
                }
            };
            el.addEventListener('scroll', onScroll);
            return () => { el.removeEventListener('scroll', onScroll); };
        })(scrollEl, this);
    }
    /**
     * @access protected
     */
    componentWillUnmount() {
        this.unregisterScroller();
    }
    /**
     * @access protected
     */
    render(_, {iconId, visibleIcons, searchTerm}) {
        let iconsArr;
        if (visibleIcons !== null) {
            iconsArr = iconId ? [cachedAvailableIcons[cachedIconIndices.get(iconId)]].concat(visibleIcons.filter(i => i.iconId !== iconId)) : visibleIcons;
        }
        const input = <input
            class="form-input mb-2"
            placeholder={ __('Filter') }
            value={ searchTerm }
            onInput={ this.throttledReceiveFilterTerm }/>;
        return [
            searchTerm.length ? <div class="has-icon-right">
            { input }
            <button
                onClick={ this.clearSearchTerm.bind(this) }
                class="sivujetti-form-icon btn no-color"
                type="button">
                <Icon iconId="x" className="size-xs"/>
            </button>
        </div> : input,
            iconsArr ? <div
                class={ `item-grid large-buttons medium-buttons selectable-items${!iconId ? '' : ' has-first-item-selected'}` }
                ref={ this.gridEl }>{ iconsArr.length ? iconsArr.map(icon =>
                    <button
                        dangerouslySetInnerHTML={ {
                            __html: iconToSvg(icon).concat(['<span class="text-tiny text-ellipsis">', icon.iconId, '</span>']).join('')
                        } }
                        onClick={ () => this.selectIcon(icon) }
                        class="btn with-icon btn-link text-ellipsis"
                        title={ icon.iconId }></button>
            ) : <div class="pl-1" style="grid-column: 1/-1">{ __('No results for term ') } <b>{ searchTerm }</b></div> }</div>
            : <LoadingSpinner/>
        ];
    }
    /**
     * @param {IconPackIcon} icon
     * @access private
     */
    selectIcon({iconId}) {
        if (iconId === this.state.iconId) return;
        this.props.emitValueChanged(iconId, 'iconId', false);
        setTimeout(() => { this.gridEl.current.querySelector('.btn').focus(); }, 10);
    }
    /**
     * @access private
     */
    clearSearchTerm() {
        this.setState({searchTerm: '', visibleIcons: getInitialPage(cachedAvailableIcons)});
        this.scroller.setIsDisabled(false);
    }
}

/**
 * @param {Array<IconPackIcon>} allIcons
 * @retuns {Array<IconPackIcon>}
 */
function getInitialPage(allIcons) {
    return allIcons ? allIcons.slice(0, PAGE_SIZE) : null;
}

/**
 * @param {IconPackIcon} icon
 * @returns {Array<String>}
 */
function iconToSvg({iconId, inlineSvgShapes}) {
    return [
        '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler mt-0 icon-tabler-', iconId,
            '" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">',
            inlineSvgShapes,
        '</svg>'
    ];
}

const name = 'JetIconsIcon';

export default {
    name,
    friendlyName: 'Icon',
    initialData: () => ({iconId: ''}),
    defaultRenderer: 'plugins/JetIcons:block-icon-default',
    icon: 'macro',
    reRender: ({iconId, id, styleClasses}, renderChildren) =>
        ['<span class="j-', name, styleClasses ? ` ${styleClasses}` : '',
            '" data-block-type="', name, '" data-block="', id, '">'].concat(iconId
                ? iconToSvg(cachedAvailableIcons[cachedIconIndices.get(iconId)])
                : ['<span',
                   ' title="', __('Waits for configuration ...'), '"',
                   ' style="border: 1px dashed;display: inline-block;padding: 11px;"></span>']).concat([
            renderChildren(),
        '</span>']).join('')
    ,
    createSnapshot: from => ({
        iconId: from.iconId,
    }),
    editForm: IconBlockEditForm,
};

/**
 * @typedef IconPackIcon
 * @prop {String} iconId
 * @prop {String} inlineSvgShapes
 */
