import { AjnaSimulationData } from 'actions/ajna'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { defaultErrors, defaultWarnings } from 'features/ajna/borrow/validations'
import {
  AjnaPositionSet,
  AjnaProductPosition,
  AjnaProductValidation,
} from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { isEarnFormValid } from 'features/ajna/earn/contexts/isEarnFormValid'
import { useAjnaEarnFormReducto } from 'features/ajna/earn/state/ajnaEarnFormReducto'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import React, { PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

// TODO: fake type just to see how different position types will behave
export type AjnaEarnPosition = Omit<AjnaPosition, 'debtAmount'> & { price: BigNumber }

interface AjnaEarnContextProviderProps {
  position: AjnaEarnPosition
}

type AjnaEarnContext = AjnaProductValidation & {
  form: ReturnType<typeof useAjnaEarnFormReducto>
  position: AjnaProductPosition<AjnaEarnPosition>
}

const ajnaEarnContext = React.createContext<AjnaEarnContext | undefined>(undefined)

export function useAjnaEarnContext(): AjnaEarnContext {
  const ac = useContext(ajnaEarnContext)

  if (!ac) {
    throw new Error("AjnaEarnContext not available! useAjnaEarnContext can't be used serverside")
  }
  return ac
}

export function AjnaEarnContextProvider({
  children,
  position,
}: PropsWithChildren<AjnaEarnContextProviderProps>) {
  const { walletAddress } = useAccount()
  const {
    environment: { collateralBalance, flow, quoteBalance },
    steps: { currentStep },
    tx: { txDetails },
  } = useAjnaProductContext()

  const form = useAjnaEarnFormReducto({
    action: flow === 'open' ? 'openEarn' : 'depositEarn',
    price: new BigNumber(20000),
  })
  const { positionIdFromDpmProxy$ } = useAppContext()
  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(form.state.dpmAddress), [form.state.dpmAddress]),
  )

  const [simulation, setSimulation] = useState<AjnaSimulationData<AjnaEarnPosition>>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)
  const [cachedPosition, setCachedPosition] = useState<AjnaPositionSet<AjnaEarnPosition>>()

  // TODO: replace with Earn validations
  const errors = defaultErrors
  const warnings = defaultWarnings

  const [context, setContext] = useState<AjnaEarnContext>({
    form,
    position: {
      cachedPosition,
      currentPosition: { position },
      isSimulationLoading,
      resolvedId: positionIdFromDpmProxyData,
      setCachedPosition,
      setIsLoadingSimulation,
      setSimulation,
    },
    validation: {
      errors: defaultErrors,
      isFormValid: isEarnFormValid({ currentStep, formState: form.state, errors }),
      warnings: defaultWarnings,
    },
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        cachedPosition,
        currentPosition: {
          position,
          simulation: simulation?.position,
        },
        isSimulationLoading,
        resolvedId: positionIdFromDpmProxyData,
      },
      form: { ...prev.form, state: form.state },
      validation: {
        errors,
        isFormValid: isEarnFormValid({ currentStep, formState: form.state, errors }),
        warnings,
      },
    }))
  }, [
    cachedPosition,
    collateralBalance,
    currentStep,
    errors,
    form.state,
    isSimulationLoading,
    position,
    positionIdFromDpmProxyData,
    quoteBalance,
    simulation,
    txDetails,
    warnings,
    walletAddress,
  ])

  return <ajnaEarnContext.Provider value={context}>{children}</ajnaEarnContext.Provider>
}
