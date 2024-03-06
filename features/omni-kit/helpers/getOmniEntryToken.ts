import type BigNumber from 'bignumber.js'
import type { OmniProtocolSettings, OmniSupportedNetworkIds } from 'features/omni-kit/types'

export const getOmniEntryToken = ({
  collateralToken,
  quoteToken,
  isOpening,
  settings,
  networkId,
  ...rest
}: {
  isOpening: boolean
  collateralToken: string
  quoteToken: string
  settings: OmniProtocolSettings
  networkId: OmniSupportedNetworkIds
  collateralPrecision: number
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  collateralDigits: number
  collateralAddress: string
  collateralIcon: string
  quotePrecision: number
  quoteBalance: BigNumber
  quotePrice: BigNumber
  quoteDigits: number
  quoteAddress: string
  quoteIcon: string
}) => {
  const pair = `${collateralToken.toUpperCase()}-${quoteToken.toUpperCase()}`
  const entryTokenSymbol = settings?.entryTokens?.[networkId]?.[pair]

  if (entryTokenSymbol && isOpening) {
    const resolvedKey = entryTokenSymbol === collateralToken ? 'collateral' : 'quote'

    return {
      symbol: entryTokenSymbol,
      precision: rest[`${resolvedKey}Precision`],
      balance: rest[`${resolvedKey}Balance`],
      price: rest[`${resolvedKey}Price`],
      digits: rest[`${resolvedKey}Digits`],
      address: rest[`${resolvedKey}Address`],
      icon: rest[`${resolvedKey}Icon`],
    }
  }

  return {
    symbol: collateralToken,
    precision: rest.collateralPrecision,
    balance: rest.collateralBalance,
    price: rest.collateralPrice,
    digits: rest.collateralDigits,
    address: rest.collateralAddress,
    icon: rest.collateralIcon,
  }
}
