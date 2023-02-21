import { AjnaSimulationData } from 'actions/ajna'
import { AjnaValidationItem } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import { defaultErrors, defaultWarnings } from 'features/ajna/borrow/validations'
import { AjnaPositionSet, AjnaStatusStep } from 'features/ajna/common/types'
import { TxDetails } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useEffect, useMemo, useState } from 'react'

export function initializeAjnaContext<
  C extends {
    form: { state: { dpmAddress: string } }
    position: object
    validation: {
      errors: ValidationMessagesInput
      warnings: ValidationMessagesInput
      isFormValid: boolean
    }
  },
  P
>({
  form,
  collateralBalance,
  currentStep,
  position,
  quoteBalance,
  txDetails,
  validationCallback,
  isFormValidCallback,
}: {
  form: { state: { dpmAddress: string } }
  collateralBalance: BigNumber
  currentStep: AjnaStatusStep
  position: P
  quoteBalance: BigNumber
  txDetails?: TxDetails
  validationCallback: (value: {
    errors?: AjnaValidationItem[]
    usdValue?: BigNumber
  }) => { errors: ValidationMessagesInput; warnings: ValidationMessagesInput }
  isFormValidCallback: ({ errors }: { errors: ValidationMessagesInput }) => boolean
}) {
  const { walletAddress } = useAccount()
  const { positionIdFromDpmProxy$ } = useAppContext()
  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(form.state.dpmAddress), [form.state.dpmAddress]),
  )
  const gasEstimation = useGasEstimationContext()

  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)

  const [simulation, setSimulation] = useState<AjnaSimulationData<P>>()
  const [cachedPosition, setCachedPosition] = useState<AjnaPositionSet<P>>()

  const { errors, warnings } = useMemo(
    () => validationCallback({ errors: simulation?.errors, usdValue: gasEstimation?.usdValue }),
    [gasEstimation?.usdValue.toString(), simulation?.errors],
  )

  const isFormValid = isFormValidCallback({ errors })

  const [context, setContext] = useState({
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
      isFormValid: false,
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
        isFormValid,
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

  return context as C
}
