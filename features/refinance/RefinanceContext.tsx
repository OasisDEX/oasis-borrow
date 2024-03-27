import type { PropsWithChildren } from 'react'
import React from 'react'
import type { AddressValue, ChainInfo, PositionId } from 'summerfi-sdk-common'
import { getChainInfoByChainId, TokenAmount } from 'summerfi-sdk-common'

import { mapTokenToSdkToken } from './mapTokenToSdkToken'

export type RefinanceContextInput = {
  positionId: PositionId
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
      slippage,
    ],
  )

  return <refinanceContext.Provider value={ctx}>{children}</refinanceContext.Provider>
}
