/*
This file is transpiled into 'public/plugin-jet-sliders-webpage-preview-renderer-app-bundle.js'.
*/

import {env} from '@sivujetti-commons-for-web-pages';
import {api} from '@sivujetti-webpage-preview-renderer-app';

api.export('ReRenderingWebPage', class SliderAwareReRenderingWebPage extends api.import('ReRenderingWebPage') {
    createRendererCls(Cls, block) {
        const Cls2 = super.createRendererCls(Cls, block);
        if (block.styleClasses.indexOf('jet-slider') > -1)
            return class Sliderified extends Cls2 {
                // elRef;
                /**
                 * @access protected
                 */
                componentWillMount() {
                    if (super.componentWillMount) super.componentWillMount();
                    this.elRef = preact.createRef();
                }
                /**
                 * @access protected
                 */
                componentDidMount() {
                    if (super.componentDidMount) super.componentDidMount();
                    if (window.JetGalleries?.isGallery(this.elRef.current)) {
                        waitForGalleryToLoad(this.elRef.current, doActivateSlider, window.JetGalleries);
                    } else {
                        doActivateSlider(this.elRef.current);
                    }
                }
                /**
                 * @access protected
                 */
                render(props, state, context) {
                    return super.render({...props, createDefaultProps: (...args) => ({
                        ...props.createDefaultProps(...args),
                        ref: this.elRef,
                    })}, state, context);
                }
            };
        return Cls2;
    }
});

/**
 * @param {HTMLElement} el
 * @param {(el: HTMLElement) => void} then
 * @param {JetGalleries} JetGalleries
 */
function waitForGalleryToLoad(el, then, JetGalleries, n = 1) {
    if (JetGalleries.isActivated(el)) {
        then(el);
    } else {
        if ((n * 60) > 1940) {
            env.window.console.debug('It seems that JetGallery failed to load');
            return;
        }
        setTimeout(() => {
            waitForGalleryToLoad(el, then, JetGalleries, n + 1);
        }, 60);
    }
}

/**
 * @param {HTMLElement} el
 */
function doActivateSlider(el) {
    if (!window.JetSliders.isActivated(el))
        window.JetSliders.activateSlider(el);
}
