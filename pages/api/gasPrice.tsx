import { json } from 'body-parser';
import { NextApiRequest, NextApiResponse } from 'next'
import { ajax } from 'rxjs/ajax'

export default async function (_req: NextApiRequest, res: NextApiResponse) {

  ajax({
    url: `https://api.blocknative.com/gasprices/blockprices`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '44352ff7-890f-4334-a9e0-a9cfe0edd5cb'
    },
  }).subscribe((json : any) => {
    console.log(json)
    console.log('aasdsad')
    res.status(200).json(json)
    return res
  },
  (error: any) => {
    console.log(error)
    console.log('4pud')
    res.status(200).json(error)
  }
  );

}
