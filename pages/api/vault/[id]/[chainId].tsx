import { getVault } from 'handlers/vault/get'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  await getVault(req, res)
}
export default handler
