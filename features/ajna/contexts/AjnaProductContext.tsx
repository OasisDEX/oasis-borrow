import { TxStatus } from '@oasisdex/transactions'
import { AjnaSimulationData } from 'actions/ajna'
import BigNumber from 'bignumber.js'
import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import { isBorrowStepValid } from 'features/ajna/borrow/contexts/ajnaBorrowStepManager'
import { useAjnaBorrowFormReducto } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import {
  defaultErrors,
  defaultWarnings,
  getAjnaBorrowValidations,
} from 'features/ajna/borrow/validations'
import { AjnaEditingStep, AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import {
  isExternalStep,
  isNextStep,
  isStepWithTransaction,
} from 'features/ajna/contexts/ajnaStepManager'
import { getTxStatuses } from 'features/ajna/contexts/ajnaTxManager'
import { TxDetails } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

interface AjnaBorrowContextProviderProps {
  collateralBalance: BigNumber
  ethBalance: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
  dpmProxy?: string
  ethPrice: BigNumber
  flow: AjnaFlow
  product: AjnaProduct
  quoteBalance: BigNumber
  quotePrice: BigNumber
  quoteToken: string
  owner: string
  currentPosition: AjnaPosition
  id?: string
  steps: AjnaStatusStep[]
}

type AjnaBorrowEnvironment = Omit<AjnaBorrowContextProviderProps, 'currentPosition' | 'steps'>
type AjnaCachedPosition = {
  currentPosition: AjnaPosition
  simulation?: AjnaPosition
}

export interface AjnaBorrowPosition {
  cachedPosition?: AjnaCachedPosition
  currentPosition: AjnaPosition
  id?: string
  isSimulationLoading?: boolean
  setCachedPosition: Dispatch<SetStateAction<AjnaCachedPosition | undefined>>
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData | undefined>>
  simulation?: AjnaSimulationData
}

interface AjnaBorrowSteps {
  currentStep: AjnaStatusStep
  editingStep: AjnaEditingStep
  isExternalStep: boolean
  isStepValid: boolean
  isStepWithTransaction: boolean
  steps: AjnaStatusStep[]
  txStatus?: TxStatus
  setStep: (step: AjnaStatusStep) => void
  setNextStep: () => void
  setPrevStep: () => void
}

interface AjnaBorrowTx {
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxSuccess: boolean
  isTxWaitingForApproval: boolean
  txDetails?: TxDetails
  setTxDetails: Dispatch<SetStateAction<TxDetails | undefined>>
}

interface AjnaBorrowContext {
  environment: AjnaBorrowEnvironment & {
    isOwner: boolean
  }
  form: ReturnType<typeof useAjnaBorrowFormReducto>
  position: AjnaBorrowPosition
  steps: AjnaBorrowSteps
  tx: AjnaBorrowTx
  validation: {
    errors: ValidationMessagesInput
    warnings: ValidationMessagesInput
  }
}

const ajnaBorrowContext = React.createContext<AjnaBorrowContext | undefined>(undefined)

export function useAjnaBorrowContext(): AjnaBorrowContext {
  const ac = useContext(ajnaBorrowContext)

  if (!ac) {
    throw new Error(
      "AjnaBorrowContext not available! useAjnaBorrowContext can't be used serverside",
    )
  }
  return ac
}

export function AjnaBorrowContextProvider({
  children,
  currentPosition,
  id,
  steps,
  ...props
}: PropsWithChildren<AjnaBorrowContextProviderProps>) {
  if (!isAppContextAvailable()) return null

  const {
    flow,
    collateralToken,
    collateralBalance,
    quoteBalance,
    ethBalance,
    ethPrice,
    owner,
  } = props

  const form = useAjnaBorrowFormReducto({
    action: flow === 'open' ? 'open' : 'deposit',
  })
  const { positionIdFromDpmProxy$ } = useAppContext()
  const gasEstimation = useGasEstimationContext()

  const _positionIdFromDpmProxy$ = useMemo(() => positionIdFromDpmProxy$(form.state.dpmAddress), [
    form.state.dpmAddress,
  ])
  const [positionIdFromDpmProxy] = useObservable(_positionIdFromDpmProxy$)

  const resolvedId = id && id !== '0' ? id : positionIdFromDpmProxy
  const { walletAddress } = useAccount()
  const [currentStep, setCurrentStep] = useState<AjnaStatusStep>(steps[0])
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [simulation, setSimulation] = useState<AjnaSimulationData>()
  const [isSimulationLoading, setIsLoadingSimulation] = useState(false)
  const [cachedPosition, setCachedPosition] = useState<AjnaCachedPosition>()

  const { errors, warnings } = useMemo(
    () =>
      getAjnaBorrowValidations({
        ethPrice: ethPrice,
        ethBalance: ethBalance,
        gasEstimationUsd: gasEstimation?.usdValue,
        depositAmount: form.state.depositAmount,
        paybackAmount: form.state.paybackAmount,
        collateralBalance: collateralBalance,
        quoteBalance: quoteBalance,
        simulationErrors: simulation?.errors,
        simulationWarnings: simulation?.errors,
        txError: txDetails?.txError,
        collateralToken: collateralToken,
      }),
    [
      ethPrice.toString(),
      ethBalance.toString(),
      gasEstimation?.usdValue.toString(),
      form.state.depositAmount?.toString(),
      form.state.paybackAmount?.toString(),
      collateralBalance.toString(),
      quoteBalance.toString(),
      simulation?.errors,
      txDetails?.txError,
      collateralToken,
    ],
  )

  const setStep = (step: AjnaStatusStep) => {
    if (
      !isNextStep({ currentStep, step, steps }) ||
      isBorrowStepValid({ currentStep, formState: form.state, errors })
    )
      setCurrentStep(step)
    else throw new Error(`A state of current step in not valid.`)
  }
  const shiftStep = (direction: 'next' | 'prev') => {
    const i = steps.indexOf(currentStep) + (direction === 'next' ? 1 : -1)

    if (steps[i]) setCurrentStep(steps[i])
    else throw new Error(`A step with index ${i} does not exist in form flow.`)
  }

  const setupStepManager = (): AjnaBorrowSteps => {
    return {
      currentStep,
      steps,
      editingStep: flow === 'open' ? 'setup' : 'manage',
      isExternalStep: isExternalStep({ currentStep }),
      isStepWithTransaction: isStepWithTransaction({ currentStep }),
      isStepValid: isBorrowStepValid({ currentStep, formState: form.state, errors }),
      setStep,
      setNextStep: () => shiftStep('next'),
      setPrevStep: () => shiftStep('prev'),
    }
  }

  const setupTxManager = (): AjnaBorrowTx => {
    return {
      txDetails,
      setTxDetails,
      ...getTxStatuses(txDetails?.txStatus),
    }
  }

  const [context, setContext] = useState<AjnaBorrowContext>({
    environment: { ...props, isOwner: owner === walletAddress || flow === 'open' },
    form,
    position: {
      id,
      currentPosition,
      setIsLoadingSimulation,
      setSimulation,
      setCachedPosition,
    },
    steps: setupStepManager(),
    tx: setupTxManager(),
    validation: {
      errors: defaultErrors,
      warnings: defaultWarnings,
    },
  })

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      environment: {
        ...prev.environment,
        isOwner: owner === walletAddress || flow === 'open',
        collateralBalance,
        quoteBalance,
      },
      position: {
        ...prev.position,
        id: resolvedId,
        cachedPosition,
        currentPosition,
        simulation,
        isSimulationLoading,
      },
      form: { ...prev.form, state: form.state },
      steps: setupStepManager(),
      tx: setupTxManager(),
      validation: {
        errors,
        warnings,
      },
    }))
  }, [
    collateralBalance,
    quoteBalance,
    resolvedId,
    cachedPosition,
    currentPosition,
    simulation,
    isSimulationLoading,
    form.state,
    currentStep,
    txDetails,
    errors,
    warnings,
  ])

  return <ajnaBorrowContext.Provider value={context}>{children}</ajnaBorrowContext.Provider>
}
