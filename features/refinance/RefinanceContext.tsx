import type { PositionId, TokenAmount } from '@summerfi/sdk-common/dist/common'
import type { PropsWithChildren } from 'react'
import React from 'react'

export type RefinanceContext = {
  positionId: PositionId
  debtAmount: TokenAmount
  collateralAmount: TokenAmount
  slippage: number
}

export const refinanceContext = React.createContext<RefinanceContext | undefined>(undefined)

interface RefinanceContextProviderProps {
  context: RefinanceContext
}

export function RefinanceContextProvider({
  children,
  context,
}: PropsWithChildren<RefinanceContextProviderProps>) {
  const ctx = context

  return <refinanceContext.Provider value={ctx}>{children}</refinanceContext.Provider>
}
