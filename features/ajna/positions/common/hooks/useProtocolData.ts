import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { getStaticDpmPositionData$ } from 'features/ajna/positions/common/observables/getDpmPositionData'
import type { ProtocolProduct } from 'features/unifiedProtocol/types'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

interface AjnaDataProps {
  collateralToken?: string
  id?: string
  product?: ProtocolProduct
  quoteToken?: string
  protocol: LendingProtocol
}

export function useProtocolData({ collateralToken, id, product, quoteToken, protocol }: AjnaDataProps) {
  const { walletAddress } = useAccount()
  const { context$, gasPrice$ } = useMainContext()
  const { userSettings$ } = useAccountContext()
  const {
    balancesFromAddressInfoArray$,
    balancesInfoArray$,
    dpmPositionDataV2$,
    identifiedTokens$,
    tokenPriceUSD$,
  } = useProductContext()

  const isOracless =
    collateralToken && quoteToken && isPoolOracless({ collateralToken, quoteToken })

  const [context] = useObservable(context$)
  const [userSettingsData, userSettingsError] = useObservable(userSettings$)
  const [gasPriceData, gasPriceError] = useObservable(gasPrice$)

  const tokensAddresses = useMemo(
    () => getNetworkContracts(NetworkIds.MAINNET, context?.chainId).tokens,
    [context?.chainId],
  )

  const [identifiedTokensData] = useObservable(
    useMemo(
      () => (isOracless ? identifiedTokens$([collateralToken, quoteToken]) : EMPTY),
      [isOracless, collateralToken, quoteToken],
    ),
  )

  const [dpmPositionData, dpmPositionError] = useObservable(
    useMemo(
      () =>
        id
          ? dpmPositionDataV2$(getPositionIdentity(id), collateralToken, quoteToken, product)
          : !isOracless && product && collateralToken && quoteToken
          ? getStaticDpmPositionData$({
              collateralToken,
              collateralTokenAddress: tokensAddresses[collateralToken].address,
              product,
              protocol,
              quoteToken,
              quoteTokenAddress: tokensAddresses[quoteToken].address,
            })
          : isOracless && identifiedTokensData && product
          ? getStaticDpmPositionData$({
              collateralToken: identifiedTokensData[collateralToken].symbol,
              collateralTokenAddress: collateralToken,
              product,
              protocol,
              quoteToken: identifiedTokensData[quoteToken].symbol,
              quoteTokenAddress: quoteToken,
            })
          : EMPTY,
      [isOracless, id, collateralToken, quoteToken, product, identifiedTokensData, tokensAddresses],
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
          : isOracless && dpmPositionData && identifiedTokensData
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
      : isOracless && identifiedTokensData
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
