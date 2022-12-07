import { withSentry } from '@sentry/nextjs'
import axios, { AxiosResponse } from 'axios'
import * as ethers from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'

const threadId = Math.random()

const counters = {
  clientId: '',
  startTime: 0,
  logTime: 0,
  initialTotalPayloadSize: 0,
  dedupedTotalPayloadSize: 0,
  initialTotalCalls: 0,
  dedupedTotalCalls: 0,
  bypassedPayloadSize: 0,
  bypassedCallsCount: 0,
}

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

function getMulticall(network: string) {
  switch (network) {
    case 'mainnet':
      return `0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696`
    case 'goerli':
      return `0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e`
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
  counters.initialTotalPayloadSize += JSON.stringify(req.body).length
  counters.startTime = counters.startTime || Date.now()
  if (Array.isArray(req.body) && req.body.every((call) => call.method === 'eth_call')) {
    const network = req.query.network.toString()
    const clientId = req.query.clientId.toString()

    const rpcNode = getRpcNode(network)
    const provider = new ethers.providers.JsonRpcProvider(rpcNode)
    const multicallAddress = getMulticall(network)
    const multicall = new ethers.Contract(multicallAddress, abi, provider)

    const calls = req.body
      .map((rpcCall: any) => rpcCall.params)
      .map((params: any) => [params[0].to, params[0].data])

    if (calls.length === 0) {
      return
    }

    counters.initialTotalCalls += calls.length
    counters.clientId = clientId

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

    counters.dedupedTotalCalls += dedupedCalls.length

    try {
      const callBody = `{"jsonrpc":"2.0","id":${req.body[0].id},"method":"eth_call","params":[{"data":"${multicallTx.data}","to":"${multicall.address}"},"latest"]}`
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Connection: 'keep-alive',
          'Content-Encoding': 'gzip, deflate, br',
          'Content-Length': callBody.length.toString(),
        },
      }

      counters.dedupedTotalPayloadSize += callBody.length

      const multicallResponse = await axios.post<string, AxiosResponse<{ result: string }>>(
        provider.connection.url,
        callBody,
        config,
      )
      const [, data] = multicall.interface.decodeFunctionResult(
        'aggregate((address,bytes)[])',
        multicallResponse.data.result,
      )
      finalResponse = req.body.map((entry, index) => ({
        id: entry.id,
        jsonrpc: entry.jsonrpc,
        result: data[index],
      }))
      finalResponse = mappedCalls!.map((call) => (call = finalResponse[call]))
    } catch {
      counters.bypassedPayloadSize += JSON.stringify(req.body).length
      console.log('RPC call failed, falling back to individual calls')
      finalResponse = await makeCall(req.query.network.toString(), req.body)
    }
  } else {
    if (Array.isArray(req.body)) {
      const callsCount = req.body.filter((call) => call.method === 'eth_call').length
      const notCallsCount = req.body.filter((call) => call.method !== 'eth_call').length
      console.log('RPC no batching, falling back to individual calls', callsCount, notCallsCount)
    } else {
      console.log('RPC no batching, falling back to individual calls')
    }
    counters.bypassedCallsCount += req.body.length
    counters.bypassedPayloadSize += JSON.stringify(req.body).length
    finalResponse = await makeCall(req.query.network.toString(), req.body)
  }

  counters.logTime = Date.now()
  console.log('RPC STATS', JSON.stringify(counters), threadId)

  return res.status(200).send(finalResponse)
}

export default withSentry(rpc)
