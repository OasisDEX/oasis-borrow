import { useEffect } from 'react'
import type { Route } from '@lifi/sdk'
import type { RouteExecutionUpdate } from '@lifi/widget'
import { useWidgetEvents, WidgetEvent } from '@lifi/widget'
import { SwapWidgetEvents, trackingEvents } from 'analytics/analytics'

export const useTrackSwapWidgetEvents = () => {
  const widgetEvents = useWidgetEvents()

  const swapWidgetEventHandler =
    (event: SwapWidgetEvents) => (eventData: Route | RouteExecutionUpdate) => {
      trackingEvents.swapWidgetEvent(event, eventData)
    }

  useEffect(() => {
    widgetEvents.on(
      WidgetEvent.RouteExecutionStarted,
      swapWidgetEventHandler(SwapWidgetEvents.ExecutionCompleted),
    )
    widgetEvents.on(
      WidgetEvent.RouteExecutionUpdated,
      swapWidgetEventHandler(SwapWidgetEvents.ExecutionUpdated),
    )
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      swapWidgetEventHandler(SwapWidgetEvents.ExecutionCompleted),
    )
    widgetEvents.on(
      WidgetEvent.RouteExecutionFailed,
      swapWidgetEventHandler(SwapWidgetEvents.ExecutionFailed),
    )

    return () => widgetEvents.all.clear()
  }, [widgetEvents])

  return null
}
