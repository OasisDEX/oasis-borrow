#!/usr/bin/env zx

import 'zx/globals'
import { exit } from 'process'

// Constants

const LAMBDA_NAMES = ['portfolio-assets', 'portfolio-migrations', 'portfolio-overview', 'get-triggers', 'setup-trigger']

// Main
await within(async () => {
  echo(`Clear artifacts...`)
  await $`rm -rf artifacts && mkdir -p artifacts`
})

const [lambdaName] = argv._
if (lambdaName) {
  await buildLambda(lambdaName)
} else {
  echo(`Build all lambdas...`)
  for (let name of LAMBDA_NAMES) {
    await buildLambda(name)
  }
}
echo(`Success`)

// Helpers

async function buildLambda(lambdaName) {
  if (!LAMBDA_NAMES.includes(lambdaName)) {
    echo(`Provide a valid lambda name: ${LAMBDA_NAMES.join(', ')}`)
    exit()
  }
  await within(async () => {
    cd(`lib/${lambdaName}`)
    const pkPath = path.join('package.json')
    const { name, version } = fs.readJSONSync(pkPath)
    echo(`\n--- ${name}-${version} ---`)
    echo(`Install deps...`)
    await $`npm install`
    echo(`Build dist...`)
    await $`npm run build`
    if (lambdaName === 'setup-trigger' || lambdaName === 'get-triggers') {
      echo(`ZIP dist...`)
      cd('dist')
      await $`zip -rq ../../../artifacts/${name}-${version}.zip index.js`
    } else {
      echo(`Package node_modules & dist...`)
      await $`zip -rq ../../artifacts/${name}-${version}.zip node_modules`
      cd(`dist`)
      await $`zip -rq ../../../artifacts/${name}-${version}.zip *`
    }
  })
}
