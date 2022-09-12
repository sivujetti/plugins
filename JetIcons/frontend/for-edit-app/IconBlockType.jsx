import {__, env, http, LoadingSpinner} from '@sivujetti-commons-for-edit-app';

const PAGE_SIZE = 40;

/** @type {Array<IconPackIcon>} */
let cachedAvailableIcons;
/** @type {Map<String, Number>} */
let cachedIconIndices;

class IconBlockEditForm extends preact.Component {
    /**
     * @param {BlockEditFormProps} props
     */
    constructor(props) {
        super(props);
        const {getBlockCopy, grabChanges} = this.props;
        const iconIdInitial = getBlockCopy().iconId;
        const createState = (iconId, allIcons = null) => ({
            iconId: iconId || '',
            visibleIcons: allIcons ? allIcons.slice(0, PAGE_SIZE) : null,
            curPageIdx: 0,
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
    }
    /**
     * @access protected
     */
    componentDidMount() {
        const scrollEl = env.document.querySelector('#inspector-panel');
        const scroller = (function (el) {
            const state = {trig: null, currentSlots: []};
            return {
                /**
                 * @returns {Boolean}
                 */
                isReady() {
                    state.currentSlots = el.querySelectorAll('.item-grid .btn.with-icon');
                    return state.currentSlots.length > 0;
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

                    if (state.trig !== null)
                        return state.trig;

                    const lastSlot = state.currentSlots[state.currentSlots.length - 1];
                    const lastSlotRect = lastSlot.getBoundingClientRect();
                    const diff = lastSlotRect.top - state.currentSlots[0].getBoundingClientRect().top;
                    const twoRowsFromBottomAbs = diff - lastSlotRect.height * 2;
                    state.trig = twoRowsFromBottomAbs - el.getBoundingClientRect().top;
                    return state.trig;
                }
            };
        })(scrollEl);
        scrollEl.addEventListener('scroll', e => {
            if (!scroller.isReady()) return;
            if (e.target.scrollTop > scroller.getNextLoadPoint()) {
                scroller.invalidate();
                //
                const nextIdx = this.state.curPageIdx + 1;
                this.setState({
                    visibleIcons: cachedAvailableIcons.slice(0, (nextIdx + 1) * PAGE_SIZE),
                    curPageIdx: nextIdx,
                });
            }
        });
    }
    /**
     * @access protected
     */
    render(_, {iconId, visibleIcons}) {
        let visible;
        if (visibleIcons !== null) {
            if (iconId) visible = [cachedAvailableIcons[cachedIconIndices.get(iconId)]].concat(visibleIcons.filter(i => i.iconId !== iconId));
            else visible = visibleIcons;
        }
        return [
            <input class="form-input mb-2" placeholder={ __('Filter') } disabled/>,
            visible ? <div
                class={ `item-grid large-buttons medium-buttons selectable-items${!iconId ? '' : ' has-first-item-selected'}` }
                ref={ this.gridEl }>{ visible.map(icon =>
                    <button
                        dangerouslySetInnerHTML={ {
                            __html: iconToSvg(icon).concat(['<span class="text-tiny text-ellipsis">', icon.iconId, '</span>']).join('')
                        } }
                        onClick={ () => this.selectIcon(icon) }
                        class="btn with-icon btn-link text-ellipsis"
                        title={ iconId }></button>
            ) }</div>
            : <LoadingSpinner/>
        ];
    }
    /**
     * @param {IconPackIcon} icon
     * @access private
     */
    selectIcon(icon) {
        if (icon.iconId === this.state.iconId) return;
        this.props.emitValueChanged(icon.iconId, 'iconId', false);
        setTimeout(() => { this.gridEl.current.querySelector('.btn').focus(); }, 10);
    }
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
                : [__('Waits for configuration ...')]).concat([
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
