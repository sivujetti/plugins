# Q reactions

Allows your site visitors to react (like, clap, kudos) to articles or pages.

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

## Bundle frontend

See `frontend/rollup.config.js`.

# Developing

## Run backend tests

- `cd plugins/QReactions/`
- `"../../../backend/vendor/bin/phpunit" --bootstrap ./tests/bootstrap.php ./tests`

# License

GPLv3