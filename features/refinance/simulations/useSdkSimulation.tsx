import { useRefinanceContext } from 'features/refinance/RefinanceContext'
import { EmodeType, type SparkPoolId } from 'features/refinance/types'
import { useEffect, useMemo, useState } from 'react'
import type { Chain, Protocol, User } from 'summerfi-sdk-client'
import { makeSDK } from 'summerfi-sdk-client'
import type {
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
    position: { positionId, liquidationPrice, collateralTokenData, debtTokenData },
    poolData: { poolId },
  } = useRefinanceContext()

  // TODO: This should be dynamic based on the assets
  const emodeType = EmodeType.None

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
      })
      setSourcePosition(_sourcePosition)

      const sparkProtocol: Protocol | undefined = await _chain.protocols.getProtocol({
        name: ProtocolName.Spark,
      })
      if (!sparkProtocol) {
        throw new Error(`Protocol ${ProtocolName.Spark} is not supported`)
      }

      const targetPool = await sparkProtocol.getPool({
        poolId: targetPoolId,
      })

      const refinanceParameters: IRefinanceParameters = {
        position: _sourcePosition,
        targetPool,
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
  ])

  const targetPosition = simulation?.targetPosition || null

  return { error, chain, user, sourcePosition, targetPosition, liquidationPrice }
}
