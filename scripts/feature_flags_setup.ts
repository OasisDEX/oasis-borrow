import { prisma } from '../server/prisma';

// TODD: Will need to get a list of all the feature flags that are currently set
const initialFeatureToggles = {
  testFeature: false,
  anotherTestFeature: false,
  automation: true,
  stopLossRead: false,
  stopLossWrite: false,
  batchCache: false,
  stopLossOpenFlow: false,
  basicBS: false,
  readOnlyBasicB: false,
  notifications: false,
  referrals: false,
  constantMultiple: false,
  constantMultipleReadOnly: false,
  disableSidebarScroll: false,
  proxyCreationDisabled: false,
  autoTakeProfit: true,
  updatedPnL: false,
  readOnlyAutoTakeProfit: false,
  discoverOasis: false,
  showAaveStETHETHProductCard: false
}

async function main() {

  let featuresToCreate = []

  for (const [key, value] of Object.entries(initialFeatureToggles)) {
    const feature = await prisma.featureFlag.findFirst({
      where: {
        feature: key
      }
    })

    if(!feature) {
      featuresToCreate.push({
        feature: key,
        enabled: value
      })
    }
  }

  await prisma.featureFlag.createMany({
    data: featuresToCreate
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
