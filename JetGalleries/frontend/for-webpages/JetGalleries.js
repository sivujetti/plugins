import {api} from '@sivujetti-commons-for-web-pages';
import {fi} from './translations.js';
const {PhotoSwipeLightbox, PhotoSwipe} = window;

/**
 * Makes div.jet-gallery elements alive.
 */
class JetGalleries {
    // lang;
    // galleries;
    /**
     * @param {string} lang 'en', 'fi' etc.
     */
    constructor(lang) {
        this.lang = lang;
        this.galleries = [];
    }
    /**
     * @param {HTMLElement} parentElement
     * @returns {Array<{getLightbox: () => PhotoSwipeLightbox;}>}
     * @access public
     */
    hookAllGalleries(parentElement) {
        const els = Array.from(parentElement.querySelectorAll('.jet-gallery'));
        if (!els.length) return;
        //
        this.galleries = els.map(this.activateGallery.bind(this));
    }
    /**
     * @param {HTMLElement} el
     * @returns {{getLightbox: () => PhotoSwipeLightbox;}}
     * @access public
     */
    activateGallery(el) {
        const listItems = el.querySelectorAll(':scope > .j-Image');
        [...listItems].forEach(listItemEl => {
            const img = listItemEl.querySelector('img');
            const linkEl = document.createElement('a');
            linkEl.setAttribute('data-pswp-width', img.naturalWidth);
            linkEl.setAttribute('data-pswp-height', img.naturalHeight);
            linkEl.href = img.src;
            linkEl.appendChild(img);
            listItemEl.replaceWith(linkEl);
        });
        let lightbox = null;
        if (listItems.length) {
            const Cls = api.import('JetGalleries/Lightbox');
            lightbox = new Cls({
                gallery: el.parentElement,
                children: 'a',
                pswpModule: PhotoSwipe,
                ...(this.lang === 'fi' ? fi : {})
            });
            if (el.classList.contains('use-captions'))
                enableCaptions(lightbox);
            //
            lightbox.init();
        }
        return {
            getLightbox: () => lightbox,
        };
    }
    /**
     * @param {HTMLElement} el
     * @returns {boolean}
     * @access public
     */
    isActivated(el) {
        return !!el.querySelector(':scope > a[data-pswp-width]');
    }
    /**
     * @param {HTMLElement} el
     * @returns {boolean}
     * @access public
     */
    isGallery(el) {
        return el.classList.contains('jet-gallery');
    }
}

function createLightboxCls() {
    if (!areWeInEditMode())
        return PhotoSwipeLightbox;
    const isMac = platformIsMac();
    return class extends PhotoSwipeLightbox {
        /**
         * https://github.com/dimsemenov/PhotoSwipe/blob/d80c32a62b169e776ad1c983d1fcdc6eea8b48e0/src/js/lightbox/lightbox.js#L77
         *
         * @param {PointerEvent} e
         */
        onThumbnailsClick(e) {
            if (window.pswp) return;
            // if meta key is not pressed, ignore the click
            if ((isMac && !e.metaKey) || (!isMac && !e.ctrlKey)) return;

            /** @type {Point|null} */
            let initialPoint = { x: e.clientX, y: e.clientY };

            if (!initialPoint.x && !initialPoint.y) {
                initialPoint = null;
            }

            let clickedIndex = this.getClickedIndex(e);
            clickedIndex = this.applyFilters('clickedIndex', clickedIndex, e, this);
            /** @type {DataSource} */
            const dataSource = {
                gallery: /** @type {HTMLElement} */ (e.currentTarget)
            };

            if (clickedIndex >= 0) {
                e.preventDefault();
                this.loadAndOpen(clickedIndex, dataSource, initialPoint);
            }
        }
    };
}

/**
 * @param {PhotoSwipeLightbox} lightbox
 */
function enableCaptions(lightbox) {
    const styles = document.createElement('style');
    styles.setAttribute('data-injected-by', 'jet-gallery-plugin');
    styles.innerHTML = `.pswp__custom-caption {
        background: rgba(102, 102, 102, 0.75);
        color: #fff;
        padding: .2rem .5rem;
        border-radius: 4px;
        position: absolute;
        left: 50%;
        bottom: .4rem;
        transform: translateX(-50%);
    }`;
    document.head.appendChild(styles);
    //
    lightbox.on('uiRegister', () => {
        lightbox.pswp.ui.registerElement({
            name: 'custom-caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: 'Caption text',
            onInit: (el, _pswp) => {
                lightbox.pswp.on('change', () => {
                    const currSlideElement = lightbox.pswp.currSlide.data.element;
                    let captionHTML = '';
                    if (currSlideElement) {
                        const captionEl = currSlideElement.querySelector('figcaption') || currSlideElement.querySelector('.hidden-caption-content');
                        if (captionEl) {
                            // get caption from element with class hidden-caption-content
                            captionHTML = captionEl.innerHTML;
                        } else {
                            // get caption from alt attribute
                            captionHTML = currSlideElement.querySelector('img').getAttribute('alt');
                        }
                    }
                    el.innerHTML = captionHTML || '';
                });
            }
        });
    });
}

/**
 * @returns {boolean}
 */
function areWeInEditMode() {
    return window.self !== window.top;
}

/**
 * @returns {boolean}
 */
function platformIsMac() {
    return ((navigator.userAgentData && navigator.userAgentData.platform === 'macOS') ||
            (navigator.platform === 'MacIntel'));
}

export default JetGalleries;
export {areWeInEditMode, createLightboxCls};
