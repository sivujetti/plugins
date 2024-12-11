# JetGalleries

Image galleries and beyond.

# Installation

## Copy lighbox lib to public directory

Copy `plugins/JetGalleries/frontend/photoswipe/photoswipe-lightbox.umd.min.js` to `public/sivujetti/vendor/photoswipe-lightbox.umd.min.js`.
Copy `plugins/JetGalleries/frontend/photoswipe/photoswipe.umd.min.js` to `public/sivujetti/vendor/photoswipe.umd.min.js`.
Copy `plugins/JetGalleries/frontend/photoswipe/photoswipe.css` to `public/sivujetti/vendor/photoswipe.css`.

## Bundle frontend

See `frontend/rollup.config.js`.

# Docs

How to's.

## Frontend api

```
todo window.addEventListener('JetGalleries:load', {
    const gallery = window.JetGalleries.getCurrentPageGalleries()[0]
});
```

```
interface JetGalleries  {
    getCurrentPageGalleries(): Array<JetGalleryController>;
}
interface JetGalleryController {
    getLightbox(): Object;
}
```

# License

GPLv3