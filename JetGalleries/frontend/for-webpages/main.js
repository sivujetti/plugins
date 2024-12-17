/*
 * The "main" script of JetGalleries -plugin: locates all div.jet-gallery -elements
 * from current page, and makes them interactive.
 */

import {api} from '@sivujetti-commons-for-web-pages';
import JetGalleries, {areWeInEditMode, createLightboxCls} from './JetGalleries.js';

api.export('JetGalleries/Lightbox', createLightboxCls());

const jetGalleries = new JetGalleries(document.documentElement.lang);

window.addEventListener('load', () => {
    const event = new Event('JetGalleries:load');
    document.dispatchEvent(event);

    if (!areWeInEditMode())
        jetGalleries.hookAllGalleries(document.body);
});

export default jetGalleries;
