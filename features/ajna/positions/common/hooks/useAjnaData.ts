import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { AjnaProduct } from 'features/ajna/common/types'
import { getAjnaPositionAggregatedData$ } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { getStaticDpmPositionData$ } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { one } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

interface AjnaDataProps {
  collateralToken?: string
  id?: string
  product?: AjnaProduct
  quoteToken?: string
}

export function useAjnaData({ collateralToken, id, product, quoteToken }: AjnaDataProps) {
  const { walletAddress } = useAccount()
  const {
    context$,
    ajnaPosition$,
    balancesFromAddressInfoArray$,
    balancesInfoArray$,
    dpmPositionDataV2$,
    gasPrice$,
    identifiedTokens$,
    readPositionCreatedEvents$,
    tokenPriceUSD$,
    userSettings$,
  } = useAppContext()

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
              protocol: 'Ajna',
              quoteToken,
              quoteTokenAddress: tokensAddresses[quoteToken].address,
            })
          : isOracless && identifiedTokensData && product
          ? getStaticDpmPositionData$({
              collateralToken: identifiedTokensData[collateralToken].symbol,
              collateralTokenAddress: collateralToken,
              product,
              protocol: 'Ajna',
              quoteToken: identifiedTokensData[quoteToken].symbol,
              quoteTokenAddress: quoteToken,
            })
          : EMPTY,
      [isOracless, id, collateralToken, quoteToken, product, identifiedTokensData, tokensAddresses],
    ),
  )

  const [positionCreatedEventsData] = useObservable(
    useMemo(
      () => (dpmPositionData ? readPositionCreatedEvents$(dpmPositionData.user) : EMPTY),
      [dpmPositionData],
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

  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(
      () =>
        !isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
              dpmPositionData.collateralTokenAddress,
              dpmPositionData.quoteTokenAddress,
            )
          : isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(one, one, dpmPositionData, collateralToken, quoteToken)
          : EMPTY,
      [dpmPositionData, isOracless, tokenPriceUSDData],
    ),
  )

  const [ajnaPositionAggregatedData, ajnaPositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && ajnaPositionData
          ? getAjnaPositionAggregatedData$({ dpmPositionData, position: ajnaPositionData })
          : EMPTY,
      [dpmPositionData, ajnaPositionData],
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

  const isProxyWithManyPositions = Boolean(
    positionCreatedEventsData &&
      positionCreatedEventsData.filter(
        (item) => item.proxyAddress.toLowerCase() === dpmPositionData?.proxy.toLowerCase(),
      ).length > 1,
  )

  return {
    data: {
      ajnaPositionAggregatedData,
      ajnaPositionData,
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      tokenPriceUSDData,
      userSettingsData,
    },
    errors: [
      ajnaPositionAggregatedError,
      ajnaPositionError,
      balancesInfoArrayError,
      balancesInfoArrayError,
      dpmPositionError,
      ethBalanceError,
      gasPriceError,
      tokenPriceUSDError,
      userSettingsError,
    ],
    isOracless,
    isProxyWithManyPositions,
    tokensPrecision,
  }
}
