import { createOrUpdate } from 'handlers/vault/createOrUpdate'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  await createOrUpdate(req, res)
}
export default handler
