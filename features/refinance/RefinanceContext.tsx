import type { PropsWithChildren } from 'react'
import React, { useContext } from 'react'
import type { AddressValue, ChainInfo, IPoolId, PositionId } from 'summerfi-sdk-common'
import { getChainInfoByChainId, TokenAmount } from 'summerfi-sdk-common'

import { mapTokenToSdkToken } from './mapTokenToSdkToken'

export type RefinanceContextInput = {
  positionId: PositionId
  poolId: IPoolId
  collateralTokenSymbol: string
  debtTokenSymbol: string
  collateralAmount: string
  debtAmount: string
  chainId: number
  slippage: number
  tokenPrices: Record<string, string>
  address?: string
  liquidationPrice: string
}

export type RefinanceContext = {
  positionId: PositionId
  poolId: IPoolId
  collateralTokenAmount: TokenAmount
  debtTokenAmount: TokenAmount
  collateralPrice: string
  debtPrice: string
  chainInfo: ChainInfo
  slippage: number
  address?: AddressValue
  liquidationPrice: string
}

export const refinanceContext = React.createContext<RefinanceContext | undefined>(undefined)

export const useRefinanceContext = () => {
  const context = useContext(refinanceContext)

  if (!context) {
    throw new Error('RefinanceContextProvider is missing in the hierarchy')
  }
  return context
}

interface RefinanceContextProviderProps {
  contextInput: RefinanceContextInput
}

export function RefinanceContextProvider({
  children,
  contextInput,
}: PropsWithChildren<RefinanceContextProviderProps>) {
  const {
    chainId,
    collateralTokenSymbol,
    debtTokenSymbol,
    collateralAmount,
    debtAmount,
    address,
    tokenPrices,
    liquidationPrice,
    positionId,
    poolId,
    slippage,
  } = contextInput
  const chainInfo = getChainInfoByChainId(chainId)
  if (!chainInfo) {
    throw new Error(`ChainId ${chainId} is not supported`)
  }

  const collateralTokenAmount = TokenAmount.createFrom({
    amount: collateralAmount,
    token: mapTokenToSdkToken(chainInfo, collateralTokenSymbol),
  })
  const debtTokenAmount = TokenAmount.createFrom({
    amount: debtAmount,
    token: mapTokenToSdkToken(chainInfo, debtTokenSymbol),
  })

  const collateralPrice = tokenPrices[collateralTokenAmount.token.symbol]
  const debtPrice = tokenPrices[debtTokenAmount.token.symbol]

  // TODO: validate address
  const parsedAddress = address as AddressValue

  const ctx: RefinanceContext = React.useMemo(
    () => ({
      collateralPrice,
      debtPrice,
      address: parsedAddress,
      chainInfo,
      collateralTokenAmount,
      debtTokenAmount,
      liquidationPrice,
      positionId,
      poolId,
      slippage,
    }),
    [
      collateralPrice,
      debtPrice,
      parsedAddress,
      chainInfo,
      collateralTokenAmount,
      debtTokenAmount,
      liquidationPrice,
      positionId,
      poolId,
      slippage,
    ],
  )

  return <refinanceContext.Provider value={ctx}>{children}</refinanceContext.Provider>
}
