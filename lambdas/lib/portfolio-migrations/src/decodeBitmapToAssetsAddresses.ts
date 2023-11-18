import { Address } from 'shared/domain-types'

export function decodeBitmapToAssetsAddresses(userConfigData: bigint, reservesList: readonly Address[]) {
  // Convert userConfig data to binary string
  const binaryString = userConfigData.toString(2)

  // Split binaryString into pairs
  const binaryPairs = binaryString.match(/.{1,2}/g) || []

  // Initialize an empty array to hold the indices
  const collateralIndices = []
  const debtIndices = []

  // Iterate over binaryPairs
  for (let i = 0; i < binaryPairs.length; i++) {
    // Check bits of each pair
    const [isCollateral, isDebt] = binaryPairs[i]
    if (Number(isCollateral)) {
      collateralIndices.push(i)
    } else if (Number(isDebt)) {
      debtIndices.push(i)
    }
  }

  // Select items from reservesList using indices
  const collAssetsAddresses = collateralIndices.map((index) => reservesList[index])
  const debtAssetsAddresses = debtIndices.map((index) => reservesList[index])

  // Now selectedItems contains the items from reservesList that are being used as collateral by the user
  return { collAssetsAddresses, debtAssetsAddresses } as const
}
