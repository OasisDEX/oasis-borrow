import BigNumber from 'bignumber.js'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'

interface AjnaProductContextProviderProps {
  collateralToken: string
  collateralTokenMarketPrice: BigNumber
  quoteToken: string
  quoteTokenMarketPrice: BigNumber
}

// external data, could be extended later by some stuff that comes from calculationsm, not directly from outside
type AjnaEnvironment = AjnaProductContextProviderProps

interface AjnaProductPosition {
  // ...
}

interface AjnaProductContext {
  environment: AjnaEnvironment
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaProductPosition
}

const ajnaProductContext = React.createContext<AjnaProductContext | undefined>(undefined)

export function useAjnaProductContext(): AjnaProductContext {
  const ac = useContext(ajnaProductContext)

  if (!ac) {
    throw new Error(
      "AjnaProductContext not available! useAjnaProductContext can't be used serverside",
    )
  }
  return ac
}

export function AjnaProductContextProvider({
  children,
  ...rest
}: PropsWithChildren<AjnaProductContextProviderProps>) {
  if (!isAppContextAvailable()) return null

  const form = useAjnaBorrowFormReducto({})

  const [context, setContext] = useState<AjnaProductContext>({
    environment: {
      ...rest,
    },
    form,
    position: {},
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      form: { ...prev.form, state: form.state },
    }))
  }, [form.state])

  return <ajnaProductContext.Provider value={context}>{children}</ajnaProductContext.Provider>
}
