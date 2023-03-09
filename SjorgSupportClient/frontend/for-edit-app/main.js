import {api} from '@sivujetti-commons-for-edit-app';
import EditAppLeftColumnSection from './EditAppLeftColumnSection.jsx';

api.mainPanel.registerSection('plugin:sjorgSupportClient', EditAppLeftColumnSection);

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
    line-height: 1.2rem;
}
form.sjorg-support-article section h2 {
    font-size: 1.1rem;
}
form.sjorg-support-article > div > section {
    margin: 4rem 0;
}
form.sjorg-support-article > div > section:nth-of-type(2) {
    margin-top: .4rem;
}
form.sjorg-support-article > div > section:last-of-type {
    margin-bottom: 0;
}
form.sjorg-support-article > div > section:first-child {
    display: none;
}
form.sjorg-support-article > div > section section {
    margin-bottom: 2rem;
}
form.sjorg-support-article > div > section section:last-of-type {
    margin-bottom: 0;
}
form.sjorg-support-article img {
    max-width: 448px;
}
.message-box {
    position: relative;
    padding: 2.1rem 1rem 0.8rem !important;
    border-left: .2rem solid $blue-100;
    box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 5%), 0 0 0.05rem rgb(0 0 0 / 10%);
    font-size: .75rem;
    border-radius: 2px;
    margin: 1rem 0 0.8rem 0;
    line-height: 1rem;
}
.message-box:before {
    content: "Info";
    position: absolute;
    left: 0;
    top: 0;
    padding-left: 0.6rem;
    width: 100%;
    font-weight: bold;
    line-height: 1.5rem;
}
.message-box.info {
    border-left: .2rem solid var(--color-blue);
}
.message-box.info:before {
    background-color: rgba(33, 150, 243, .05);
}
.message-box p {
    margin: 0;
}
.j-Text-unit-1, .j-RichText-unit-1 {
    background-color: rgba(0, 10, 71, .03);
    border-radius: 4px;
    padding: .4rem .6rem;
    font-size: .7rem;
    line-height: 1rem;
    color: #1c1c1c;
    margin-bottom: 1.2rem;

    font-family: "SF Mono","Segoe UI Mono","Roboto Mono",Menlo,Courier,monospace;
    white-space: pre;
}
.j-Text-unit-1 > p,
.j-RichText-unit-1 > p {
    font-family: inherit;
    line-height: inherit;
    margin: 0;
}
`
    );
    document.head.appendChild(el);
}, 1000);
