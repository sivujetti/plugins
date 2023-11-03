const {PhotoSwipeLightbox, PhotoSwipe} = window;
import {fi} from './translations.js';

let galleriesHooked = false;

/**
 * Makes div.jet-gallery elements alive.
 */
class JetGallery {
    // lang:
    /**
     * @param {String} lang 'en', 'fi' etc.
     */
    constructor(lang) {
        this.lang = lang;
    }
    /**
     * @param {HTMLElement} parentElement
     * @returns {Array<{getLightbox: () => Object;}>}
     * @access public
     */
    hookAllGalleries(parentElement) {
        if (galleriesHooked) return;
        const els = Array.from(parentElement.querySelectorAll('.jet-gallery'));
        if (!els.length) return;
        //
        return els.map(galleryEl => {
            const listItems = galleryEl.querySelectorAll('a');
            if (!listItems.length) return null;
            //
            Array.from(listItems).forEach(listItemEl => {
                const img = listItemEl.querySelector('img');
                listItemEl.setAttribute('data-pswp-width', img.naturalWidth);
                listItemEl.setAttribute('data-pswp-height', img.naturalHeight);
            });
            const lightbox = new PhotoSwipeLightbox({
                ...{
                    gallery: listItems[0].parentElement,
                    children: 'a',
                    pswpModule: PhotoSwipe,
                },
                ...(this.lang === 'fi' ? fi : {})
            });
            if (galleryEl.getAttribute('data-use-captions') === 'yes')
                enableCaptions(lightbox);
            //
            lightbox.init();
            //
            return {
                getLightbox: lightbox,
            };
        }).filter(ctrl => ctrl !== null);
    }
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

export default JetGallery;
