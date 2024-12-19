/*
 * The "main" script of JetSliders -plugin: locates all .jet-slider elements
 * in document.body and converts them into Keen Slider sliders.
 */
import JetSliders from './JetSliders.js';

const jetSliders = new JetSliders;

if (window.self === window.top) {
    const jetGalleriesLoadedBefore = !!window.JetGalleries;
    window.addEventListener('load', () => {
        const jetGalleriesIsInstalledButLoadedAfter = window.JetGalleries && !jetGalleriesLoadedBefore;
        if (jetGalleriesIsInstalledButLoadedAfter)
            document.addEventListener('JetGalleries:after-activate', () => jetSliders.activateAllSliders());
        else
            jetSliders.activateAllSliders();
    });
}

export default jetSliders;
