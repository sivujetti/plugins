import {http} from '@sivujetti-commons-for-edit-app';

class ReactionButtonsEditForm extends preact.Component {
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render({block}) {
        return <div>
            <p>todo</p>
            <p>Show reaction count: { block.showReactionCount ? 'yes' : 'no' }</p>
            <p>Buttons: { block.buttons }</p>
        </div>;
    }
}

const initialData = {
    showReactionCount: 1,
    buttons: JSON.stringify([
        {kind: 'thumbsUp', verb: 'Like'}
    ]),
};

export default {
    name: 'QReactionsReactionButtons',
    friendlyName: 'QReactions: Reaction buttons',
    ownPropNames: Object.keys(initialData),
    initialData,
    defaultRenderer: 'plugins/QReactions:block-reaction-buttons',
    reRender(block, _renderChildren) {
        return http.post('/api/blocks/render', {block: block.toRaw()}).then(resp => resp.result);
    },
    createSnapshot: from => ({
        showReactionCount: from.showReactionCount,
        buttons: from.buttons,
    }),
    editForm: ReactionButtonsEditForm,
};
