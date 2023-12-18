# summerfi-api

## Lambdas

All lambdas should have a handler at index.handler.

## Build artifacts from sources

Run `npm run build` in this folder to build all lambdas or you can build each one separately by
using it's own command, check `package.json` scripts.

Build artifacts will be outputted to the `/artifacts` folder, as separate zip files for each lambda
function.

## Create a new lambda

- Create a new folder in `lambdas/lib` folder
-

## Local development

To test your function you can use
[SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
To install SAM go to the
[link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
and follow the instructions. If you are using MacOS, you can install it using
`brew install aws-sam-cli`.

1. Build your functions using `npm run build`
2. Copy the `env.json.template` to `env.json` using: `npm run prepare-env`
3. Start SAM using `npm run sam`

You can also use Docker Compose to run the API, but for now, it's kind of slow.
