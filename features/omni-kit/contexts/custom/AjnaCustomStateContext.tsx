import type BigNumber from 'bignumber.js'
import type { Dispatch, FC } from 'react'
import React, { useReducer } from 'react'

interface AjnaCustomState {
  price?: BigNumber
}

type AjnaCustomActions = { type: 'reset' } | { type: 'price-change'; price?: BigNumber }

const ajnaCustomStateContext = React.createContext<
  { state: AjnaCustomState; dispatch: Dispatch<AjnaCustomActions> } | undefined
>(undefined)

const reducer =
  ({ price }: { price?: BigNumber }) =>
  (state: AjnaCustomState, action: AjnaCustomActions): AjnaCustomState => {
    switch (action.type) {
      case 'reset':
        return { price }
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

export const AjnaCustomStateContextProvider: FC<{ price?: BigNumber }> = ({ children, price }) => {
  const initReducer = reducer({ price })
  const [state, dispatch] = useReducer(initReducer, { price })

  return (
    <ajnaCustomStateContext.Provider value={{ state, dispatch }}>
      {children}
    </ajnaCustomStateContext.Provider>
  )
}
