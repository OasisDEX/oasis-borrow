import { withSentry } from '@sentry/nextjs'
import md5 from 'crypto-js/md5'
import { NextApiRequest, NextApiResponse } from 'next'

const AUTHORIZATION_HEADER = `Basic ${Buffer.from(
  `apikey:${process.env.MAILCHIMP_API_KEY}`,
).toString('base64')}`

const SUBSCRIBERS_ENDPOINT = `${process.env.MAILCHIMP_ENDPOINT}/members`

type UserStatus = 'pending' | 'subscribed' | 'unsubscribed' | 'cleaned' | 'transactional'

// change to pending if there is need for opt-in confirm email
// change to subscribed if there is no need for opt-in
const INITIAL_USER_STATUS: UserStatus = 'subscribed'

const handler = async function (req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body

  try {
    const emailMd5Hash = md5(email)
    const MEMBER_ENDPOINT = `${SUBSCRIBERS_ENDPOINT}/${emailMd5Hash}`

    // GET request first to check if user exists OR is subscribed
    const response = await fetch(MEMBER_ENDPOINT, {
      headers: {
        Authorization: AUTHORIZATION_HEADER,
      },
      method: 'GET',
    }).then((res) => res.json())

    if (response.status === 'pending') {
      return res.status(409).json({ error: 'emailPending' })
    }

    if (response.status === 'subscribed') {
      return res.status(409).json({ error: 'emailAlreadyExists' })
    }

    if (response.status === 'unsubscribed' || response.status === 404) {
      const bodyData = {
        email_address: email,
        status: INITIAL_USER_STATUS,
        status_if_new: INITIAL_USER_STATUS,
      }

      const response = await fetch(MEMBER_ENDPOINT, {
        body: JSON.stringify(bodyData),
        headers: {
          Authorization: AUTHORIZATION_HEADER,
        },
        method: 'PUT',
      }).then((res) => res.json())

      // Might happen eg. if user who was permanently deleted (not archived) tries to resubscribe
      if (response.status !== INITIAL_USER_STATUS) {
        console.error(response)
        return res.status(500).json({ error: 'unknown', response })
      }

      return res.status(200).json({})
    }

    return res.status(500).json({
      error: 'unknown',
      response,
    })
  } catch (error) {
    // @ts-ignore
    return res.status(500).json({ error: error.message || error.toString() })
  }
}

export default withSentry(handler)
