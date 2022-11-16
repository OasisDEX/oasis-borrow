import { prisma } from '../server/prisma';


async function main () {
  await prisma.featureFlag.createMany({
    data: [
      {
        feature: 'testFeature',
        enabled: false
      },
      {
        feature: 'autoTakeProfit',
        enabled: false
      },
      {
        feature: 'automation',
        enabled: false
      }
    ]
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
