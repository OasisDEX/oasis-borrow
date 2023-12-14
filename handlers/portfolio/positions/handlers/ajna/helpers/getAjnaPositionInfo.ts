import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { networksById } from 'blockchain/networks'
import { omniBorrowishProducts } from 'features/omni-kit/constants'
import { AJNA_RAW_PROTOCOL_NAME } from 'features/omni-kit/protocols/ajna/constants'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaSupportedNetworksIds } from 'features/omni-kit/protocols/ajna/types'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { AjnaDpmPositionsPool } from 'handlers/portfolio/positions/handlers/ajna/types'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

interface getAjnaPositionInfoParams {
  apiVaults: Vault[]
  dpmList: DpmSubgraphData[]
  isEarn: boolean
  networkId: AjnaSupportedNetworksIds
  pool: AjnaDpmPositionsPool
  positionId: string
  prices: TokensPricesList
  proxyAddress: string
}

export async function getAjnaPositionInfo({
  apiVaults,
  dpmList,
  isEarn,
  networkId,
  pool: { address: poolAddress, collateralToken, quoteToken },
  positionId,
  prices,
  proxyAddress,
}: getAjnaPositionInfoParams) {
  // get pool info contract
  const { ajnaPoolInfo } = getNetworkContracts(networkId)

  // determine position type based on subgraph and db responses
  const defaultType = dpmList
    .find(({ id }) => id === proxyAddress)
    ?.createEvents.find(
      ({
        collateralToken: eventCollateralToken,
        debtToken: eventDebtToken,
        positionType: eventPositionType,
        protocol: eventProtocol,
      }) => {
        return (
          eventCollateralToken === collateralToken.address &&
          eventDebtToken === quoteToken.address &&
          eventProtocol === AJNA_RAW_PROTOCOL_NAME &&
          ((isEarn && eventPositionType === OmniProductType.Earn) ||
            (!isEarn && omniBorrowishProducts.includes(eventPositionType)))
        )
      },
    )?.positionType as OmniProductBorrowishType

  const type = isEarn
    ? OmniProductType.Earn
    : getBorrowishPositionType({
        apiVaults,
        defaultType,
        networkId,
        positionId: Number(positionId),
        protocol: LendingProtocol.Ajna,
      })

  // shorhands and formatting for better clarity
  const primaryToken = getTokenDisplayName(collateralToken.symbol)
  const primaryTokenAddress = collateralToken.address
  const secondaryToken = getTokenDisplayName(quoteToken.symbol)
  const secondaryTokenAddress = quoteToken.address
  const isOracless = isPoolOracless({
    networkId,
    collateralToken: primaryToken,
    quoteToken: secondaryToken,
  })
  const url = `/${networksById[networkId].name}/${LendingProtocol.Ajna}/${type}/${
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
