import { enableMixpanelDevelopmentMode } from 'analytics/analytics'
import { config } from 'analytics/mixpanel'
import { TrackingProductType } from 'analytics/TrackingProductType'
import {
  MixpanelCommonAnalyticsSections,
  type MixpanelDevelopmentType,
  MixpanelEventTypes,
  MixpanelPages,
} from 'analytics/types'
import { snakeCase } from 'lodash'
import Mixpanel from 'mixpanel'
import type { NextApiRequest, NextApiResponse } from 'next'

type MixpanelType = MixpanelDevelopmentType | typeof Mixpanel
let mixpanel: MixpanelType = Mixpanel.init(config.mixpanel.token, config.mixpanel.config)

mixpanel = enableMixpanelDevelopmentMode(mixpanel)

const handler = async function (
  { body: { distinctId, eventBody, eventName, ...rest } }: NextApiRequest,
  res: NextApiResponse<{ status: number }>,
) {
  const hasProperEventName = Object.values(MixpanelEventTypes).includes(eventName)
  const hasProperProduct = Object.values(TrackingProductType).includes(eventBody.product)
  const hasProperSection = Object.values(MixpanelCommonAnalyticsSections).includes(
    eventBody.section,
  )
  const hasProperPage = Object.values(MixpanelPages).includes(eventBody.page)
  if (
    !hasProperEventName ||
    (eventBody.product && !hasProperProduct) ||
    (eventBody.section && !hasProperSection) ||
    (eventBody.page && !hasProperPage)
  ) {
    res.json({ status: 400 })
    return
  }
  try {
    !rest.currentUrl.endsWith('vault-info') && // disables tracking for this particular tab
      mixpanel.track(`${eventName}`, {
        distinct_id: distinctId,
        ...eventBody,
        ...Object.keys(rest).reduce((a, v) => ({ ...a, [`$${snakeCase(v)}`]: rest[v] }), {}),
      })

    res.json({ status: 200 })
  } catch (err) {
    res.json({ status: 500 })
  }
}

export default handler
