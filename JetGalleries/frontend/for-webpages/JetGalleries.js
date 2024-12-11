const {PhotoSwipeLightbox, PhotoSwipe} = window;
import {fi} from './translations.js';

/**
 * Makes div.jet-gallery elements alive.
 */
class JetGalleries {
    lang;
    galleries;
    /**
     * @param {string} lang 'en', 'fi' etc.
     */
    constructor(lang) {
        this.lang = lang;
        this.galleries = [];
    }
    /**
     * @param {HTMLElement} parentElement
     * @returns {Array<{getLightbox: () => Object;}>}
     * @access public
     */
    hookAllGalleries(parentElement) {
        const els = Array.from(parentElement.querySelectorAll('.jet-gallery'));
        if (!els.length) return;
        //
        this.galleries = els.map(galleryEl => {
            const listItems = galleryEl.querySelectorAll(':scope > .j-Image');
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
                lightbox = new PhotoSwipeLightbox({
                    gallery: galleryEl.parentElement,
                    children: 'a',
                    pswpModule: PhotoSwipe,
                    ...(this.lang === 'fi' ? fi : {})
                });
                if (galleryEl.classList.contains('use-captions'))
                    enableCaptions(lightbox);
                //
                lightbox.init();
            }
            return {
                getLightbox: () => lightbox,
            };
        });
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

export default JetGalleries;
