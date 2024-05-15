import createInputBlockType from './common/InputBlockType.jsx';
import StylesEditForm from '../new-styles-stuff/TextInputBlockVisualStylesEditForm.jsx';

const textInputBlockType = createInputBlockType({
    name: 'TextInput',
    friendlyName: 'Short text input (JetForms)',
    icon: 'letter-t',
    StylesEditForm,
});

export default textInputBlockType;