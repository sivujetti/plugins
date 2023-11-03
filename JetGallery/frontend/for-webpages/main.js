/*
 * The "main" script of JetGallery -plugin: locates all div.jet-gallery -elements
 * from current page, and makes them interactive.
 */
import JetGallery from './JetGallery.js';

const jg = new JetGallery(document.documentElement.lang);
const galleries = jg.hookAllGalleries(document.body);

export default {
    getCurrentPageGalleries() {
        return galleries;
    },
};