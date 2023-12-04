import type BigNumber from 'bignumber.js'
import type { Dispatch, FC } from 'react'
import React, { useMemo, useReducer } from 'react'

interface AjnaCustomState {
  price?: BigNumber
}

type AjnaCustomActions =
  | { type: 'reset'; price: BigNumber }
  | { type: 'price-change'; price?: BigNumber }

const ajnaCustomStateContext = React.createContext<
  { state: AjnaCustomState; dispatch: Dispatch<AjnaCustomActions> } | undefined
>(undefined)

const reducer = (state: AjnaCustomState, action: AjnaCustomActions): AjnaCustomState => {
  switch (action.type) {
    case 'reset':
      return { price: action.price }
    case 'price-change':
      return { price: action.price }
    default:
      return state
  }
}

export const useAjnaCustomState = () => {
  const context = React.useContext(ajnaCustomStateContext)
  if (context === undefined) {
    throw new Error('useAjnaCustomState must be used within a AjnaCustomStateContextProvider')
  }
  return context
}

export const AjnaCustomStateContextProvider: FC<AjnaCustomState> = ({ children, price }) => {
  const [state, dispatch] = useReducer(reducer, { price })

  // ensure that price will be updated once new position state is loaded
  useMemo(() => {
    dispatch({ type: 'price-change', price })
  }, [price?.toString()])

  return (
    <ajnaCustomStateContext.Provider value={{ state, dispatch }}>
      {children}
    </ajnaCustomStateContext.Provider>
  )
}
