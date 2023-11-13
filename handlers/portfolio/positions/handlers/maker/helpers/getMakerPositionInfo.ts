import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { MakerDiscoverPositionsIlk } from 'handlers/portfolio/positions/handlers/maker/types'
import type { TokensPrices } from 'handlers/portfolio/positions/helpers'
import { getBorrowishPositionType } from 'handlers/portfolio/positions/helpers'
import { LendingProtocol } from 'lendingProtocols'

interface getMakerPositionInfoParams {
  apiVaults: Vault[]
  cdp: string
  ilk: MakerDiscoverPositionsIlk
  normalizedDebt: string
  prices: TokensPrices
  type: string
}

export async function getMakerPositionInfo({
  apiVaults,
  cdp,
  ilk,
  normalizedDebt,
  prices,
  type,
}: getMakerPositionInfoParams) {
  const {
    ilk: ilkLabel,
    pip: { value },
    rate,
    tokenSymbol,
  } = ilk

  // determine position type based on subgraph and db responses
  const resolvedType =
    type === 'Guni' || tokenSymbol === 'G-UNI'
      ? OmniProductType.Earn
      : getBorrowishPositionType({
          apiVaults,
          networkId: NetworkIds.MAINNET,
          positionId: Number(cdp),
          protocol: LendingProtocol.Maker,
        })

  // shorhands and formatting for better clarity
  const collateralPrice = new BigNumber(value)
  const daiPrice = new BigNumber(prices['DAI'])
  const debt = new BigNumber(normalizedDebt).times(rate)
  const [earnToken] = ilkLabel.split('-')
  const primaryToken =
    tokenSymbol === 'WETH'
      ? 'ETH'
      : resolvedType === OmniProductType.Earn
      ? earnToken
      : tokenSymbol.toUpperCase()
  const secondaryToken = resolvedType === OmniProductType.Earn ? earnToken : 'DAI'
  const url = `/${NetworkNames.ethereumMainnet}/${LendingProtocol.Maker}/${cdp}`

  return {
    collateralPrice,
    daiPrice,
    debt,
    primaryToken,
    secondaryToken,
    type: resolvedType,
    url,
  }
}
