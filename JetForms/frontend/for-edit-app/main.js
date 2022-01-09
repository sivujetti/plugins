import ContactFormBlockType from './ContactFormBlockType.jsx';
import EmailInputBlockType from './EmailInputBlockType.jsx';
import TextareaInputBlockType from './TextareaInputBlockType.jsx';
import TextInputBlockType from './TextInputBlockType.jsx';

window.sivujetti.blockTypes.register(ContactFormBlockType.name,
                                     ContactFormBlockType);
window.sivujetti.blockTypes.register(EmailInputBlockType.name,
                                     EmailInputBlockType);
window.sivujetti.blockTypes.register(TextareaInputBlockType.name,
                                     TextareaInputBlockType);
window.sivujetti.blockTypes.register(TextInputBlockType.name,
                                     TextInputBlockType);
