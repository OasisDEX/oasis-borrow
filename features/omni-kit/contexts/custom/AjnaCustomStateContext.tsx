import type { FC } from 'react'
import React, { useEffect, useReducer } from 'react'

const ajnaCustomStateContext = React.createContext<{ age: number } | undefined>(undefined)

function reducer(state: { age: number }, action: { type: 'incremented_age' }): { age: number } {
  if (action.type === 'incremented_age') {
    return {
      age: state.age + 1,
    }
  }
  throw Error('Unknown action.')
}

export const useAjnaCustomState = () => {
  const context = React.useContext(ajnaCustomStateContext)
  if (context === undefined) {
    throw new Error('useAjnaCustomState must be used within a AjnaCustomStateContextProvider')
  }
  return context
}

export const AjnaCustomStateContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { age: 42 })

  useEffect(() => {
    const intv = setInterval(() => dispatch({ type: 'incremented_age' }), 5000)

    return () => clearInterval(intv)
  }, [])

  return <ajnaCustomStateContext.Provider value={state}>{children}</ajnaCustomStateContext.Provider>
}
