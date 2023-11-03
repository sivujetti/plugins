# JetGallery

Image galleries and beyond.

# Installation

## Copy lighbox lib to public directory

Copy `plugins/JetGallery/frontend/photoswipe/photoswipe-lightbox.umd.min.js` to `public/sivujetti/vendor/photoswipe-lightbox.umd.min.js`.
Copy `plugins/JetGallery/frontend/photoswipe/photoswipe.umd.min.js` to `public/sivujetti/vendor/photoswipe.umd.min.js`.
Copy `plugins/JetGallery/frontend/photoswipe/photoswipe.css` to `public/sivujetti/vendor/photoswipe.css`.

## Bundle frontend

See `frontend/rollup.config.js`.

# Developing

## Run backend tests

- `cd plugins/JetGallery/`
- `"../../../backend/vendor/bin/phpunit" --display-warnings --bootstrap ./tests/bootstrap.php ./tests`

# Docs

How to's.

## Frontend api

`const gallery = window.JetGallery.getCurrentPageGalleries()[0]`

```
interface JetGallery  {
    getCurrentPageGalleries(): Array<JetGalleryController>;
}
interface JetGalleryController {
    getLightbox(): Object;
}
```

# License

GPLv3