# JetForms

Does forms.

# Installation

Temporary manual steps.

## Setup the database

```
if ($sqlite) {
CREATE TABLE `jetFormsSettings` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `bagName` TEXT NOT NULL,
    `data` JSON
);
} else {
CREATE TABLE `jetFormsSettings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `bagName` VARCHAR(92) NOT NULL,
    `data` JSON,
    PRIMARY KEY (`id`)
) DEFAULT CHARSET = utf8mb4";
}
INSERT INTO `jetFormsSettings` VALUES ('1','jetFormsMailSendSettings','{"sendingMethod":"mail","SMTP_host":null,"SMTP_port":null,"SMTP_username":null,"SMTP_password":null,"SMTP_secureProtocol":null}');
```

## Copy validation lib to public directory

Copy `plugins/JetForms/frontend/pristine/pristine.min.js` to `public/sivujetti/vendor/pristine.min.js`.

## Create pass-through files

Create file `SIVUJETTI_BACKEND_PATH . "assets/templates/jet-forms-block-contact-form.tmpl.php"` with following contents:

```php
<?php require SIVUJETTI_PLUGINS_PATH . "JetForms/templates/block-contact-form.tmpl.php" ?>
```

Create file `SIVUJETTI_BACKEND_PATH . "assets/templates/jet-forms-block-input-auto.tmpl.php"` with following contents:

```php
<?php require SIVUJETTI_PLUGINS_PATH . "JetForms/templates/block-input-auto.tmpl.php" ?>
```

Create file `SIVUJETTI_BACKEND_PATH . "assets/templates/jet-forms-block-inline-input-auto.tmpl.php"` with following contents:

```php
<?php require SIVUJETTI_PLUGINS_PATH . "JetForms/templates/block-inline-input-auto.tmpl.php" ?>
```

## Bundle frontend

See `frontend/rollup.config.js`.

## Fine-tune mailer configuration (optional)

Add to `site/Site.php`:

```php
<?php declare(strict_types=1);

namespace MySite;

use PHPMailer\PHPMailer\PHPMailer;
use SitePlugins\JetForms\JetForms;

/**
 * @psalm-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 */
class Site implements UserSiteInterface {
...
    public function __construct(UserSiteAPI $api) {
        ...
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            if (($jetForms = $api->getPlugin("JetForms")) === null)
                return;
            $api->on($jetForms::ON_MAILER_CONFIGURE,
            /**
             * @param \PHPMailer\PHPMailer\PHPMailer $mailer
             * @psalm-param JetFormsMailSendSettings $alreadyAppliedSettings
             */
            function (PHPMailer $mailer, array $alreadyAppliedSettings) {
                // You can mutate $mailer here with some custom stuff.
                // Note that $mailer is already configured with $alreadyAppliedSettings at this point.
            });
        });
...
```

# Developing

## Run backend tests

- `cd plugins/JetForms/`
- `"../../../backend/vendor/bin/phpunit" --bootstrap ./tests/bootstrap.php ./tests`

# License

GPLv3