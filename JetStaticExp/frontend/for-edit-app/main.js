import {api} from '@sivujetti-commons-for-edit-app';
import EditAppLeftColumnSection from './EditAppLeftColumnSection.jsx';

if (api.user.getRole() <= api.user.ROLE_EDITOR)
    api.menuPanel.registerSection('plugin:jetStaticExp', EditAppLeftColumnSection);

setTimeout(() => {
    const el = document.createElement('style');
    el.setAttribute('data-injected-by', 'jet-static-exp-plugin');
    el.innerHTML = (
`form.static-exp-form .fieldset {
    margin-bottom: 2rem;
}
form.static-exp-form .fieldset > .legend + div {
    padding: .0rem .4rem .3rem .4rem !important;
}`
    );
    document.head.appendChild(el);
}, 900);
