import createNavigationPlugin from './navigation-plugin.js';
const {KeenSlider} = window;

class JetSliders {
    // sliders = [];
    /**
     */
    constructor() {
        this.sliders = [];
    }
    /**
     * @param {HTMLElement} parentElement = document.body
     * @access public
     */
    activateAllSliders(parentElement = document.body) {
        this.sliders = [...parentElement.querySelectorAll('.jet-slider')].map(el => {
            const slider = this.activateSlider(el);
            return {
                getSlider: () => slider,
            };
        });
    }
    /**
     * @param {HTMLElement} el
     * @returns {KeenSlider}
     * @access public
     */
    activateSlider(el) {
        el.classList.add('keen-slider');
        [...el.children].forEach(childEl => {
            childEl.classList.add('keen-slider__slide');
        });
        return new KeenSlider(
            el,
            {
                loop: true,
            },
            [
                createNavigationPlugin(
                    el.classList.contains('show-arrows'),
                    el.classList.contains('show-bullets')
                ),
            ]
        );
    }
    /**
     * @param {HTMLElement} el
     * @returns {boolean}
     * @access public
     */
    isActivated(el) {
        return el.classList.contains('keen-slider');
    }
}

export default JetSliders;
