import { NotificationsEventAdditionalParams } from 'analytics/analytics'
import { NetworkIds } from 'blockchain/networkIds'
import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import {
  firstNotificationsRelevantDate,
  maxNumberOfNotifications,
} from 'features/notifications/consts'
import { prepareNotificationMessageHandlers } from 'features/notifications/handlers'
import {
  NOTIFICATION_CHANGE,
  notificationInitialState,
} from 'features/notifications/notificationChange'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { getBrowserName } from 'helpers/functions'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import getConfig from 'next/config'
import React, { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

interface WebSocket {
  socket?: Socket
  analyticsData: NotificationsEventAdditionalParams
}

export const NotificationSocketContext = createContext<WebSocket | {}>({})

export const useNotificationSocket = () => useContext(NotificationSocketContext) as WebSocket

export function NotificationSocketProvider({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  const notificationsToggle = useFeatureToggle('Notifications')
  const { context$, uiChanges } = useAppContext()
  const [context] = useObservable(context$)
  const [socket, setSocket] = useState<Socket | undefined>(undefined)
  const [token, setToken] = useState('')
  const notificationsHost =
    context?.chainId === NetworkIds.GOERLI
      ? getConfig()?.publicRuntimeConfig?.notificationsHostGoerli
      : getConfig()?.publicRuntimeConfig?.notificationsHost

  const account = context?.status === 'connected' ? context.account : ''
  const connectionKind = context?.connectionKind
  const jwtToken = jwtAuthGetToken(account)

  const analyticsData = {
    walletAddress: account,
    walletType: connectionKind,
    browserType: getBrowserName(),
  }

  const {
    numberOfNotificationsHandler,
    allNotificationsHandler,
    allActiveSubscriptionsHandler,
    allActiveChannelsHandler,
  } = prepareNotificationMessageHandlers(uiChanges)

  useEffect(() => {
    if (jwtToken && notificationsToggle) {
      if (jwtToken !== token && socket) {
        socket.disconnect()
        setSocket(undefined)
      }

      if (!socket) {
        const socketInstance = io(notificationsHost, {
          auth: {
            token: `Bearer ${jwtToken}`,
          },
          transports: ['websocket'],
          upgrade: false,
        })
        // initialize state
        uiChanges.publish(NOTIFICATION_CHANGE, {
          type: 'initialize-state',
          initializeState: notificationInitialState,
        })

        // initialize watchers
        socketInstance.on('notificationcount', numberOfNotificationsHandler)
        socketInstance.on('allactivenotifications', allNotificationsHandler)
        socketInstance.on('allactivesubscriptions', allActiveSubscriptionsHandler)
        socketInstance.on('allactivechannels', allActiveChannelsHandler)
        socketInstance.on('connect_error', (err) => {
          uiChanges.publish(NOTIFICATION_CHANGE, { type: 'error', error: err.message })
        })
        // generic error handled manually on backend, i.e errors due to db failure
        socketInstance.on('error', (err) => {
          uiChanges.publish(NOTIFICATION_CHANGE, { type: 'error', error: err.message })
        })

        // subscription & reconnect handling
        socketInstance.on('connect', () => {
          uiChanges.publish(NOTIFICATION_CHANGE, { type: 'error', error: '' })
          socketInstance.emit('initialize', {
            address: account,
            notificationPreferences: {
              maxNumberOfNotifications,
              firstRelevantDate: firstNotificationsRelevantDate,
            },
          })
        })

        setSocket(socketInstance)
        setToken(jwtToken)
      }
    }

    return () => {
      socket?.off('notificationcount', numberOfNotificationsHandler)
      socket?.off('allnotifications', allNotificationsHandler)
      socket?.off('allactivesubscriptions', allActiveSubscriptionsHandler)
      socket?.off('allactivechannels', allActiveChannelsHandler)
    }
  }, [jwtToken, socket])

  return (
    <NotificationSocketContext.Provider value={{ socket, analyticsData }}>
      {children}
    </NotificationSocketContext.Provider>
  )
}
