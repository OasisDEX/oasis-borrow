import {
  dummyChannels,
  dummyNotifications,
  dummySubscriptions,
} from 'features/notifications/tempData'
import {
  Notification,
  NotificationChannels,
  NotificationSubscription,
} from 'features/notifications/types'

export const notificationInitialState: NotificationChange = {
  numberOfNotifications: 0,
  allNotifications: dummyNotifications,
  allActiveSubscriptions: dummySubscriptions,
  allActiveChannels: dummyChannels,
  error: '',
}

export type NotificationChangeAction =
  | { type: 'number-of-notifications'; numberOfNotifications: number }
  | { type: 'all-notifications'; allNotifications: Notification[] }
  | { type: 'all-active-subscriptions'; allActiveSubscriptions: NotificationSubscription[] }
  | { type: 'all-active-channels'; allActiveChannels: NotificationChannels[] }
  | { type: 'initialize-state'; initializeState: NotificationChange }
  | { type: 'error'; error: string }

export interface NotificationChange {
  numberOfNotifications: number
  allNotifications: Notification[]
  allActiveSubscriptions: NotificationSubscription[]
  allActiveChannels: NotificationChannels[]
  error: string
}

export const NOTIFICATION_CHANGE = 'NOTIFICATION_CHANGE'

export function notificationReducer(state: NotificationChange, action: NotificationChangeAction) {
  switch (action.type) {
    case 'number-of-notifications':
      return { ...state, numberOfNotifications: action.numberOfNotifications }
    case 'all-notifications':
      return { ...state, allNotifications: action.allNotifications }
    case 'all-active-subscriptions':
      return { ...state, allActiveSubscriptions: action.allActiveSubscriptions }
    case 'all-active-channels':
      return { ...state, allActiveChannels: action.allActiveChannels }
    case 'error':
      return { ...state, error: action.error }
    case 'initialize-state':
      return { ...state, ...action.initializeState }
    default:
      return state
  }
}
