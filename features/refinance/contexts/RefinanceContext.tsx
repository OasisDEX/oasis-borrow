import type { RefinanceGeneralContextBase } from 'features/refinance/contexts/RefinanceGeneralContext'
import type { RefinanceInterestRatesMetadata } from 'features/refinance/helpers'
import type { SDKSimulation } from 'features/refinance/hooks/useSdkSimulation'
import type { FC } from 'react'
import React, { useContext } from 'react'

export type RefinanceContext = {
  environment: RefinanceGeneralContextBase['environment'] & {
    marketPrices: {
      ethPrice: string
    }
  }
  position: RefinanceGeneralContextBase['position'] & {
    owner: string
    netApy: string
  }
  simulation: SDKSimulation
  poolData: RefinanceGeneralContextBase['poolData']
  metadata: RefinanceGeneralContextBase['metadata'] & {
    interestRates: RefinanceInterestRatesMetadata
  }
  automations: RefinanceGeneralContextBase['automations']
  form: RefinanceGeneralContextBase['form']
  steps: RefinanceGeneralContextBase['steps']
  tx: RefinanceGeneralContextBase['tx']
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
  ctx: RefinanceContext
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
