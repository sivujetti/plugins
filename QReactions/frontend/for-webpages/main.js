/*
 * The "main" script of Q reactions -plugin: locates all .q-reaction-buttons -elements
 * from current page, updates their states and makes their buttons clickable.
 */
import QReactions from './QReactions.js';

const qr = new QReactions;
qr.interactifyAllElements(document.body);
