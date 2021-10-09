import {http} from '@sivujetti-commons';

class ReactionsButtonsEditForm extends preact.Component {
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
    friendlyName: 'Reaction buttons',
    ownPropNames: Object.keys(initialData),
    defaultRenderer: 'sivujetti:q-reactions-block-reaction-buttons',
    initialData,
    reRender(block, _renderChildren) {
        return http.post('/api/blocks/render', {block: block.toRaw()}).then(resp => resp.result);
    },
    editForm: ReactionsButtonsEditForm,
};
