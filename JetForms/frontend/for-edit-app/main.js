import {api} from '@sivujetti-commons-for-edit-app';
import ContactFormBlockType from './ContactFormBlockType.jsx';
import CheckboxInputBlockType from './CheckboxInputBlockType.jsx';
import EmailInputBlockType from './EmailInputBlockType.jsx';
import TextareaInputBlockType from './TextareaInputBlockType.jsx';
import TextInputBlockType from './TextInputBlockType.jsx';
import SubscriptionFormBlockType from './SubscriptionFormBlockType.jsx';

api.blockTypes.register(CheckboxInputBlockType.name, () => CheckboxInputBlockType);
api.blockTypes.register(ContactFormBlockType.name, () => ContactFormBlockType);
api.blockTypes.register(EmailInputBlockType.name, () => EmailInputBlockType);
api.blockTypes.register(TextareaInputBlockType.name, () => TextareaInputBlockType);
api.blockTypes.register(TextInputBlockType.name, () => TextInputBlockType);
api.blockTypes.register(SubscriptionFormBlockType.name, () => SubscriptionFormBlockType);
