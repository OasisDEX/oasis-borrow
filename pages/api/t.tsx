import { enableMixpanelDevelopmentMode } from 'analytics/analytics'
import { config } from 'analytics/mixpanel'
import type { MixpanelDevelopmentType } from 'analytics/types'
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
