import {__, Icon} from '@sivujetti-commons-for-edit-app';
import ContextMenu from '../../../../../frontend/edit-app/src/commons/ContextMenu.jsx';
import Sortable from './Sortable.js';

let counter = 0;

class CrudList extends preact.Component {
    // editForm;
    // contextMenu;
    // sortable;
    // itemWithNavOpened;
    /**
     * @param {{items: Array<Object>; itemTitleKey: String; onListMutated: (newList: Array<Object>) => void; createNewItem: () => Object; editForm: preact.AnyComponent; itemTypeFriendlyName: String;}} props
     */
    constructor(props) {
        super(props);
        this.editForm = preact.createRef();
        this.contextMenu = preact.createRef();
        this.state = {items: this.addKeys(this.props.items), tab: 'default'};
    }
    /**
     * @access protected
     */
    componentWillMount() {
        this.sortable = new Sortable();
    }
    /**
     * @access protected
     */
    componentWillReceiveProps(props) {
        if (props.items !== this.props.items) {
            const items = this.addKeys(props.items);
            if (!this.state.editItem)
                this.setState({items});
            else {
                const editItemIdx = this.state.items.indexOf(this.state.editItem);
                this.setState({items, editItem: items[editItemIdx]});
                this.editForm.current.overrideValues(items[editItemIdx]);
            }
        }
    }
    /**
     * @access protected
     */
    render({editForm, itemTypeFriendlyName, itemTitleKey}, {items, tab}) {
        if (!items)
            return;
        if (tab === 'default') return [
            <ul class="list table-list container px-0" ref={ this.activateSorting.bind(this) }>{ items.length ? items.map(item => <li data-id={ item.key } key={ item.key } class="columns">
                    <div class="col-2">
                        <button class="drag-handle with-icon" title={ __('Drag') }>
                            <Icon iconId="grid-dots" className="size-xs mr-0"/>
                        </button>
                    </div>
                    <div class="col-8 text-ellipsis">
                        { item[itemTitleKey] }
                    </div>
                    <div class="col-2">
                        <button onClick={ e => this.openMoreMenu(item, e) } class="btn btn-sm btn-link col-ml-auto flex-centered" type="button">
                            <Icon iconId="dots" className="size-sm"/>
                        </button>
                    </div>
                </li>) : <tr><div>-</div></tr> }
            </ul>,
            <button onClick={ this.addNewItem.bind(this) }
                title={ __('Add %s', itemTypeFriendlyName) }
                class="btn btn-sm mt-8"
                type="button">
                { __('Add %s', itemTypeFriendlyName) }
            </button>,
            <ContextMenu
                links={ [
                    {text: __('Edit'), title: __('Edit'), id: 'edit-option'},
                    {text: __('Delete'), title: __('Delete'), id: 'delete-option'},
                ] }
                onItemClicked={ this.handleContextMenuLinkClicked.bind(this) }
                onMenuClosed={ () => { this.itemWithNavOpened = null; } }
                ref={ this.contextMenu }/>
        ];
        //
        if (tab === 'edit') {
            const Impl = editForm;
            return <Impl
                item={ this.state.editItem }
                onValueChanged={ (value, key) => {
                        // eslint-disable-next-line react/no-direct-mutation-state
                        this.state.editItem[key] = value;
                        this.setState({items: this.state.items,
                                       editItem: this.state.editItem});
                        this.emitListMutated(this.state.items);
                    } }
                done={ () => this.setState({tab: 'default', editItem: null}) }
                ref={ this.editForm }/>;
        }
    }
    /**
     * @param { } item
     * @param {Event} e
     * @access private
     */
    openMoreMenu(item, e) {
        this.itemWithNavOpened = item;
        this.contextMenu.current.open(e);
    }
    /**
     * @param {ContextMenuLink} link
     * @access private
     */
    handleContextMenuLinkClicked(link) {
        if (link.id === 'edit-option') {
            this.setState({tab: 'edit', editItem: this.itemWithNavOpened});
        } else if (link.id === 'delete-option') {
            const items = this.state.items.filter(item => item !== this.itemWithNavOpened);
            this.setState({items});
            this.emitListMutated(items);
        }
    }
    /**
     * @param {Array<{key: String} && Object>} items
     * @access private
     */
    emitListMutated(items) {
        this.props.onListMutated(removeKeys(items));
    }
    /**
     * @access private
     */
    activateSorting(tbodyEl) {
        this.sortable.register(tbodyEl, {
            handle: '.drag-handle',
            onReorder: orderedIds => {
                const ordered = orderedIds.map(key =>
                    this.state.items.find(f => f.key === key)
                );
                this.setState({items: ordered});
                this.emitListMutated(ordered);
            },
        });
    }
    /**
     * @param {Array<Object>} items
     * @returns {Array<{key: String} && Object>}
     * @access private
     */
    addKeys(items) {
        for (const item of items) {
            if (item.key)
                throw new Error('Expected item.key not to exist');
            if (!item[this.props.itemTitleKey])
                throw new Error('item[props.itemTitleKey] not defined');
        }
        return items.map(item => Object.assign({}, item, {
            key: (++counter).toString(),
        }));
    }
    /**
     * @access private
     */
    addNewItem() {
        const newItem = Object.assign({}, this.props.createNewItem());
        if (!newItem.key) newItem.key = (++counter).toString();
        const newList = this.state.items.concat(newItem);
        this.setState({items: newList});
        this.emitListMutated(newList);
    }
}

/**
 * @param {Array<{key: String} && Object>} items
 * @returns {Array<Object>}
 */
function removeKeys(items) {
    return items.map(item => {
        const out = Object.assign({}, item);
        delete out.key;
        return out;
    });
}

export default CrudList;
