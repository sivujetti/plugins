import {
    __,
} from '@sivujetti-commons-for-edit-app';

class TasksListingBlockEditForm extends preact.Component {
    /**
     * @access protected
     */
    render() {
        return <div>
            TasksListingBlock
        </div>;
    }
}

const name = 'QKanboardTasksListing';

export default {
    name,
    friendlyName: 'Tasks listing',
    icon: 'box',
    editForm: TasksListingBlockEditForm,
    stylesEditForm: 'default',
    createOwnProps(/*defProps*/) {
        return {
            projectId: 0,
        };
    }
};
