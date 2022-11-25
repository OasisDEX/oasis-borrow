import { withSentry } from '@sentry/nextjs'
import axios from 'axios'
import * as ethers from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'

function getRpcNode(network: string) {
  switch (network) {
    case 'mainnet':
      return `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case 'goerli':
      return `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    default:
      throw new Error('unsupported network')
  }
}

const abi = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall2.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate',
    outputs: [
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      { internalType: 'bytes[]', name: 'returnData', type: 'bytes[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

async function makeCall(network: string, calls: any[]) {
  const response = await axios.post(getRpcNode(network), calls)
  return response.data
}

interface CallWithHash {
  hash: string
  call: any
}

export async function rpc(req: NextApiRequest, res: NextApiResponse) {
  let finalResponse: any[] = []
  let mappedCalls: any[] = []
  if (Array.isArray(req.body) && req.body.every((call) => call.method === 'eth_call')) {
    const rpcNode = getRpcNode(req.query.network.toString())
    const provider = new ethers.providers.JsonRpcProvider(rpcNode)
    const multicall = new ethers.Contract(
      '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
      abi,
      provider,
    )

    const calls = req.body
      .map((rpcCall: any) => rpcCall.params)
      .map((params: any) => [params[0].to, params[0].data])

    if (calls.length === 0) {
      return
    }

    const callsWithHash: CallWithHash[] = calls.map((call) => {
      return {
        call,
        hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${call[0]}${call[1]}`)),
      }
    })

    const dedupedCalls = callsWithHash.filter(
      (call, index) => callsWithHash.map((call) => call.hash).indexOf(call.hash) === index,
    )

    mappedCalls = callsWithHash.map((item) =>
      dedupedCalls.map((call) => call.hash).indexOf(item.hash),
    )

    const multicallTx = await multicall.populateTransaction.aggregate(
      dedupedCalls.map((call) => call.call),
    )
    try {
      const multicallResponse = await provider.call(multicallTx)

      const [, data] = multicall.interface.decodeFunctionResult(
        'aggregate((address,bytes)[])',
        multicallResponse,
      )

      finalResponse = req.body.map((entry, index) => ({
        id: entry.id,
        jsonrpc: entry.jsonrpc,
        result: data[index],
      }))
      finalResponse = mappedCalls!.map((call) => (call = finalResponse[call]))
    } catch {
      finalResponse = await makeCall(req.query.network.toString(), req.body)
    }
  } else {
    finalResponse = await makeCall(req.query.network.toString(), req.body)
  }

  return res.status(200).send(finalResponse)
}

export default withSentry(rpc)
