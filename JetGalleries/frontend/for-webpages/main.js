/*
 * The "main" script of JetGalleries -plugin: locates all div.jet-gallery -elements
 * from current page, and makes them interactive.
 */
import JetGalleries, {areWeInEditMode} from './JetGalleries.js';

const jetGalleries = new JetGalleries(document.documentElement.lang);

if (!areWeInEditMode())
    jetGalleries.hookAllGalleries(document.body);

export default jetGalleries;