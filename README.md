# Oasis Borrow [![codecov](https://codecov.io/gh/OasisDEX/oasis-borrow/branch/dev/graph/badge.svg?token=KMXTAUFL48)](https://codecov.io/gh/OasisDEX/oasis-borrow)

- TypeScript
- Next.js
- Eslint with TypeSTRICT
- Prettier

### Frontend

```sh
yarn
yarn start
```

If you want to serve the web server over HTTPS (required for Ledger) use:

```sh
HTTPS=true yarn start
```

### Backend dependencies

```sh
# this will block terminal window so please use another one
./scripts/dev.sh
```

## Development

#### Storybook

```sh
yarn storybook
```

### Backend

#### Prisma

We use [Prisma Client](https://github.com/prisma/prisma-client-js) for type-safe database
communication.

To regenerate schema based on the current state of a database run:

```
yarn prisma:introspect
```

To generate client based on schema run (it runs automatically after postinstall):

```
yarn prisma:generate
```

#### Migrations

We use raw SQLs for migrations. They are stored in `server/database/migrations`. We use
[`postgres-migrations`](https://www.npmjs.com/package/postgres-migrations).

```
yarn migrate
```

## i18n - Internationalisation

Configuration file `i18n.ts` located in root directory allows to define available languages, default
language, translation namespaces and language detection methods.

Currently supported language detection method and they precedence:

1. `landing-page-language-detection` - Custom detection based on root path with language param, e.g
   `/en` . Used for landing page. Not possible to use with subdirectories like `/en/dashboard`
2. `querystring` - Applicable to any url with `lang` query string param, e.g. `/dashboard?lang=es`
3. `cookie` - Language param is set by other methods and stored in browser cookies. Any url without
   lang url param or query param will use this method to determine user language if cookie is
   already set.
4. `header` - Applicable if none of the above method was applied. Language is determined by
   `Accept-Language` header, which reflects user's default language set in a browser.

Translation json files are located in `/public/locales/`, in corresponding directories.

Component that is using i18n should instantiate translation method via hook (optionally passing
corresponding translation namespace):

`const { t } = useTranslation('dashboard')`

From this point translation engine can be used by passing key to `t` method:

`<Heading>{t('buy')}</Heading>`

Key needs to exist in every translation json for every language (and namespace).

For detailed i18next documentation please visit [i18n docs](https://www.i18next.com/)

## Hardhat mainnet testing

It might be useful to test an app against an actual mainnet state with some modifications. We use Hardhat node for that. In order to read more about this setup go to the [separate docs page](./HARDHAT.md)


## Runnning Oasis Borrow Cache locally with Hardhat

Setup Hardhat following above instructions.

#Local Cache instance

Get Cache from [https://github.com/oasisDEX/oasis-borrow-cache](this repo)

Ensure you are using node 12 for the db (./scripts/dev.sh)

In Cache repo run:

`./scripts/dev.sh`

In other terminal window run:

`yarn start-etl`

In next terminal window run:

`yarn start-api`