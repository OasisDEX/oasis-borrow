import { useRefinanceContext } from 'features/refinance/contexts'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { replaceETHWithWETH } from 'features/refinance/helpers/replaceETHwithWETH'
import { mapTokenToSdkToken } from 'features/refinance/mapTokenToSdkToken'
import { type SparkPoolId } from 'features/refinance/types'
import { useEffect, useMemo, useState } from 'react'
import type { Chain, Protocol, User } from 'summerfi-sdk-client'
import { makeSDK, PositionUtils } from 'summerfi-sdk-client'
import type {
  IImportPositionParameters,
  IPosition,
  IRefinanceParameters,
  ISimulation,
  SimulationType,
} from 'summerfi-sdk-common'
import {
  Address,
  AddressType,
  ExternalPositionType,
  Percentage,
  Position,
  ProtocolName,
  TokenAmount,
  Wallet,
} from 'summerfi-sdk-common'

export type SDKSimulation = {
  error: string | null
  chain: Chain | null
  user: User | null
  sourcePosition: IPosition | null
  simulatedPosition: IPosition | null
  importPositionSimulation: ISimulation<SimulationType.ImportPosition> | null
  refinanceSimulation: ISimulation<SimulationType.Refinance> | null
  liquidationPrice: string
  liquidationThreshold: Percentage | null
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

  const {
    environment: { slippage, chainInfo, collateralPrice, debtPrice, address },
    position: { positionId, collateralTokenData, debtTokenData, positionType, owner },
    poolData: { poolId },
    form: {
      state: { strategy },
    },
  } = useRefinanceContext()
  const sdk = useMemo(() => makeSDK({ apiURL: '/api/sdk' }), [])

  useEffect(() => {
    if (!strategy) {
      return
    }
    if (!positionType) {
      throw new Error('Unsupported position type.')
    }
    const emodeType = getEmode(collateralTokenData, debtTokenData)
    const fetchData = async () => {
      const targetPoolId: SparkPoolId = {
        protocol: {
          name: ProtocolName.Spark,
          chainInfo,
        },
        emodeType,
      }

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

      const makerProtocol: Protocol | undefined = await _chain.protocols.getProtocol({
        name: ProtocolName.Maker,
      })
      if (!makerProtocol) {
        throw new Error(`Protocol ${ProtocolName.Maker} is not found`)
      }
      const sparkProtocol: Protocol | undefined = await _chain.protocols.getProtocol({
        name: ProtocolName.Spark,
      })
      if (!sparkProtocol) {
        throw new Error(`Protocol ${ProtocolName.Spark} is not supported`)
      }

      const [sourcePool, targetPool] = await Promise.all([
        makerProtocol.getPool({ poolId }),
        sparkProtocol.getPool({ poolId: targetPoolId }),
      ])

      const _sourcePosition = Position.createFrom({
        positionId,
        pool: sourcePool,
        collateralAmount: replaceETHWithWETH(collateralTokenData),
        debtAmount: replaceETHWithWETH(debtTokenData),
        type: positionType,
      })
      setSourcePosition(_sourcePosition)

      const _targetPosition = Position.createFrom({
        positionId: { id: 'newEmptyPositionFromPool' },
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
        slippage: Percentage.createFrom({ value: slippage }),
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
        _liquidationThreshold = (_simulatedPosition.pool as any).collaterals.get({
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
        debtPriceInUsd: debtPrice,
        position: _simulatedPosition,
      })
      setLiquidationPrice(afterLiquidationPriceInUsd)
    }
    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [
    sdk,
    slippage,
    collateralPrice,
    debtPrice,
    address,
    chainInfo,
    poolId,
    positionId.id,
    JSON.stringify(collateralTokenData),
    JSON.stringify(debtTokenData),
    positionType,
    owner,
    strategy?.product,
    strategy?.primaryToken,
    strategy?.secondaryToken,
  ])

  const simulatedPosition = refinanceSimulation?.targetPosition || null

  return {
    error,
    chain,
    user,
    sourcePosition,
    simulatedPosition,
    importPositionSimulation,
    refinanceSimulation,
    liquidationPrice,
    liquidationThreshold,
  }
}
