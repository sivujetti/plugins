/*
 * The "main" script of JetGalleries -plugin: locates all div.jet-gallery -elements
 * from current page, and makes them interactive.
 */

import {api} from '@sivujetti-commons-for-web-pages';
import JetGalleries, {areWeInEditMode, createLightboxCls} from './JetGalleries.js';

api.export('JetGalleries/Lightbox', createLightboxCls());

const jetGalleries = new JetGalleries(document.documentElement.lang);

window.addEventListener('load', () => {
    document.dispatchEvent(new Event('JetGalleries:before-activate'));

    if (!areWeInEditMode())
        jetGalleries.hookAllGalleries(document.body);

    document.dispatchEvent(new Event('JetGalleries:after-activate'));
});

export default jetGalleries;
