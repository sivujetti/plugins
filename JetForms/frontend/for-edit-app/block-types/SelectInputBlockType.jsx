import services from '../services.js';
import {createSelectOrOptionSelectItemCreator} from './common/SelectOrRadioGroupInputOptionEditForm.jsx';
import EditForm from './SelectInputBlockEditForm.jsx';

export default {
    name: 'JetFormsSelectInput',
    friendlyName: 'Select input (JetForms)',
    icon: 'selector',
    editForm: EditForm,
    stylesEditForm: 'default',
    createOwnProps(_defProps) {
        return {
            name: services.idGen.getNextId(),
            label: '',
            options: [createSelectOrOptionSelectItemCreator().createNewItem()],
            multiple: 0,
        };
    },
};
