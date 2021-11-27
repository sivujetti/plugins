/*
 * The "main" script of JetForms -plugin: locates all form.jet-form -elements
 * from current page, and adds validation for them or shows a "message sent" message.
 */
import JetForms from './JetForms.js';

const jf = new JetForms(document.documentElement.lang);
jf.hookAllForms(document.body);
