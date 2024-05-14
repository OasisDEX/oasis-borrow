import { getTokenPrice } from 'blockchain/prices'
import { tokenPriceStore } from 'blockchain/prices.constants'
import { useRefinanceGeneralContext } from 'features/refinance/contexts'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { getSparkPoolId } from 'features/refinance/helpers/getPoolId'
import { getPosition } from 'features/refinance/helpers/getPosition'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import { replaceETHWithWETH } from 'features/refinance/helpers/replaceETHwithWETH'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useEffect, useMemo, useState } from 'react'
import type { Chain, ProtocolClient, User } from 'summerfi-sdk-client'
import { makeSDK, PositionUtils } from 'summerfi-sdk-client'
import type {
  IImportPositionParameters,
  IPosition,
  IRefinanceParameters,
  ISimulation,
  Maybe,
  SimulationType,
} from 'summerfi-sdk-common'
import {
  Address,
  AddressType,
  ExternalPositionType,
  Percentage,
  ProtocolName,
  TokenAmount,
  Wallet,
} from 'summerfi-sdk-common'

export type SDKSimulation = {
  error: string | null
  chain: Chain | null
  user: User | null
  sourcePosition: IPosition | null
  importPositionSimulation: ISimulation<SimulationType.ImportPosition> | null
  refinanceSimulation: ISimulation<SimulationType.Refinance> | null
  liquidationPrice: string
  liquidationThreshold: Percentage | null
  debtPrice: string | null
  collateralPrice: string | null
  isLoading: boolean
}

export function useSdkSimulation(): SDKSimulation {
  const [error, setError] = useState<null | string>(null)
  const [user, setUser] = useState<null | User>(null)
  const [chain, setChain] = useState<null | Chain>(null)
  const [sourcePosition, setSourcePosition] = useState<null | IPosition>(null)
  const [refinanceSimulation, setRefinanceSimulation] =
    useState<null | ISimulation<SimulationType.Refinance>>(null)
  const [importPositionSimulation, setImportPositionSimulation] =
    useState<null | ISimulation<SimulationType.ImportPosition>>(null)
  const [liquidationPrice, setLiquidationPrice] = useState<string>('')
  const [liquidationThreshold, setLiquidationThreshold] = useState<Percentage | null>(null)
  const [debtPrice, setDebtPrice] = useState<string | null>(null)
  const [collateralPrice, setCollateralPrice] = useState<string | null>(null)

  const { ctx, cache } = useRefinanceGeneralContext()

  const sdk = useMemo(() => makeSDK({ apiURL: '/api/sdk' }), [])

  // Reset state when user go back to strategy or option step
  useEffect(() => {
    if (
      ctx &&
      [RefinanceSidebarStep.Option, RefinanceSidebarStep.Strategy].includes(ctx.steps.currentStep)
    ) {
      setError(null)
      setRefinanceSimulation(null)
      setLiquidationPrice('')
      setLiquidationThreshold(null)
    }
  }, [ctx?.steps.currentStep])

  useEffect(() => {
    if (!ctx || !cache.positionOwner) {
      return
    }
    const {
      environment: { slippage, chainInfo, address },
      position: { positionId, collateralTokenData, debtTokenData, positionType, lendingProtocol },
      poolData: { poolId },
      form: {
        state: { strategy },
      },
    } = ctx

    const owner = cache.positionOwner

    if (!strategy) {
      return
    }

    if (!positionType) {
      throw new Error('Unsupported position type.')
    }

    const sourceProtocolName = lendingProtocol
    const targetProtocolName = strategy.protocol

    const _debtPrice = getTokenPrice(
      debtTokenData.token.symbol,
      tokenPriceStore.prices,
      'debt price - useSdkSimulation',
    ).toString()
    setDebtPrice(_debtPrice)
    const _collateralPrice = getTokenPrice(
      collateralTokenData.token.symbol,
      tokenPriceStore.prices,
      'collateral price - refinance modal controller',
    ).toString()
    setCollateralPrice(_collateralPrice)

    const emodeType = getEmode(collateralTokenData, debtTokenData)
    // TODO ref: this sould be resolved with helper based on the protocol and position
    const sourcePoolId = {
      ...poolId,
      collateralTokenData: replaceETHWithWETH(collateralTokenData),
      debtTokenData: replaceETHWithWETH(debtTokenData),
    }
    const targetPoolId = getSparkPoolId(
      chainInfo,
      emodeType,
      replaceETHWithWETH(collateralTokenData).token,
      replaceETHWithWETH(debtTokenData).token,
    )

    const fetchData = async () => {
      if (address === undefined) {
        throw new Error('Wallet is not connected')
      }
      const wallet = Wallet.createFrom({
        address: Address.createFrom({ value: address, type: AddressType.Ethereum }),
      })

      const _chain: Chain | undefined = await sdk.chains.getChain({ chainInfo })
      if (!_chain) {
        throw new Error(`ChainId ${chainInfo.chainId} is not found`)
      }
      setChain(_chain)

      const _user = await sdk.users.getUser({
        chainInfo,
        walletAddress: wallet.address,
      })
      setUser(_user)

      const makerProtocol: Maybe<ProtocolClient> = await _chain.protocols.getProtocol({
        name: sourceProtocolName,
      })
      if (!makerProtocol) {
        throw new Error(`Protocol ${ProtocolName.Maker} is not found`)
      }
      const sparkProtocol: Maybe<ProtocolClient> = await _chain.protocols.getProtocol({
        name: targetProtocolName,
      })
      if (!sparkProtocol) {
        throw new Error(`Protocol ${ProtocolName.Spark} is not supported`)
      }

      const [sourcePool, targetPool] = await Promise.all([
        makerProtocol.getLendingPool({ poolId: sourcePoolId }),
        sparkProtocol.getLendingPool({ poolId: targetPoolId }),
      ])

      const _sourcePosition = getPosition(sourceProtocolName, {
        id: positionId,
        pool: sourcePool,
        collateralAmount: replaceETHWithWETH(collateralTokenData),
        debtAmount: replaceETHWithWETH(debtTokenData),
        type: positionType,
      })
      const _targetPosition = getPosition(targetProtocolName, {
        id: { id: 'newEmptyPositionFromPool' },
        pool: targetPool,
        collateralAmount: replaceETHWithWETH(
          TokenAmount.createFrom({
            amount: '0',
            token: mapTokenToSdkToken(chainInfo, strategy.primaryToken),
          }),
        ),
        debtAmount: replaceETHWithWETH(
          TokenAmount.createFrom({
            amount: '0',
            token: mapTokenToSdkToken(chainInfo, strategy.secondaryToken),
          }),
        ),
        type: positionType,
      })

      setSourcePosition(_sourcePosition)

      const importPositionParameters: IImportPositionParameters = {
        externalPosition: {
          position: _sourcePosition,
          externalId: {
            address: Address.createFromEthereum({
              value: owner as `0x${string}`,
            }),
            type: ExternalPositionType.DS_PROXY,
          },
        },
      }
      const refinanceParameters: IRefinanceParameters = {
        sourcePosition: _sourcePosition,
        targetPosition: _targetPosition,
        slippage: Percentage.createFrom({ value: slippage * 100 }),
      }

      const [_importPositionSimulation, _refinanceSimulation] = await Promise.all([
        sdk.simulator.importing.simulateImportPosition(importPositionParameters),
        sdk.simulator.refinance.simulateRefinancePosition(refinanceParameters),
      ])
      setImportPositionSimulation(_importPositionSimulation)
      setRefinanceSimulation(_refinanceSimulation)

      // TECH DEBT: This is a temporary fix to get the liquidation threshold from SDK as there is no other way currently
      const _simulatedPosition = _refinanceSimulation?.targetPosition
      if (_simulatedPosition == null) {
        return
      }
      let _liquidationThreshold: Percentage | null = null
      try {
        _liquidationThreshold = _simulatedPosition.pool.collaterals.get({
          token: _simulatedPosition.collateralAmount.token,
        })?.maxLtv?.ratio
      } catch (e) {
        console.error('Error getting liquidation threshold', e)
      }
      if (_liquidationThreshold == null) {
        return
      }
      // TECH DEBT END
      setLiquidationThreshold(_liquidationThreshold)

      const afterLiquidationPriceInUsd = PositionUtils.getLiquidationPriceInUsd({
        liquidationThreshold: _liquidationThreshold,
        debtPriceInUsd: _debtPrice,
        position: _simulatedPosition,
      })
      setLiquidationPrice(afterLiquidationPriceInUsd)
    }
    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [
    sdk,
    ctx?.environment.slippage,
    ctx?.environment.address,
    JSON.stringify(ctx?.environment.chainInfo),
    ctx?.position.positionId.id,
    JSON.stringify(ctx?.position.collateralTokenData),
    JSON.stringify(ctx?.position.debtTokenData),
    ctx?.position.positionType,
    JSON.stringify(ctx?.poolData.poolId),
    ctx?.form.state.strategy?.product?.toString(),
    ctx?.form.state.strategy?.primaryToken,
    ctx?.form.state.strategy?.secondaryToken,
    cache.positionOwner,
  ])

  const isLoading =
    (ctx?.steps.currentStep === RefinanceSidebarStep.Give && !importPositionSimulation) ||
    (ctx?.steps.currentStep === RefinanceSidebarStep.Changes && !refinanceSimulation)

  return {
    error,
    chain,
    user,
    sourcePosition,
    importPositionSimulation,
    refinanceSimulation,
    liquidationPrice,
    liquidationThreshold,
    debtPrice,
    collateralPrice,
    isLoading,
  }
}
