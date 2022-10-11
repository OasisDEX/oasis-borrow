import BigNumber from 'bignumber.js'
import mainnet from 'blockchain/addresses/mainnet.json'

const reserveNamesDictionary = Object.fromEntries(
  Object.entries(mainnet).map((mainnetEntry) => mainnetEntry.reverse()),
)

export function createAaveUserConfiguration(
  aaveUserConfiguration?: string[],
  aaveReserveList?: string[],
) {
  // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getuserconfiguration
  if (!aaveUserConfiguration?.length || !aaveReserveList?.length) return {}

  return (
    String(new BigNumber(aaveUserConfiguration[0]).toString(2))
      .match(/.{1,2}/g)
      ?.reverse() // reverse, cause we need to start from the end
      .map(
        ([collateral, borrowed], reserveIndex) =>
          reserveNamesDictionary[aaveReserveList[reserveIndex]] && {
            collateral: !!Number(collateral),
            borrowed: !!Number(borrowed),
            asset: aaveReserveList[reserveIndex],
            assetName: reserveNamesDictionary[aaveReserveList[reserveIndex]],
          },
      )
      .filter(Boolean) || []
  )
}
