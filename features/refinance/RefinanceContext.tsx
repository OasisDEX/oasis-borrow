import type { ChainInfo, PositionId } from '@summerfi/sdk-common/dist/common'
import { Percentage, TokenAmount } from '@summerfi/sdk-common/dist/common'
import { getChainInfoByChainId } from '@summerfi/sdk-common/dist/common/implementation/ChainFamilies'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { mapTokenToSdkToken } from './mapTokenToSdkToken'

export type RefinanceContextInput = {
  positionId: PositionId
  collateralTokenSymbol: string
  debtTokenSymbol: string
  collateralAmount: string
  debtAmount: string
  collateralPrice: string
  debtPrice: string
  chainId: number
  slippage: number
  tokenPrices: Record<string, string>
  address?: string
  liquidationThreshold: number
}

export type RefinanceContext = {
  positionId: PositionId
  collateralTokenAmount: TokenAmount
  debtTokenAmount: TokenAmount
  collateralPrice: string
  debtPrice: string
  chainInfo: ChainInfo
  slippage: number
  tokenPrices: Record<string, string>
  address?: string
  liquidationThreshold: Percentage
}

export const refinanceContext = React.createContext<RefinanceContext | undefined>(undefined)

interface RefinanceContextProviderProps {
  contextInput: RefinanceContextInput
}

export function RefinanceContextProvider({
  children,
  contextInput,
}: PropsWithChildren<RefinanceContextProviderProps>) {
  const { chainId, collateralTokenSymbol, debtTokenSymbol, collateralAmount, debtAmount, ...rest } =
    contextInput
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

  const liquidationThreshold = Percentage.createFrom({
    percentage: rest.liquidationThreshold * 100,
  })

  const ctx: RefinanceContext = React.useMemo(
    () => ({
      ...rest,
      chainInfo,
      collateralTokenAmount,
      debtTokenAmount,
      liquidationThreshold,
    }),
    [collateralTokenAmount, debtTokenAmount, chainInfo, liquidationThreshold, rest],
  )

  return <refinanceContext.Provider value={ctx}>{children}</refinanceContext.Provider>
}
