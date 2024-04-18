import { useRefinanceContext } from 'features/refinance/contexts'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { replaceETHWithWETH } from 'features/refinance/helpers/replaceETHwithWETH'
import { mapTokenToSdkToken } from 'features/refinance/mapTokenToSdkToken'
import { type SparkPoolId } from 'features/refinance/types'
import { useEffect, useMemo, useState } from 'react'
import type { Chain, Protocol, User } from 'summerfi-sdk-client'
import { makeSDK } from 'summerfi-sdk-client'
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

export function useSdkSimulation() {
  const [error, setError] = useState<null | string>(null)
  const [user, setUser] = useState<null | User>(null)
  const [chain, setChain] = useState<null | Chain>(null)
  const [sourcePosition, setSourcePosition] = useState<null | IPosition>(null)
  const [refinanceSimulation, setRefinanceSimulation] =
    useState<null | ISimulation<SimulationType.Refinance>>(null)
  const [importPositionSimulation, setImportPositionSimulation] =
    useState<null | ISimulation<SimulationType.ImportPosition>>(null)

  const {
    environment: { slippage, chainInfo, collateralPrice, debtPrice, address },
    position: { positionId, liquidationPrice, collateralTokenData, debtTokenData, positionType },
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
              value: '0x6c7ed10997873b59c2b2d9449d9106fe1dd85784',
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
    positionId,
    JSON.stringify(collateralTokenData),
    JSON.stringify(debtTokenData),
    positionType,
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
  }
}
