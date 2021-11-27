# JetForms

Does forms.

# Installation

Temporary manual steps.

## Copy validation lib to public directory

Copy `plugins/JetForms/frontend/pristine/pristine.min.js` to `public/sivujetti/vendor/pristine.min.js`.

## Create pass-through file

`SIVUJETTI_BACKEND_PATH . "assets/jet-forms-block-contact-form.tmpl.php.php"`:

```php
<?php require SIVUJETTI_BACKEND_PATH . "plugins/QReactions/templates/block-contact-form.tmpl.php" ?>
```

## Bundle frontend

See `frontend/rollup.config.js`.

# License

GPLv3