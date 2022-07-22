import { useAppContext } from 'components/AppContextProvider'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { useEffect } from 'react'

const initialState: NotificationChange = {
  numberOfNotifications: 0,
  notificationList: [],
}

export function initializeNotifications(account: string) {
  const { uiChanges, socket } = useAppContext()

  useEffect(() => {
    // initialize state
    uiChanges.publish(NOTIFICATION_CHANGE, {
      type: 'initialize-state',
      initializeState: initialState,
    })

    // initialize watchers
    socket.on('notificationcount', (count) => {
      uiChanges.publish(NOTIFICATION_CHANGE, {
        type: 'number-of-notifications',
        numberOfNotifications: count,
      })
    })

    // subscription
    socket.emit('subscribecount', {
      address: account,
      signature: 'signature',
      messageHash: 'messageHash',
    })
  }, [])
}

export function useNotifications() {
  const { socket } = useAppContext()

  function emitNotificationEvent(action: 'toggle' | 'markAsRead' | 'email', payload: any) {
    socket.emit(action, payload)
  }

  return [emitNotificationEvent]
}
