import { getNetworkContracts } from 'blockchain/contracts'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import { getToken } from 'blockchain/tokensMetadata'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import { getStaticDpmPositionData$ } from 'features/omni-kit/observables'
import type {
  OmniProductType,
  OmniProtocolSettings,
  OmniSupportedNetworkIds,
} from 'features/omni-kit/types'
import { getTokenBalances$ } from 'features/shared/balanceInfo'
import { getTriggersRequest } from 'helpers/lambda/triggers'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { LendingProtocol } from 'lendingProtocols'
import { makeObservable } from 'lendingProtocols/pipelines'
import { useMemo } from 'react'
import { EMPTY, of } from 'rxjs'

interface OmniProtocolDataProps {
  collateralToken: string
  extraTokens?: string[]
  isOpening: boolean
  isOracless?: boolean
  networkId: OmniSupportedNetworkIds
  pairId: number
  positionId?: string
  productType: OmniProductType
  protocol: LendingProtocol
  protocolRaw: string
  quoteToken: string
  settings: OmniProtocolSettings
}

export function useOmniProtocolData({
  collateralToken,
  extraTokens = [],
  isOpening,
  isOracless,
  networkId,
  pairId,
  positionId,
  productType,
  protocol,
  protocolRaw,
  quoteToken,
  settings,
}: OmniProtocolDataProps) {
  const { walletAddress } = useAccount()
  const { gasPriceOnNetwork$ } = useMainContext()
  const { userSettings$ } = useAccountContext()
  const { balancesFromAddressInfoArray$, dpmPositionDataV2$, tokenPriceUSD$, onEveryBlock$ } =
    useProductContext()
  const getTriggersRequest$ = makeObservable(onEveryBlock$, getTriggersRequest)

  const [userSettingsData, userSettingsError] = useObservable(userSettings$)
  const [gasPriceData, gasPriceError] = useObservable(gasPriceOnNetwork$(networkId))

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
              Number(positionId),
              networkId,
              collateralToken,
              quoteToken,
              productType,
              protocol,
              protocolRaw,
              pairId,
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
        collateralToken,
        identifiedTokensData,
        isOracless,
        networkId,
        positionId,
        productType,
        protocol,
        protocolRaw,
        quoteToken,
        tokensAddresses,
      ],
    ),
  )

  const [ethBalanceData, ethBalanceError] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? getTokenBalances$(['ETH'], walletAddress || dpmPositionData.user, networkId)
          : EMPTY,
      [dpmPositionData, walletAddress],
    ),
  )

  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        !isOracless && dpmPositionData
          ? getTokenBalances$(
              [dpmPositionData.collateralToken, dpmPositionData.quoteToken, ...extraTokens],
              walletAddress || dpmPositionData.user,
              networkId,
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
        extraTokens,
        walletAddress,
        networkId,
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
          ? tokenPriceUSD$([
              dpmPositionData.collateralToken,
              dpmPositionData.quoteToken,
              'ETH',
              ...extraTokens,
            ])
          : EMPTY,
      [dpmPositionData, extraTokens],
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

  const [positionTriggersData, positionTriggersError] = useObservable(
    useMemo(
      () =>
        !isOpening && settings.availableAutomations[networkId]?.length
          ? dpmPositionData
            ? getTriggersRequest$({ dpm: dpmPositionData, networkId })
            : EMPTY
          : of(omniPositionTriggersDataDefault),
      [dpmPositionData, networkId, settings.availableAutomations],
    ),
  )

  return {
    data: {
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      positionTriggersData,
      tokenPriceUSDData,
      tokensIconsData,
      userSettingsData,
    },
    errors: [
      balancesInfoArrayError,
      dpmPositionError,
      ethBalanceError,
      gasPriceError,
      positionTriggersError,
      tokenPriceUSDError,
      userSettingsError,
    ],
    tokensPrecision,
  }
}
