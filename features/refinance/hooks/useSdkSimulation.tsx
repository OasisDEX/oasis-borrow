import { getTokenPrice } from 'blockchain/prices'
import { tokenPriceStore } from 'blockchain/prices.constants'
import { useRefinanceGeneralContext } from 'features/refinance/contexts'
import { getPosition } from 'features/refinance/helpers/getPosition'
import { getProtocolNameByLendingProtocol } from 'features/refinance/helpers/getProtocolNameByLendingProtocol'
import { getTargetPoolId } from 'features/refinance/helpers/getTargetPoolId'
import {
  replacePoolIdETHWithWETH,
  replaceTokenAmountETHWithWETH,
} from 'features/refinance/helpers/replaceETHwithWETH'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useEffect, useMemo, useState } from 'react'
import type { Chain, ProtocolClient, User } from 'summerfi-sdk-client'
import { makeSDK, PositionUtils } from 'summerfi-sdk-client'
import type {
  IImportPositionParameters,
  ILendingPoolInfo,
  IPosition,
  IRefinanceParameters,
  ISimulation,
  Maybe,
  SimulationType,
} from 'summerfi-sdk-common'
import { Address, ExternalPositionType, Percentage, ProtocolName } from 'summerfi-sdk-common'

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

    const sourceProtocolName = getProtocolNameByLendingProtocol(lendingProtocol)
    const targetProtocolName = getProtocolNameByLendingProtocol(strategy.protocol)

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

    const fetchData = async () => {
      if (address === undefined) {
        throw new Error('Wallet is not connected')
      }
      const walletAddress = Address.createFromEthereum({
        value: address,
      })

      const _user = await sdk.users.getUser({
        chainInfo,
        walletAddress,
      })
      setUser(_user)

      const _chain: Chain | undefined = await sdk.chains.getChain({ chainInfo })
      if (!_chain) {
        throw new Error(`ChainId ${chainInfo.chainId} is not found`)
      }
      setChain(_chain)
      const sourceProtocol: Maybe<ProtocolClient> = await _chain.protocols.getProtocol({
        name: sourceProtocolName,
      })
      if (!sourceProtocol) {
        throw new Error(`Protocol ${sourceProtocolName} is not found`)
      }

      const sourcePoolId = replacePoolIdETHWithWETH(poolId)

      const targetProtocol: Maybe<ProtocolClient> = await _chain.protocols.getProtocol({
        name: targetProtocolName,
      })
      if (!targetProtocol) {
        throw new Error(`Protocol ${targetProtocolName} is not found`)
      }
      const targetPoolId = getTargetPoolId(targetProtocol, ctx)
      const [sourcePool, targetPool, targetPoolInfo] = await Promise.all([
        sourceProtocol.getLendingPool({ poolId: sourcePoolId }),
        targetProtocol.getLendingPool({ poolId: targetPoolId }),
        targetProtocol.getLendingPoolInfo({ poolId: targetPoolId }),
      ])

      const _sourcePosition = getPosition(sourceProtocolName, {
        id: positionId,
        pool: sourcePool,
        collateralAmount: replaceTokenAmountETHWithWETH(collateralTokenData),
        debtAmount: replaceTokenAmountETHWithWETH(debtTokenData),
        type: positionType,
      })
      setSourcePosition(_sourcePosition)

      const _liquidationThreshold = (
        targetPoolInfo as ILendingPoolInfo
      ).collateral.liquidationThreshold.toLTV()
      if (_liquidationThreshold == null) {
        return
      }
      setLiquidationThreshold(_liquidationThreshold)

      const refinanceParameters: IRefinanceParameters = {
        sourcePosition: _sourcePosition,
        targetPool: targetPool,
        slippage: Percentage.createFrom({ value: slippage * 100 }),
      }

      const _refinanceSimulation =
        await sdk.simulator.refinance.simulateRefinancePosition(refinanceParameters)
      setRefinanceSimulation(_refinanceSimulation)

      const isMaker = poolId.protocol.name === ProtocolName.Maker
      if (isMaker) {
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
        const _importPositionSimulation =
          await sdk.simulator.importing.simulateImportPosition(importPositionParameters)
        setImportPositionSimulation(_importPositionSimulation)
      }

      const afterLiquidationPriceInUsd = PositionUtils.getLiquidationPriceInUsd({
        liquidationThreshold: _liquidationThreshold,
        debtPriceInUsd: _debtPrice,
        position: _refinanceSimulation?.targetPosition,
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
