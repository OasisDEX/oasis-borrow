import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

interface WebSocket {
  socket?: Socket
}

export const NotificationSocketContext = createContext<WebSocket | {}>({})

export const useSocket = () => useContext(NotificationSocketContext) as WebSocket

const initialState: NotificationChange = {
  numberOfNotifications: 0,
  notificationList: [],
}

export function NotificationSocketProvider({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  const notificationsToggle = useFeatureToggle('Notifications')
  const { context$, uiChanges } = useAppContext()
  const [context] = useObservable(context$)
  const [socket, setSocket] = useState<Socket | undefined>(undefined)
  const [token, setToken] = useState('')

  const account = context?.status === 'connected' ? context.account : ''
  const jwtToken = jwtAuthGetToken(account)

  function handler(count: number) {
    uiChanges.publish(NOTIFICATION_CHANGE, {
      type: 'number-of-notifications',
      numberOfNotifications: count,
    })
  }

  useEffect(() => {
    if (jwtToken && notificationsToggle) {
      if (jwtToken !== token && socket) {
        socket.disconnect()
        setSocket(undefined)
      }

      if (!socket) {
        const socketInstance = io('ws://localhost:3005', { auth: { token: `Bearer ${jwtToken}` } })

        // initialize state
        uiChanges.publish(NOTIFICATION_CHANGE, {
          type: 'initialize-state',
          initializeState: initialState,
        })

        // initialize watchers
        socketInstance.on('notificationcount', handler)

        // subscription & reconnect handling
        socketInstance.on('connect', () => {
          socketInstance.emit('subscribecount', {
            address: account,
            signature: 'signature',
            messageHash: 'messageHash',
          })
        })

        setSocket(socketInstance)
        setToken(jwtToken)
      }
    }

    return () => {
      socket?.off('notificationcount', handler)
    }
  }, [jwtToken, socket])

  return (
    <NotificationSocketContext.Provider value={{ socket }}>
      {children}
    </NotificationSocketContext.Provider>
  )
}
