const {PhotoSwipeLightbox, PhotoSwipe} = window;

let galleriesHooked = false;

/**
 * Makes div.jet-gallery elements alive.
 */
class JetGallery {
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
                gallery: listItems[0].parentElement,
                children: 'a',
                pswpModule: PhotoSwipe,
            });
            //
            lightbox.init();
            //
            return {
                getLightbox: lightbox,
            };
        }).filter(ctrl => ctrl !== null);
    }
}

export default JetGallery;
