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
    const {
      eventName,
      eventBody,
      distinctId,
      currentUrl,
      initialReferrer,
      initialReferrerHost,
      userId,
    } = req.body

    mixpanel.track(`${eventName}`, {
      ...eventBody,
      distinct_id: distinctId,
      $current_url: currentUrl,
      $initial_referrer: initialReferrer,
      $initial_referring_domain: initialReferrerHost,
      $user_id: userId,
    })

    res.json({ status: 200 })
  } catch (err) {
    res.json({ status: 500 })
  }
}

export default withSentry(handler)
