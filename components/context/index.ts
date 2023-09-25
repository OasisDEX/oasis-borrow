import type { AccountContext } from 'components/context/AccountContextProvider'
import {
  accountContext,
  AccountContextProvider,
  isAccountContextAvailable,
  useAccountContext,
} from 'components/context/AccountContextProvider'
import type {
  AutomationCommonData,
  AutomationContext,
  AutomationContextProviderProps,
  AutomationEnvironmentData,
  AutomationPositionData,
} from 'components/context/AutomationContextProvider'
import {
  automationContext,
  AutomationContextProvider,
  useAutomationContext,
} from 'components/context/AutomationContextProvider'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import {
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
import type { TOSContext } from 'components/context/TOSContextProvider'
import {
  isTOSContextAvailable,
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
