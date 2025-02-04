import {api} from '@sivujetti-commons-for-edit-app';
import TasksListingBlockType from './TasksListingBlockType.jsx';
import TaskPageProcessorBlockType from './TaskPageProcessorBlockType.jsx';

api.blockTypes.register(TasksListingBlockType.name, () => TasksListingBlockType);
api.blockTypes.register(TaskPageProcessorBlockType.name, () => TaskPageProcessorBlockType);
