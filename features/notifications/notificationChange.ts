import type {
  Notification,
  NotificationChannels,
  NotificationSubscription,
} from 'features/notifications/types'

export const notificationInitialState: NotificationChange = {
  numberOfNotifications: 0,
  allNotifications: [],
  allActiveSubscriptions: [],
  allActiveChannels: [],
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
      const merged = [...action.allNotifications, ...state.allNotifications]
      const allNotifications = merged.reduce((acc, curr) => {
        const duplicatedNotification = acc.find((item) => item.id === curr.id)

        if (duplicatedNotification) {
          return acc
        }

        return [...acc, curr]
      }, [] as Notification[])
      return { ...state, allNotifications }
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
