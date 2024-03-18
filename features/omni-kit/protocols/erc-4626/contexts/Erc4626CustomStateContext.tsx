import type BigNumber from 'bignumber.js'
import type { Dispatch, FC } from 'react'
import React, { createContext, useContext, useMemo, useReducer } from 'react'

interface Erc4626CustomState {
  estimatedPrice: BigNumber
}

type Erc4626CustomActions = { type: 'estimated-price-change'; estimatedPrice: BigNumber }

const erc4626CustomStateContext = createContext<
  { state: Erc4626CustomState; dispatch: Dispatch<Erc4626CustomActions> } | undefined
>(undefined)

const reducer = (state: Erc4626CustomState, action: Erc4626CustomActions): Erc4626CustomState => {
  switch (action.type) {
    case 'estimated-price-change':
      return { estimatedPrice: action.estimatedPrice }
    default:
      return state
  }
}

export const useErc4626CustomState = () => {
  const context = useContext(erc4626CustomStateContext)

  if (context === undefined)
    throw new Error('useErc4626CustomState must be used within a Erc4626CustomStateProvider')

  return context
}

export const Erc4626CustomStateContextProvider: FC<Erc4626CustomState> = ({
  children,
  estimatedPrice,
}) => {
  const [state, dispatch] = useReducer(reducer, { estimatedPrice })

  useMemo(() => {
    dispatch({ type: 'estimated-price-change', estimatedPrice })
  }, [estimatedPrice?.toString()])

  return (
    <erc4626CustomStateContext.Provider value={{ state, dispatch }}>
      {children}
    </erc4626CustomStateContext.Provider>
  )
}
