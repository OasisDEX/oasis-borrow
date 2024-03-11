import type BigNumber from 'bignumber.js'
import type { Dispatch, FC } from 'react'
import React, { createContext, useContext, useMemo, useReducer } from 'react'

interface Erc4626CustomState {
  estimatedMarketCap: BigNumber
}

type Erc4626CustomActions = { type: 'estimated-market-cap-change'; estimatedMarketCap: BigNumber }

const erc4626CustomStateContext = createContext<
  { state: Erc4626CustomState; dispatch: Dispatch<Erc4626CustomActions> } | undefined
>(undefined)

const reducer = (state: Erc4626CustomState, action: Erc4626CustomActions): Erc4626CustomState => {
  switch (action.type) {
    case 'estimated-market-cap-change':
      return { estimatedMarketCap: action.estimatedMarketCap }
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
  estimatedMarketCap,
}) => {
  const [state, dispatch] = useReducer(reducer, { estimatedMarketCap })

  useMemo(() => {
    dispatch({ type: 'estimated-market-cap-change', estimatedMarketCap })
  }, [estimatedMarketCap?.toString()])

  return (
    <erc4626CustomStateContext.Provider value={{ state, dispatch }}>
      {children}
    </erc4626CustomStateContext.Provider>
  )
}
