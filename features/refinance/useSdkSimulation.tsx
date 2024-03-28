import { refinanceContext } from 'features/refinance/RefinanceContext'
import React, { useEffect, useState } from 'react'
import type { Chain, Protocol, User } from 'summerfi-sdk-client'
import { makeSDK, PositionUtils } from 'summerfi-sdk-client'
import type {
  IPoolId,
  IRefinanceParameters,
  Position,
  Simulation,
  SimulationType,
} from 'summerfi-sdk-common'
import {
  Address,
  AddressType,
  CurrencySymbol,
  getChainInfoByChainId,
  Percentage,
  Price,
  ProtocolName,
  RiskRatio,
  RiskRatioType,
  Wallet,
} from 'summerfi-sdk-common'

export function useSdkSimulation() {
  const [error, setError] = useState<null | string>(null)
  const [user, setUser] = useState<null | User>(null)
  const [chain, setChain] = useState<null | Chain>(null)
  const [liquidationPrice, setLiquidationPrice] = useState<null | string>(null)
  const [sourcePosition, setSourcePosition] = useState<null | Position>(null)
  const [simulation, setSimulation] = useState<null | Simulation<SimulationType.Refinance>>(null)

  const context = React.useContext(refinanceContext)

  const sdk = makeSDK({ apiURL: '/api/sdk' })

  useEffect(() => {
    const fetchData = async () => {
      if (context === undefined) {
        throw new Error('RefinanceContextProvider is missing in the hierarchy')
      }
      const {
        positionId,
        slippage,
        chainInfo,
        liquidationPrice: _liquidationPrice,
        collateralTokenAmount,
        debtTokenAmount,
        collateralPrice,
        debtPrice,
        address,
      } = context

      setLiquidationPrice(_liquidationPrice)

      if (address === undefined) {
        throw new Error('Wallet is not connected')
      }
      const wallet = Wallet.createFrom({
        address: Address.createFrom({ value: address, type: AddressType.Ethereum }),
      })
      const fetchedChain = await sdk.chains.getChain({
        chainInfo: getChainInfoByChainId(chainInfo.chainId),
      })
      setChain(fetchedChain)

      const fetchedUser = await sdk.users.getUser({
        chainInfo: fetchedChain,
        walletAddress: wallet.address,
      })
      setUser(fetchedUser)

      const _chain: Chain | undefined = await sdk.chains.getChain({ chainInfo })
      if (!_chain) {
        throw new Error(`ChainId ${chainInfo.chainId} is not supported`)
      }
      const makerProtocol: Protocol | undefined = await _chain.protocols.getProtocol({
        name: ProtocolName.Maker,
      })
      if (!makerProtocol) {
        throw new Error(`Protocol ${ProtocolName.Maker} is not supported`)
      }
      const sourcePool = await makerProtocol.getPool({
        poolId: {
          protocol: {
            name: ProtocolName.Maker,
            chainInfo,
          },
        } as IPoolId,
      })

      const ltv = PositionUtils.getLTV({
        collateralTokenAmount,
        debtTokenAmount,
        collateralPriceInUsd: Price.createFrom({
          value: collateralPrice,
          baseToken: collateralTokenAmount.token,
          quoteToken: CurrencySymbol.USD,
        }),
        debtPriceInUsd: Price.createFrom({
          value: debtPrice,
          baseToken: debtTokenAmount.token,
          quoteToken: CurrencySymbol.USD,
        }),
      })
      const _sourcePosition: Position = {
        pool: sourcePool,
        collateralAmount: collateralTokenAmount,
        debtAmount: debtTokenAmount,
        positionId,
        riskRatio: RiskRatio.createFrom({ ratio: ltv, type: RiskRatioType.LTV }),
      }
      setSourcePosition(_sourcePosition)

      const sparkProtocol: Protocol | undefined = await _chain.protocols.getProtocol({
        name: ProtocolName.Spark,
      })
      if (!sparkProtocol) {
        throw new Error(`Protocol ${ProtocolName.Spark} is not supported`)
      }
      const targetPool = await sparkProtocol.getPool({
        poolId: {
          protocol: {
            name: ProtocolName.Spark,
            chainInfo,
          },
        } as IPoolId,
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
  }, [sdk, context])

  return { error, user, chain, sourcePosition, simulation, liquidationPrice }
}
