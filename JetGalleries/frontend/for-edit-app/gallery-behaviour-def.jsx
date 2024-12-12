import {__} from '@sivujetti-commons-for-edit-app';

/** @type {BlockBehaviourDefinition} */
const galleryBlockBehaviourDefinition = {
    friendlyName: __('Gallery'),
    name: 'jet-gallery',
    createData(serialized) {
        return {
            showCaptions: serialized.indexOf('show-captions') > -1,
        };
    },
    serializeData(data) {
        return data.showCaptions ? 'show-captions' : '';
    },
    /** @extends {preact.Component<BlockBehaviourEditPopupProps, any>} */
    editForm: class extends preact.Component {
        render() {
            const {data} = this.props.behaviour;
            return <div class="form-horizontal pt-1 pb-0">
                <p class="color-dimmed mr-2 pb-1 mb-2" style="border-bottom: 1px solid var(--color-section-separator);">
                    {__('Lightbox settings')}:
                </p>
                <div class="form-group my-0">
                    <div class="text-ellipsis mr-2"><span class="form-label">{ __('Show captions') }?</span></div>
                    <div><label class="form-checkbox mt-0">
                        <input
                            onClick={ e => {
                                this.props.emitDataPropChanged(e.target.checked, 'showCaptions');
                            } }
                            checked={ data.showCaptions }
                            type="checkbox"
                            class="form-input"/><i class="form-icon"></i>
                    </label></div>
                </div>
            </div>;
        }
    },
};

export default galleryBlockBehaviourDefinition;
