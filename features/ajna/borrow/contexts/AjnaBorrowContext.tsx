import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { zero } from 'helpers/zero'
import React, { PropsWithChildren, useContext, useState } from 'react'

interface AjnaBorrowContextProviderProps {
  collateralToken: string
  quoteToken: string
}

interface AjnaEnvironment {
  collateralToken: string
  quoteToken: string
}
interface AjnaBorrowForm {
  depositAmount: BigNumber
  depositAmountUSD: BigNumber
  generateAmount: BigNumber
  generateAmountUSD: BigNumber
}
interface AjnaBorrowState {
  // ...
}

interface AjnaBorrowContext {
  environment: AjnaEnvironment
  form: AjnaBorrowForm
  state: AjnaBorrowState
}

export const ajnaBorrowContext = React.createContext<AjnaBorrowContext | undefined>(undefined)

export function useAjnaBorrowContext(): AjnaBorrowContext {
  const ac = useContext(ajnaBorrowContext)

  if (!ac) {
    throw new Error(
      "AjnaBorrowContext not available! useAutomationContext can't be used serverside",
    )
  }
  return ac
}

export function AjnaBorrowContextProvider({
  children,
  collateralToken,
  quoteToken,
}: PropsWithChildren<AjnaBorrowContextProviderProps>) {
  if (!isAppContextAvailable()) return null

  const [autoContext] = useState<AjnaBorrowContext>({
    environment: {
      collateralToken,
      quoteToken,
    },
    form: {
      depositAmount: zero,
      depositAmountUSD: zero,
      generateAmount: zero,
      generateAmountUSD: zero,
    },
    state: {},
  })

  return <ajnaBorrowContext.Provider value={autoContext}>{children}</ajnaBorrowContext.Provider>
}
