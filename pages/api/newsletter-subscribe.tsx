import type { NextApiRequest, NextApiResponse } from 'next'

const { NEWSLETTER_API_KEY, NEWSLETTER_PUBLICATION_ID, NEWSLETTER_ENDPOINT } = process.env

// validating - The email address is being validated.
// invalid - The email address is invalid.
// pending - The email address is valid, but the subscription is pending double opt-in.
// active - The email was valid and the subscription is active.
// inactive - The subscription was made inactive, possibly due to an unsubscribe.
// needs_attention - The subscription requires approval or denial.

type UserStatus = 'validating' | 'invalid' | 'pending' | 'active' | 'inactive' | 'needs_attention'

type SubscriptionResponse = {
  // same for GET and POST
  data: {
    id: string
    email: string
    status: UserStatus
    created: number
  }
  status: number
  statusText: string
}

const MEMBER_GET_ENDPOINT = `${NEWSLETTER_ENDPOINT}/publications/${NEWSLETTER_PUBLICATION_ID}/subscriptions/by_email`
const SUBSCRIBE_POST_ENDPOINT = `${NEWSLETTER_ENDPOINT}/publications/${NEWSLETTER_PUBLICATION_ID}/subscriptions`

const handler = async function (req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body

  const bodyData = {
    email: email,
  }

  const headers = {
    Authorization: `Bearer ${NEWSLETTER_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  try {
    const {
      data: getMemberResponse,
      status: getMemberErrorStatus,
      statusText: getMemberErrorStatusText,
    }: SubscriptionResponse = await fetch(`${MEMBER_GET_ENDPOINT}/${email}`, {
      headers,
      method: 'GET',
    }).then((getMemberRes) => getMemberRes.json())

    // new subscription
    if (getMemberErrorStatus === 404 && getMemberErrorStatusText === 'not_found') {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: subscribeMemberReponse,
        status: subscribeErrorStatus,
        statusText: subscribeErrorStatusText,
      }: SubscriptionResponse = await fetch(SUBSCRIBE_POST_ENDPOINT, {
        body: JSON.stringify({ ...bodyData }),
        headers,
        method: 'POST',
      }).then((subscribeMemberRes) => subscribeMemberRes.json())

      if (subscribeErrorStatus || subscribeErrorStatusText) {
        return res.status(500).json({
          error: 'unknown',
          response: {
            subscribeErrorStatus,
            subscribeErrorStatusText,
          },
        })
      }
      return res.status(200).json({})
    }

    if (getMemberErrorStatus || getMemberErrorStatusText) {
      return res.status(500).json({
        error: 'unknown',
        response: {
          getMemberErrorStatus,
          getMemberErrorStatusText,
        },
      })
    }

    if (getMemberResponse.status === 'pending') {
      return res.status(409).json({ error: 'emailPending' })
    }

    if (getMemberResponse.status === 'active') {
      return res.status(409).json({ error: 'emailAlreadyExists' })
    }

    // resubscribe
    if (getMemberResponse.status === 'inactive') {
      const { data: subscribeMemberReponse }: SubscriptionResponse = await fetch(
        SUBSCRIBE_POST_ENDPOINT,
        {
          body: JSON.stringify({ ...bodyData, reactivate_existing: true }),
          headers,
          method: 'POST',
        },
      ).then((subscribeMemberRes) => subscribeMemberRes.json())

      // Might happen eg. if user who was permanently deleted (not archived) tries to resubscribe
      if (subscribeMemberReponse.status !== 'inactive') {
        return res.status(500).json({ error: 'unknown', response: subscribeMemberReponse })
      }

      return res.status(200).json({})
    }

    return res.status(500).json({
      error: 'unknown',
      response: getMemberResponse,
    })
  } catch (error) {
    // @ts-ignore
    return res.status(500).json({ error: error.message || error.toString() })
  }
}

export default handler
