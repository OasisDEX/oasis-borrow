import type { RefinanceContextBase } from 'features/refinance/contexts/RefinanceGeneralContext'
import type { FC } from 'react'
import React, { useContext } from 'react'

export const refinanceContext = React.createContext<RefinanceContextBase | undefined>(undefined)

export const useRefinanceContext = () => {
  const context = useContext(refinanceContext)

  if (!context) {
    throw new Error('RefinanceContextProvider is missing in the hierarchy')
  }
  return context
}

interface RefinanceContextProviderProps {
  ctx: RefinanceContextBase
}

export const RefinanceContextProvider: FC<RefinanceContextProviderProps> = ({ children, ctx }) => {
  return (
    <refinanceContext.Provider
      value={{
        ...ctx,
      }}
    >
      {children}
    </refinanceContext.Provider>
  )
}
