import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export function apply(fn: Function, handler: NextApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, fn)
    await handler(req, res)
  }
}

export function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}
