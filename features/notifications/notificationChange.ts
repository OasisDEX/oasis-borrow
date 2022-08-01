export type NotificationChangeAction =
  | { type: 'number-of-notifications'; numberOfNotifications: number }
  | { type: 'notification-list'; notificationList: any[] }
  | { type: 'initialize-state'; initializeState: NotificationChange }

export interface NotificationChange {
  numberOfNotifications: number
  notificationList: any[]
}

export const NOTIFICATION_CHANGE = 'NOTIFICATION_CHANGE'

export function notificationReducer(state: NotificationChange, action: NotificationChangeAction) {
  switch (action.type) {
    case 'number-of-notifications':
      return { ...state, numberOfNotifications: action.numberOfNotifications }
    case 'notification-list':
      return { ...state, notificationList: action.notificationList }
    case 'initialize-state':
      return { ...state, ...action.initializeState }
    default:
      return state
  }
}
