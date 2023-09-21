import type { Route } from '@lifi/sdk'
import type { RouteExecutionUpdate } from '@lifi/widget'
import { useWidgetEvents, WidgetEvent } from '@lifi/widget'
import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelSwapWidgetEvents } from 'analytics/types'
import { useEffect } from 'react'

export const useTrackSwapWidgetEvents = () => {
  const widgetEvents = useWidgetEvents()

  const swapWidgetEventHandler =
    (event: MixpanelSwapWidgetEvents) => (eventData: Route | RouteExecutionUpdate) => {
      trackingEvents.swapWidgetEvent(event, eventData)
    }

  useEffect(() => {
    widgetEvents.on(
      WidgetEvent.RouteExecutionStarted,
      swapWidgetEventHandler(MixpanelSwapWidgetEvents.ExecutionCompleted),
    )
    widgetEvents.on(
      WidgetEvent.RouteExecutionUpdated,
      swapWidgetEventHandler(MixpanelSwapWidgetEvents.ExecutionUpdated),
    )
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      swapWidgetEventHandler(MixpanelSwapWidgetEvents.ExecutionCompleted),
    )
    widgetEvents.on(
      WidgetEvent.RouteExecutionFailed,
      swapWidgetEventHandler(MixpanelSwapWidgetEvents.ExecutionFailed),
    )
    return () => widgetEvents.all.clear()
  }, [widgetEvents])

  return null
}
