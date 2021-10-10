# Q reactions

Allow your site visitors to react (like, clap, kudos) to articles or pages.

# Installation

Temporary manual steps.

## Schema - Sqlite

```sql
DROP TABLE IF EXISTS QReactionsReactions;
CREATE TABLE QReactionsReactions (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `reactionType` TEXT NOT NULL, -- 'thumbsUp'|'funny' etc.
    `submissionIdentityType` TEXT NOT NULL, -- 'userId' or 'ipAddr'
    `submissionIdentityValue` TEXT NOT NULL, -- The value of userId or sha1'd REMOTE_ADDR
    `linkedToEntityType` TEXT NOT NULL, -- 'Page', 'Article' etc.
    `linkedToEntityId` TEXT NOT NULL, -- Id of the page, article etc.
    `submittedAt` INTEGER NOT NULL -- timestamp
);
```

## Schema - MariaDb

```sql
DROP TABLE IF EXISTS QReactionsReactions;
CREATE TABLE QReactionsReactions (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `reactionType` VARCHAR(64) NOT NULL,
    `submissionIdentityType` CHAR(6) NOT NULL,
    `submissionIdentityValue` VARCHAR(40) NOT NULL,
    `linkedToEntityType` VARCHAR(92) NOT NULL,
    `linkedToEntityId` VARCHAR(92) NOT NULL,
    `submittedAt` INT(10) UNSIGNED NOT NULL,
    PRIMARY KEY (`id`)
);
```

## Create pass-through file

`SIVUJETTI_BACKEND_PATH . "assets/q-reactions-block-reaction-buttons.tmpl.php"`:

```php
<?php require SIVUJETTI_BACKEND_PATH . "plugins/QReactions/templates/block-reaction-buttons.tmpl.php" ?>
```

## Bundling frontend

See `frontend/rollup.config.js`.

# License

GPLv3