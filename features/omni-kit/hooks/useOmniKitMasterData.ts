import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { GasPriceParams, Tickers } from 'blockchain/prices.types'
import { getToken } from 'blockchain/tokensMetadata'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { isAddress } from 'ethers/lib/utils'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getStaticDpmPositionData$ } from 'features/ajna/positions/common/observables/getDpmPositionData'
import type { OmniKitProductPageProps } from 'features/omni-kit/types'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

type OmniKitMasterDataProps = OmniKitProductPageProps

export interface OmniKitMasterDataResponse {
  data: {
    balancesInfoArrayData?: BigNumber[]
    dpmPositionData?: DpmPositionData
    ethBalanceData?: BigNumber[]
    gasPriceData?: GasPriceParams
    tokenPriceUSDData?: Tickers
    tokensIconsData?: {
      collateralTokenIcon: string
      quoteTokenIcon: string
    }
    tokensPrecisionData?: {
      collateralDigits: number
      collateralPrecision: number
      quoteDigits: number
      quotePrecision: number
    }
    userSettingsData?: UserSettingsState
  }
  errors: any[]
  isOracless: boolean
}

export function useOmniKitMasterData({
  collateralToken,
  positionId,
  productType,
  protocol,
  quoteToken,
}: OmniKitMasterDataProps): OmniKitMasterDataResponse {
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

  const [context] = useObservable(context$)
  const [userSettingsData, userSettingsError] = useObservable(userSettings$)
  const [gasPriceData, gasPriceError] = useObservable(gasPrice$)

  const isOracless = isAddress(collateralToken) || isAddress(quoteToken)

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
        positionId
          ? dpmPositionDataV2$(getPositionIdentity(positionId), collateralToken, quoteToken, productType)
          : !isOracless && productType && collateralToken && quoteToken
          ? getStaticDpmPositionData$({
              collateralToken,
              collateralTokenAddress: tokensAddresses[collateralToken].address,
              product: productType,
              protocol,
              quoteToken,
              quoteTokenAddress: tokensAddresses[quoteToken].address,
            })
          : isOracless && identifiedTokensData && productType
          ? getStaticDpmPositionData$({
              collateralToken: identifiedTokensData[collateralToken].symbol,
              collateralTokenAddress: collateralToken,
              product: productType,
              protocol,
              quoteToken: identifiedTokensData[quoteToken].symbol,
              quoteTokenAddress: quoteToken,
            })
          : EMPTY,
      [collateralToken, identifiedTokensData, isOracless, positionId, productType, quoteToken, tokensAddresses],
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
        collateralToken,
        dpmPositionData,
        identifiedTokensData,
        isOracless,
        quoteToken,
        walletAddress,
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

  const tokensPrecisionData = useMemo(() => {
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
  }, [collateralToken, dpmPositionData, identifiedTokensData, isOracless, quoteToken])

  const tokensIconsData = useMemo(() => {
    return collateralToken && quoteToken && !isOracless
      ? {
          collateralTokenIcon: collateralToken,
          quoteTokenIcon: quoteToken,
        }
      : dpmPositionData && isOracless && identifiedTokensData
      ? {
          collateralTokenIcon:
            identifiedTokensData[dpmPositionData.collateralTokenAddress.toLowerCase()].source ===
            'blockchain'
              ? dpmPositionData.collateralTokenAddress
              : dpmPositionData.collateralToken,
          quoteTokenIcon:
            identifiedTokensData[dpmPositionData.quoteTokenAddress.toLowerCase()].source ===
            'blockchain'
              ? dpmPositionData.quoteTokenAddress
              : dpmPositionData.quoteToken,
        }
      : dpmPositionData
      ? {
          collateralTokenIcon: dpmPositionData.collateralToken,
          quoteTokenIcon: dpmPositionData.quoteToken,
        }
      : undefined
  }, [collateralToken, dpmPositionData, identifiedTokensData, isOracless, quoteToken])

  return {
    data: {
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      tokenPriceUSDData,
      tokensIconsData,
      tokensPrecisionData,
      userSettingsData,
    },
    errors: [
      balancesInfoArrayError,
      dpmPositionError,
      ethBalanceError,
      gasPriceError,
      tokenPriceUSDError,
      userSettingsError,
    ],
    isOracless,
  }
}
