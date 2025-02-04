/*
This file is transpiled into 'public/plugin-q-kanboard-webpage-preview-renderer-app-bundle.js'.
*/

import {api} from '@sivujetti-webpage-preview-renderer-app';
import TasksListingBlockRenderer from './TasksListingBlockRenderer.jsx';
import TaskPageProcessorBlockRenderer from './TaskPageProcessorBlockRenderer.jsx';

api.registerRenderer('QKanboardTasksListing', TasksListingBlockRenderer);
api.registerRenderer('QKanboardTaskPageProcessor', TaskPageProcessorBlockRenderer);
