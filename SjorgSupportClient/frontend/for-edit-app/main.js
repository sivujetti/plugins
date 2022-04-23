import {api} from '@sivujetti-commons-for-edit-app';
import EditAppMainPanelSection from './EditAppMainPanelSection.jsx';

api.mainPanel.registerSection('plugin:sjorgSupportClient', EditAppMainPanelSection);

setTimeout(() => {
    const el = document.createElement('style');
    el.setAttribute('data-injected-by', 'sjorg-support-client-plugin');
    el.innerHTML = (
`.icon-tabler.colored {
  background-color: #8b67c8;
  padding: .1rem;
  border-radius: 14px;
  color: #fff;
}
form.sjorg-support-article {
    font-size: .8rem;
}
form.sjorg-support-article section {
    padding: 1rem 0;
}
form.sjorg-support-article img {
    max-width: 60%;
}
p.message-box {
    position: relative;
    padding: 2.1rem 1rem 0.8rem;
    border-left: .2rem solid $blue-100;
    box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 5%), 0 0 0.05rem rgb(0 0 0 / 10%);
    font-size: .75rem;
    border-radius: 2px;
    margin: 1.8rem 0 1rem 0;
    line-height: 1rem;
}
p.message-box:before {
    content: "Info";
    position: absolute;
    left: 0;
    top: 0;
    padding-left: 0.6rem;
    width: 100%;
    font-weight: bold;
    line-height: 1.5rem;
}
p.message-box.info {
    border-left: .2rem solid var(--color-blue);
}
p.message-box.info:before {
    background-color: rgba(33, 150, 243, .05);
}
div#toaster-editAppMain {
    position: fixed;
    left: 1rem;
    bottom: 1rem;
    z-index: 2;
}
div#toaster-editAppMain > .box {
    padding: 1rem !important;
}
`
    );
    document.head.appendChild(el);
}, 1000);
