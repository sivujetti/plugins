import {__} from '@sivujetti-commons-for-edit-app';

class IconBlockEditForm extends preact.Component {
    /**
     * @param {BlockEditFormProps2} props
     */
    constructor(props) {
        super(props);
    }
    /**
     * @access protected
     */
    render() {
        return 'todo';
    }
}

const initialData = {iconId: ''};
const name = 'JetIconsIcon';

export default {
    name,
    friendlyName: 'Icon',
    ownPropNames: Object.keys(initialData),
    initialData,
    defaultRenderer: 'plugins/JetIcons:block-icon-default',
    icon: 'macro',
    reRender: ({iconId, id, styleClasses}, renderChildren) =>
        ['<div class="j-', name, styleClasses ? ` ${styleClasses}` : '',
                '" data-block-type="', name, '" data-block="', id, '">'].concat(iconId
                    ? 'todo'
                    : [__('Waits for configuration ...')]).concat([
            renderChildren(),
        '</span>']).join('')
    ,
    createSnapshot: from => ({
        iconId: from.iconId,
    }),
    editForm: IconBlockEditForm,
};
