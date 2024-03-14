import type { IPoolId } from '@summerfi/sdk-common/dist/protocols/interfaces/IPoolId'
import type { PropsWithChildren } from 'react'
import React from 'react'

export interface IPosition {
  poolId: IPoolId
  data: any
  // TODO: placeholder for missing sdk interface fields
}

export type RefinanceContext = {
  position: IPosition
}

export const refinanceContext = React.createContext<RefinanceContext | undefined>(undefined)

interface RefinanceContextProviderProps {
  position: IPosition
}

export function RefinanceContextProvider({
  children,
  position,
}: PropsWithChildren<RefinanceContextProviderProps>) {
  const data = {
    position,
  }

  return <refinanceContext.Provider value={data}>{children}</refinanceContext.Provider>
}
