import { useRefinanceContext } from 'features/refinance/contexts'
import { omniProductTypeToSDKType } from 'features/refinance/helpers/omniProductTypeToSDKType'
import { EmodeType, type SparkPoolId } from 'features/refinance/types'
import { useEffect, useMemo, useState } from 'react'
import type { Chain, Protocol, User } from 'summerfi-sdk-client'
import { makeSDK } from 'summerfi-sdk-client'
import type {
  ILendingPool,
  IPosition,
  IRefinanceParameters,
  ISimulation,
  SimulationType,
} from 'summerfi-sdk-common'
import {
  Address,
  AddressType,
  Percentage,
  Position,
  ProtocolName,
  Token,
  TokenAmount,
  Wallet,
} from 'summerfi-sdk-common'

export function useSdkSimulation() {
  const [error, setError] = useState<null | string>(null)
  const [user, setUser] = useState<null | User>(null)
  const [chain, setChain] = useState<null | Chain>(null)
  const [sourcePosition, setSourcePosition] = useState<null | IPosition>(null)
  const [simulation, setSimulation] = useState<null | ISimulation<SimulationType.Refinance>>(null)

  const {
    environment: { slippage, chainInfo, collateralPrice, debtPrice, address },
    position: { positionId, liquidationPrice, collateralTokenData, debtTokenData, type },
    poolData: { poolId },
    form: {
      state: { strategy, refinanceOption },
    },
  } = useRefinanceContext()

  // TODO: This should be dynamic based on the strategy, add helper
  const emodeType = EmodeType.None

  if (!type) {
    throw new Error('Unsupported position type: ' + type)
  }
  if (!strategy) {
    throw new Error('Strategy is not defined')
  }

  const sdk = useMemo(() => makeSDK({ apiURL: '/api/sdk' }), [])

  useEffect(() => {
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

      const sourcePool = await makerProtocol.getPool({ poolId })

      const _sourcePosition = Position.createFrom({
        positionId,
        pool: sourcePool,
        collateralAmount: collateralTokenData,
        debtAmount: debtTokenData,
        type,
      })
      setSourcePosition(_sourcePosition)

      const sparkProtocol: Protocol | undefined = await _chain.protocols.getProtocol({
        name: ProtocolName.Spark,
      })
      if (!sparkProtocol) {
        throw new Error(`Protocol ${ProtocolName.Spark} is not supported`)
      }

      const targetPool: ILendingPool = await sparkProtocol.getPool({
        poolId: targetPoolId,
      })

      const targetPositionType = omniProductTypeToSDKType(strategy.product.map)
      if (!targetPositionType) {
        throw new Error(`Unsupported strategy product: ${strategy?.product}`)
      }
      const _targetPosition = Position.createFrom({
        positionId: { id: 'newEmptyPositionFromPool' },
        pool: targetPool,
        collateralAmount: TokenAmount.createFrom({
          amount: '0',
          token: Token.createFrom({ symbol: strategy?.primaryToken }),
        }),
        debtAmount: TokenAmount.createFrom({
          amount: '0',
          token: Token.createFrom({ symbol: strategy?.secondaryToken }),
        }),
        type: targetPositionType,
      })

      const refinanceParameters: IRefinanceParameters = {
        sourcePosition: _sourcePosition,
        targetPosition: _targetPosition,
        slippage: Percentage.createFrom({ value: slippage }),
      }

      const _simulation =
        await sdk.simulator.refinance.simulateRefinancePosition(refinanceParameters)
      setSimulation(_simulation)
    }
    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [
    sdk,
    emodeType,
    slippage,
    collateralPrice,
    debtPrice,
    address,
    chainInfo,
    poolId,
    positionId,
    collateralTokenData,
    debtTokenData,
    type,
    strategy?.product,
    strategy?.primaryToken,
    strategy?.secondaryToken,
  ])

  const simulatedPosition = simulation?.targetPosition || null

  return { error, chain, user, sourcePosition, simulatedPosition, liquidationPrice }
}
