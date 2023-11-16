#!/usr/bin/env zx

import 'zx/globals'
import { exit } from 'process'

// Constants

const LAMBDA_NAMES = ['portfolio-assets', 'portfolio-migrations', 'portfolio-overview']

// Main
await within(async () => {
  echo(`Prepare...`)
  await $`mkdir -p artifacts`
  echo(`Build shared...`)
  cd(`lib/shared`)
  await $`npm install`
  await $`npm run tsc`
})

const [lambdaName] = argv._
if (lambdaName) {
  await buildLambda(lambdaName)
} else {
  echo(`Building all lambdas...`)
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
    echo(`--- ${name}-${version} ---`)
    echo(`Building...`)
    await $`npm install`
    await $`npm run tsc`
    echo(`Packaging...`)
    await $`zip -r ../../artifacts/${name}-${version}.zip node_modules`
    cd(`dist`)
    await $`zip -r ../../../artifacts/${name}-${version}.zip *`
  })
}
