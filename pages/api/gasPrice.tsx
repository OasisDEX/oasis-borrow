import { NextApiRequest, NextApiResponse } from 'next'
import { ajax } from 'rxjs/ajax'

export default async function (_req: NextApiRequest, res: NextApiResponse) {
  console.log('Hello call from gasPrice', res === undefined)
  ajax({
    url: `https://api.blocknative.com/gasprices/blockprices`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: '44352ff7-890f-4334-a9e0-a9cfe0edd5cb',
    },
  }).subscribe((json) => console.log(json))
}
