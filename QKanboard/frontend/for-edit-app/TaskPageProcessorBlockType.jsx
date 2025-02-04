import {
    __,
} from '@sivujetti-commons-for-edit-app';

class TaskPageProcessorBlockEditForm extends preact.Component {
    /**
     * @access protected
     */
    render() {
        return <div>
            TaskPageProcessorBlock
        </div>;
    }
}

const name = 'QKanboardTaskPageProcessor';

export default {
    name,
    friendlyName: 'Task page processor',
    icon: 'box',
    editForm: TaskPageProcessorBlockEditForm,
    stylesEditForm: 'default',
    createOwnProps(/*defProps*/) {
        return {
            dummy: '',
        };
    }
};
