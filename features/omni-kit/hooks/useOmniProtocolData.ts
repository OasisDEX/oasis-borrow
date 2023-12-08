import { getNetworkContracts } from 'blockchain/contracts'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import { getToken } from 'blockchain/tokensMetadata'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { getStaticDpmPositionData$ } from 'features/omni-kit/observables'
import type { OmniProductType, OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

interface OmniProtocolDataProps {
  collateralToken: string
  isOracless?: boolean
  positionId?: string
  productType: OmniProductType
  protocol: LendingProtocol
  protocolRaw: string
  quoteToken: string
  networkId: OmniSupportedNetworkIds
}

export function useOmniProtocolData({
  collateralToken,
  isOracless,
  positionId,
  productType,
  protocol,
  protocolRaw,
  quoteToken,
  networkId,
}: OmniProtocolDataProps) {
  const { walletAddress } = useAccount()
  const { gasPrice$ } = useMainContext()
  const { userSettings$ } = useAccountContext()
  const { balancesFromAddressInfoArray$, balancesInfoArray$, dpmPositionDataV2$, tokenPriceUSD$ } =
    useProductContext()

  const [userSettingsData, userSettingsError] = useObservable(userSettings$)
  const [gasPriceData, gasPriceError] = useObservable(gasPrice$)

  const tokensAddresses = useMemo(() => getNetworkContracts(networkId).tokens, [networkId])

  const [identifiedTokensData] = useObservable(
    useMemo(
      () =>
        isOracless && collateralToken && quoteToken
          ? identifyTokens$(networkId, [collateralToken, quoteToken])
          : EMPTY,
      [networkId, isOracless, collateralToken, quoteToken],
    ),
  )

  const [dpmPositionData, dpmPositionError] = useObservable(
    useMemo(
      () =>
        positionId
          ? dpmPositionDataV2$(
              getPositionIdentity(positionId),
              networkId,
              collateralToken,
              quoteToken,
              productType,
              protocol,
              protocolRaw,
            )
          : !isOracless && productType && collateralToken && quoteToken
          ? getStaticDpmPositionData$({
              collateralToken,
              collateralTokenAddress: tokensAddresses[collateralToken].address,
              product: productType,
              protocol,
              quoteToken,
              quoteTokenAddress: tokensAddresses[quoteToken].address,
            })
          : isOracless && identifiedTokensData && productType && collateralToken && quoteToken
          ? getStaticDpmPositionData$({
              collateralToken: identifiedTokensData[collateralToken].symbol,
              collateralTokenAddress: collateralToken,
              product: productType,
              protocol,
              quoteToken: identifiedTokensData[quoteToken].symbol,
              quoteTokenAddress: quoteToken,
            })
          : EMPTY,
      [
        isOracless,
        positionId,
        networkId,
        collateralToken,
        quoteToken,
        productType,
        identifiedTokensData,
        tokensAddresses,
      ],
    ),
  )

  const [ethBalanceData, ethBalanceError] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? balancesInfoArray$(['ETH'], walletAddress || dpmPositionData.user)
          : EMPTY,
      [dpmPositionData, walletAddress],
    ),
  )

  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        !isOracless && dpmPositionData
          ? balancesInfoArray$(
              [dpmPositionData.collateralToken, dpmPositionData.quoteToken],
              walletAddress || dpmPositionData.user,
            )
          : isOracless && dpmPositionData && identifiedTokensData && collateralToken && quoteToken
          ? balancesFromAddressInfoArray$(
              [
                {
                  address: collateralToken,
                  precision: identifiedTokensData[collateralToken].precision,
                },
                {
                  address: quoteToken,
                  precision: identifiedTokensData[quoteToken].precision,
                },
              ],
              walletAddress || dpmPositionData.user,
              networkId,
            )
          : EMPTY,
      [
        isOracless,
        dpmPositionData,
        walletAddress,
        identifiedTokensData,
        collateralToken,
        quoteToken,
      ],
    ),
  )

  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? tokenPriceUSD$([dpmPositionData.collateralToken, dpmPositionData.quoteToken, 'ETH'])
          : EMPTY,
      [dpmPositionData],
    ),
  )

  const tokensPrecision = useMemo(() => {
    return !isOracless && dpmPositionData
      ? {
          collateralDigits: getToken(dpmPositionData.collateralToken).digits,
          collateralPrecision: getToken(dpmPositionData.collateralToken).precision,
          quoteDigits: getToken(dpmPositionData.quoteToken).digits,
          quotePrecision: getToken(dpmPositionData.quoteToken).precision,
        }
      : isOracless && identifiedTokensData && collateralToken && quoteToken
      ? {
          collateralDigits: DEFAULT_TOKEN_DIGITS,
          collateralPrecision: identifiedTokensData[collateralToken].precision,
          quoteDigits: DEFAULT_TOKEN_DIGITS,
          quotePrecision: identifiedTokensData[quoteToken].precision,
        }
      : undefined
  }, [isOracless, dpmPositionData, identifiedTokensData, collateralToken, quoteToken])

  const tokensIconsData = useMemo(() => {
    return collateralToken && quoteToken && !isOracless
      ? {
          collateralToken,
          quoteToken,
        }
      : dpmPositionData && isOracless && identifiedTokensData
      ? {
          collateralToken:
            identifiedTokensData[dpmPositionData.collateralTokenAddress.toLowerCase()].source ===
            'blockchain'
              ? dpmPositionData.collateralTokenAddress
              : dpmPositionData.collateralToken,
          quoteToken:
            identifiedTokensData[dpmPositionData.quoteTokenAddress.toLowerCase()].source ===
            'blockchain'
              ? dpmPositionData.quoteTokenAddress
              : dpmPositionData.quoteToken,
        }
      : dpmPositionData
      ? {
          collateralToken: dpmPositionData.collateralToken,
          quoteToken: dpmPositionData.quoteToken,
        }
      : undefined
  }, [identifiedTokensData, collateralToken, quoteToken, isOracless, dpmPositionData])

  return {
    data: {
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      tokenPriceUSDData,
      userSettingsData,
      tokensIconsData,
    },
    errors: [
      balancesInfoArrayError,
      balancesInfoArrayError,
      dpmPositionError,
      ethBalanceError,
      gasPriceError,
      tokenPriceUSDError,
      userSettingsError,
    ],
    tokensPrecision,
  }
}
