import {__, api, env, http, FormGroupInline} from '@sivujetti-commons-for-edit-app';

class GridGalleryEditForm extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        const {getBlockCopy, grabChanges} = this.props;
        const {showCaptions} = getBlockCopy();
        this.setState({showCaptions});
        grabChanges((block, _origin, _isUndo) => {
            if (this.state.showCaptions !== block.showCaptions)
                this.setState({showCaptions: block.showCaptions});
        });
    }
    /**
     * @access protected
     */
    componentWillUnmount() {
        //
    }
    /**
     * @param {BlockEditFormProps} props
     * @access protected
     */
    render(_, {showCaptions}) {
        return <div class="form-horizontal py-0">
            <FormGroupInline labelFlow="break">
                <span class="form-label">{ __('Show captions') }?</span>
                <label class="form-checkbox mt-0">
                    <input
                        onClick={ this.emitShowCaptions.bind(this) }
                        checked={ showCaptions === 1 }
                        type="checkbox"
                        class="form-input"/><i class="form-icon"></i>
                </label>
            </FormGroupInline>
        </div>;
    }
    /**
     * @param {Event} e
     * @access private
     */
    emitShowCaptions(e) {
        const showCaptions = e.target.checked ? 1 : 0;
        this.props.emitValueChanged(showCaptions, 'showCaptions', false);
    }
}

const columnsBlockType = api.blockTypes.get('Columns');

const initialData = {
    ...{showCaptions: 0},
    ...columnsBlockType.initialData,
};

export default {
    extends: 'Columns',
    name: 'JetGalleryGridGallery',
    friendlyName: 'Gallery (JetGallery)',
    ownPropNames: Object.keys(initialData),
    initialData() {
        return {...initialData};
    },
    initialChildren: [{
        blockType: 'JetGalleryGalleryImage',
        initialOwnData: {src: null, altText: '', caption: ''},
        initialDefaultsData: {renderer: 'plugins/JetGallery:block-gallery-image'},
    },],
    defaultRenderer: 'plugins/JetGallery:block-grid-gallery',
    icon: 'slideshow',
    reRender(block, _renderChildren, _shouldBackendRender) {
        return http.post('/api/blocks/render', {block}).then(resp => resp.result);
    },
    createSnapshot: from => ({
        showCaptions: from.showCaptions,
    }),
    editForm: GridGalleryEditForm,
};
