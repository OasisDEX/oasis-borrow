import {
  AccountContext,
  accountContext,
  AccountContextProvider,
  isAccountContextAvailable,
  useAccountContext,
} from 'components/context/AccountContextProvider'
import {
  AutomationCommonData,
  AutomationContext,
  automationContext,
  AutomationContextProvider,
  AutomationContextProviderProps,
  AutomationEnvironmentData,
  AutomationPositionData,
  useAutomationContext,
} from 'components/context/AutomationContextProvider'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import {
  GasEstimationContext,
  gasEstimationContext,
  GasEstimationContextProvider,
  useGasEstimationContext,
} from 'components/context/GasEstimationContextProvider'
import {
  isMainContextAvailable,
  mainContext,
  MainContextProvider,
  useMainContext,
} from 'components/context/MainContextProvider'
import {
  NotificationSocketContext,
  NotificationSocketProvider,
  useNotificationSocket,
} from 'components/context/NotificationSocketProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import {
  isProductContextAvailable,
  productContext,
  ProductContextProvider,
  useProductContext,
} from 'components/context/ProductContextProvider'
import {
  isTOSContextAvailable,
  TOSContext,
  tosContext,
  TOSContextProvider,
  useTOSContext,
} from 'components/context/TOSContextProvider'

export {
  accountContext,
  AccountContextProvider,
  automationContext,
  AutomationContextProvider,
  DeferedContextProvider,
  FunctionalContextHandler,
  gasEstimationContext,
  GasEstimationContextProvider,
  isAccountContextAvailable,
  isMainContextAvailable,
  isProductContextAvailable,
  isTOSContextAvailable,
  mainContext,
  MainContextProvider,
  NotificationSocketContext,
  NotificationSocketProvider,
  productContext,
  ProductContextHandler,
  ProductContextProvider,
  tosContext,
  TOSContextProvider,
  useAccountContext,
  useAutomationContext,
  useGasEstimationContext,
  useMainContext,
  useNotificationSocket,
  useProductContext,
  useTOSContext,
}

export type {
  AccountContext,
  AutomationCommonData,
  AutomationContext,
  AutomationContextProviderProps,
  AutomationEnvironmentData,
  AutomationPositionData,
  GasEstimationContext,
  TOSContext,
}
