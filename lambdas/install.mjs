#!/usr/bin/env zx

import 'zx/globals'
import { exit } from 'process'

// Constants

const LAMBDA_NAMES = ['portfolio-assets', 'portfolio-migrations', 'portfolio-overview']

// Main
const [lambdaName] = argv._
if (lambdaName) {
  await installLambda(lambdaName)
} else {
  echo(`Install all lambdas...`)
  for (let name of LAMBDA_NAMES) {
    await installLambda(name)
  }
}
echo(`Success`)

// Helpers

async function installLambda(lambdaName) {
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
  })
}
