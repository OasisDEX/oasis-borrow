import { withSentry } from '@sentry/nextjs'
import { enableMixpanelDevelopmentMode, MixpanelDevelopmentType } from 'analytics/analytics'
import { config } from 'analytics/mixpanel'
import Mixpanel from 'mixpanel'
import { NextApiRequest, NextApiResponse } from 'next'

type MixpanelType = MixpanelDevelopmentType | typeof Mixpanel
let mixpanel: MixpanelType = Mixpanel.init(config.mixpanel.token, config.mixpanel.config)

mixpanel = enableMixpanelDevelopmentMode(mixpanel)

const handler = async function (req: NextApiRequest, res: NextApiResponse<{ status: number }>) {
  try {
    const { eventName, eventBody, distinctId, currentUrl, referrer } = req.body

    mixpanel.track(`be-${eventName}`, {
      ...eventBody,
      distinct_id: distinctId,
      current_url: currentUrl,
      referrer: referrer,
      id: `be-${eventBody.id}`,
    })

    res.json({ status: 200 })
  } catch (err) {
    res.json({ status: 500 })
  }
}

export default withSentry(handler)
