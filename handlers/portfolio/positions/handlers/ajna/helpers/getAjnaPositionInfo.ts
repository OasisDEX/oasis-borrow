import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { AjnaDpmPositionsPool } from 'handlers/portfolio/positions/handlers/ajna/types'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import type { DpmList } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

interface getAjnaPositionInfoParams {
  apiVaults: Vault[]
  dpmList: DpmList
  isEarn: boolean
  pool: AjnaDpmPositionsPool
  positionId: string
  prices: TokensPricesList
  proxyAddress: string
}

export async function getAjnaPositionInfo({
  apiVaults,
  dpmList,
  isEarn,
  pool: { address: poolAddress, collateralToken, quoteToken },
  positionId,
  prices,
  proxyAddress,
}: getAjnaPositionInfoParams) {
  // get pool info contract
  const { ajnaPoolInfo } = getNetworkContracts(NetworkIds.MAINNET)

  // determine position type based on subgraph and db responses
  const defaultType = dpmList.filter(
    ({ id, positionType }) => id === proxyAddress && positionType !== OmniProductType.Earn,
  )[0]?.positionType as OmniProductBorrowishType
  const type = isEarn
    ? OmniProductType.Earn
    : getBorrowishPositionType({
        apiVaults,
        defaultType,
        networkId: NetworkIds.MAINNET,
        positionId: Number(positionId),
        protocol: LendingProtocol.Ajna,
      })

  // shorhands and formatting for better clarity
  const primaryToken = getTokenDisplayName(collateralToken.symbol)
  const primaryTokenAddress = collateralToken.address
  const secondaryToken = getTokenDisplayName(quoteToken.symbol)
  const secondaryTokenAddress = quoteToken.address
  const isOracless = isPoolOracless({
    networkId: NetworkIds.MAINNET,
    collateralToken: primaryToken,
    quoteToken: secondaryToken,
  })
  const url = `/${NetworkNames.ethereumMainnet}/${LendingProtocol.Ajna}/${type}/${
    isOracless ? primaryTokenAddress : primaryToken
  }-${isOracless ? secondaryTokenAddress : secondaryToken}/${positionId}`

  // prices for oracle positions is always equal to one
  const collateralPrice = isOracless
    ? one
    : new BigNumber(prices[collateralToken.symbol.toUpperCase()])
  const quotePrice = isOracless ? one : new BigNumber(prices[quoteToken.symbol.toUpperCase()])

  return {
    ajnaPoolInfo,
    collateralPrice,
    isOracless,
    poolAddress,
    primaryToken,
    quotePrice,
    secondaryToken,
    type,
    url,
  }
}
