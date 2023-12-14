import {api} from '@sivujetti-commons-for-edit-app';
import EditAppLeftColumnSection from './EditAppLeftColumnSection.jsx';

if (api.user.getRole() <= api.user.ROLE_EDITOR)
    api.mainPanel.registerSection('plugin:jetStaticExp', EditAppLeftColumnSection);
