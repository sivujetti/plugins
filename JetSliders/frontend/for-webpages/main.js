/*
 * The "main" script of JetSliders -plugin: locates all .jet-slider elements
 * in document.body and converts them into Keen Slider sliders.
 */
import JetSliders from './JetSliders.js';

const jetSliders = new JetSliders;

if (window.self === window.top)
    window.addEventListener('load', () => {
        jetSliders.activateAllSliders();
    });

export default jetSliders;
