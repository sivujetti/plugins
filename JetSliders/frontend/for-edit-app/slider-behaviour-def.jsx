import {__} from '@sivujetti-commons-for-edit-app';

/** @type {BlockBehaviourDefinition} */
const sliderBlockBehaviourDefinition = {
    friendlyName: __('Slider'),
    name: 'jet-slider',
    createData(serialized) {
        return {
            showArrows: serialized.indexOf('show-arrows') > -1,
            showBullets: serialized.indexOf('show-bullets') > -1,
        };
    },
    serializeData(data) {
        return [
            ...(data.showArrows ? ['show-arrows'] : []),
            ...(data.showBullets ? ['show-bullets'] : []),
        ].join(' ');
    },
    /** @extends {preact.Component<BlockBehaviourEditPopupProps, any>} */
    editForm: class extends preact.Component {
        render() {
            const {data} = this.props.behaviour;
            return <div class="form-horizontal pt-1 pb-0">
                <p class="color-dimmed mr-2 pb-1 mb-2" style="border-bottom: 1px solid var(--color-section-separator);">
                    {__('Slider settings')}:
                </p>
                <div class="form-group my-0">
                    <div class="text-ellipsis mr-2"><span class="form-label">{ __('Show arrows') }?</span></div>
                    <div><label class="form-checkbox mt-0">
                        <input
                            onClick={ e => {
                                this.props.emitDataPropChanged(e.target.checked, 'showArrows');
                            } }
                            checked={ data.showArrows }
                            type="checkbox"
                            class="form-input"/><i class="form-icon"></i>
                    </label></div>
                </div>
                <div class="form-group my-0">
                    <div class="text-ellipsis mr-2"><span class="form-label">{ __('Show bullets') }?</span></div>
                    <div><label class="form-checkbox mt-0">
                        <input
                            onClick={ e => {
                                this.props.emitDataPropChanged(e.target.checked, 'showBullets');
                            } }
                            checked={ data.showBullets }
                            type="checkbox"
                            class="form-input"/><i class="form-icon"></i>
                    </label></div>
                </div>
            </div>;
        }
    },
};

export default sliderBlockBehaviourDefinition;
