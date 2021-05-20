<br>
<br>
<div align="center">
  <img src="https://github.com/OasisDEX/oasis-borrow/blob/pm/readme-updates/public/static/img/new-logo.svg" width="500">
</div>
<br>
<br>

# Oasis Borrow

[![codecov](https://codecov.io/gh/OasisDEX/oasis-borrow/branch/dev/graph/badge.svg?token=KMXTAUFL48)](https://codecov.io/gh/OasisDEX/oasis-borrow)

> Generate Dai using your crypto as collateral

Oasis Borrow is the most popular interface to interact with the Maker protocol. It enables our users
to generate Dai, the most used and decentralized stablecoin, using a variety of crypto assets as
collateral.

### Getting Started

In order to start developing locally, please clone the repository

```sh
git clone https://github.com/OasisDEX/oasis-borrow.git
```

Navigate to the project folder and install all dependencies

```sh
yarn
```

To create up a local development instance we must first spin up the database prior before starting
the web server.

```sh
# Open one terminal and run:
./scripts/dev.sh
```

Monitor the logs and wait for the migrations to complete. This should be evident by a log equivalent
to `Migrations DONE`

In a second terminal we can then serve the web server instance over http or https (https is required
for some wallets):

```sh
yarn start

# Optionally
HTTPS=true yarn start
```

Site is viewable on [http://localhost:3000](http://localhost:3000) or
[https://localhost:3443](https://localhost:3443) respectively

#### Storybook

We utilise storybook for visualising some of our ui components in isolation.

```sh
yarn storybook
```

Our stories can then be viewed on http://localhost:6006

#### Hardhat

In addition, we make use of hardhat in order to test the application in a controlled mainnet-like
environment. More details can be found [here](./HARDHAT.md)

<br>

### Deployments

Oasis Borrow has two deployment environments:

- staging ->
  <a href="https://staging.oasis.app/borrow" target="_blank">https://staging.oasis.app/borrow</a>
- production -> <a href="https://oasis.app/borrow" target="_blank">https://oasis.app/borrow</a>

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

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

It might be useful to test an app against an actual mainnet state with some modifications. We use
Hardhat node for that. In order to read more about this setup go to the
[separate docs page](./HARDHAT.md)
