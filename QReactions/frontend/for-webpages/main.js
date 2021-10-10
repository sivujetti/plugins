/*
 * The "main" script of Q reactions -plugin: finds all .q-reactions -elements
 * from current page, updates their states and makes their buttons clickable.
 */
import QReactions from './QReactions.js';

const qr = new QReactions;
qr.interactifyAllElements(document.body);
