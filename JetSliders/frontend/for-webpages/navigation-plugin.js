/**
 * @param {boolean} showArrows
 * @param {boolean} showBullets
 * @returns {(slider: KeenSlider) => void}
 */
function createNavigationPlugin(showArrows, showBullets) {
    const pathLeft = 'M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z';
    const pathRight = 'M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z';
    const createArrowSvg = pathMarkup =>
        '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">' +
            '<path d="' + pathMarkup + '"/>' +
        '</svg>';
    /**
     * @param {KeenSlider} slider
     */
    return slider => {
        let wrapper, arrowLeft, arrowRight, dots;

        function markup(remove) {
            wrapperMarkup(remove);
            if (showArrows) arrowMarkup();
            if (showBullets) dotMarkup();
        }

        function wrapperMarkup(remove) {
            if (remove) {
                wrapper.parentNode.removeChild(wrapper);
                return;
            }
            wrapper = createDiv('navigation-wrapper');
            slider.container.appendChild(wrapper);
        }

        function arrowMarkup() {
            arrowLeft = createDiv('arrow arrow--left', createArrowSvg(pathLeft));
            arrowLeft.addEventListener('click', () => slider.prev());
            arrowRight = createDiv('arrow arrow--right', createArrowSvg(pathRight));
            arrowRight.addEventListener('click', () => slider.next());

            wrapper.appendChild(arrowLeft);
            wrapper.appendChild(arrowRight);
        }

        function dotMarkup() {
            dots = createDiv('dots');
            slider.track.details.slides.forEach((_e, idx) => {
                const dot = createDiv('dot');
                dot.addEventListener('click', () => slider.moveToIdx(idx));
                dots.appendChild(dot);
            });
            wrapper.appendChild(dots);
        }

        function updateClasses() {
            const slide = slider.track.details.rel;
            if (showArrows) {
                if (slide === 0) arrowLeft.classList.add('arrow--disabled');
                else arrowLeft.classList.remove('arrow--disabled');
                if (slide === slider.track.details.slides.length - 1) arrowRight.classList.add('arrow--disabled');
                else arrowRight.classList.remove('arrow--disabled');
            }
            if (showBullets)
                [...dots.children].forEach(function (dot, idx) {
                    if (idx === slide) dot.classList.add('dot--active');
                    else dot.classList.remove('dot--active');
                });
        }

        slider.on('created', () => {
            markup(!!wrapper);
            updateClasses();
        });
        slider.on('optionsChanged', () => {
            markup(true);
            markup();
            updateClasses();
        });
        slider.on('slideChanged', () => {
            updateClasses();
        });
        slider.on('destroyed', () => {
            markup(true, true);
        });
    };
}

function createDiv(className, content = '') {
    const div = document.createElement('div');
    const classNames = className.split(' ');
    classNames.forEach(name => div.classList.add(name));
    if (content) div.innerHTML = content;
    return div;
}

export default createNavigationPlugin;
