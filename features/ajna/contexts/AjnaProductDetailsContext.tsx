import { useAjnaGeneralContext } from 'features/ajna/contexts/AjnaProductContext'
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'

type positionBorrow = {
  foo: string
  borrow: true
}
type positionEarn = {
  foo: string
  earn: true
}

interface AjnaProductDetailsContextProviderWithBorrow {
  product: 'borrow'
}
interface AjnaProductDetailsContextProviderWithEarn {
  product: 'earn'
}
type AjnaProductDetailsContextProviderProps =
  | AjnaProductDetailsContextProviderWithBorrow
  | AjnaProductDetailsContextProviderWithEarn

interface AjnaProductDetailsContextWithBorrow {
  position: positionBorrow
}
interface AjnaProductDetailsContextWithEarn {
  position: positionEarn
}

const ajnaProductBorrowDetailsContext = React.createContext<
  AjnaProductDetailsContextWithBorrow | undefined
>(undefined)
const ajnaProductEarnDetailsContext = React.createContext<
  AjnaProductDetailsContextWithEarn | undefined
>(undefined)

type TypeName = 'borrow' | 'earn'
type ObjectType<T> = T extends 'borrow'
  ? AjnaProductDetailsContextWithBorrow
  : T extends 'earn'
  ? AjnaProductDetailsContextWithEarn
  : never

export function useAjnaProductDetailsContext<T extends TypeName>(product: T): ObjectType<T> {
  const ac =
    product === 'borrow'
      ? useContext(ajnaProductBorrowDetailsContext)
      : useContext(ajnaProductEarnDetailsContext)

  if (!ac) {
    throw new Error(
      "AjnaProductDetailsContext not available! useAjnaProductDetailsContext can't be used serverside",
    )
  }
  return ac as ObjectType<T>
}

export function AjnaProductDetailsContextProvider({
  children,
  product,
}: PropsWithChildren<AjnaProductDetailsContextProviderProps>) {
  const [context, setContext] = useState({
    position: {
      foo: 'test',
      ...(product === 'borrow' && { borrow: true }),
      ...(product === 'earn' && { earn: true }),
    },
  })
  const {
    environment: { collateralBalance },
  } = useAjnaGeneralContext()

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        foo: Math.random().toString(),
      },
    }))
  }, [collateralBalance])

  switch (product) {
    case 'borrow':
      return (
        <ajnaProductBorrowDetailsContext.Provider
          value={context as AjnaProductDetailsContextWithBorrow}
        >
          {children}
        </ajnaProductBorrowDetailsContext.Provider>
      )
    case 'earn':
      return (
        <ajnaProductEarnDetailsContext.Provider
          value={context as AjnaProductDetailsContextWithEarn}
        >
          {children}
        </ajnaProductEarnDetailsContext.Provider>
      )
  }
}
