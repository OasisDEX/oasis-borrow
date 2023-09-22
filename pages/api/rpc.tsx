import { NetworkNames } from 'blockchain/networks'
import * as ethers from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'

export function getRpcNode(network: NetworkNames): string | undefined {
  switch (network) {
    // case 'hardhat': // hardhat does not request this one
    case NetworkNames.ethereumMainnet:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.ethereumGoerli:
      return `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.arbitrumMainnet:
      return !['', undefined].includes(process.env.ARBITRUM_MAINNET_RPC_URL)
        ? `${process.env.ARBITRUM_MAINNET_RPC_URL}`
        : `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.arbitrumGoerli:
      return `https://arbitrum-goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.polygonMainnet:
      return `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.polygonMumbai:
      return `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.optimismMainnet:
      return !['', undefined].includes(process.env.OPTIMISM_MAINNET_RPC_URL)
        ? `${process.env.OPTIMISM_MAINNET_RPC_URL}`
        : `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.optimismGoerli:
      return `https://optimism-goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    default:
      console.warn(`Network: ${network} does not have defined a rpc node. Returning BadRequest`)
      return undefined
  }
}
function getSpotAddress(network: NetworkNames): string | undefined {
  switch (network) {
    case NetworkNames.ethereumMainnet:
      return `0x65C79fcB50Ca1594B025960e539eD7A9a6D434A3`
    case NetworkNames.ethereumGoerli:
      return `0xACe2A9106ec175bd56ec05C9E38FE1FDa8a1d758`
    default:
      console.warn(`Network: ${network} does not have a spot contract`)
      return undefined
  }
}
function getMulticall(network: NetworkNames): string | undefined {
  switch (network) {
    case NetworkNames.ethereumMainnet:
      return `0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696`
    case NetworkNames.ethereumGoerli:
      return `0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696`
    case NetworkNames.arbitrumGoerli:
    case NetworkNames.arbitrumMainnet:
    case NetworkNames.optimismMainnet:
    case NetworkNames.optimismGoerli:
      return '0xcA11bde05977b3631167028862bE2a173976CA11' //https://github.com/mds1/multicall
    default:
      console.warn(`Network: ${network} does not have a multicall contract`)
      return undefined
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
  {
    inputs: [
      { internalType: 'bool', name: 'requireSuccess', type: 'bool' },
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
    name: 'tryAggregate',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'returnData', type: 'bytes' },
        ],
        internalType: 'struct Multicall2.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

async function makeCall(rpcEndpoint: string, calls: RpcCall[]) {
  const callsLength = JSON.stringify(calls).length
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
      'Content-Length': '',
    },
  }

  if (calls.length === 1) {
    const request = new Request(rpcEndpoint, {
      method: 'POST',
      body: JSON.stringify(calls[0]),
      headers: {
        ...config.headers,
        'Content-Length': JSON.stringify(calls[0]).length.toString(),
      },
    })

    const response = await fetch(request)
    const json = await response.json()
    return [json]
  } else {
    const request = new Request(rpcEndpoint, {
      method: 'POST',
      body: JSON.stringify(calls),
      headers: {
        ...config.headers,
        'Content-Length': callsLength.toString(),
      },
    })

    const response = await fetch(request)
    return await response.json()
  }
}

async function makeMulticall(
  multicallAddress: string,
  requestBody: RpcCall[],
  rpcEndpoint: string,
  network: NetworkNames,
): Promise<RpcResponse[] | undefined> {
  const calls = requestBody
    .map((rpcCall) => rpcCall.params)
    .map((params) => [params[0].to, params[0].data])

  const multicall = new ethers.Contract(multicallAddress, abi)
  const multicallTx = await multicall.populateTransaction.tryAggregate(false, calls)

  const callBody: RpcCall = {
    jsonrpc: '2.0',
    id: requestBody[0].id,
    method: 'eth_call',
    params: [
      {
        data: multicallTx.data,
        to: multicall.address,
      },
      'latest',
    ],
  }

  const multicallResponse = await makeCall(rpcEndpoint, [callBody])

  if (multicallResponse[0].error) {
    console.warn(`Multicall error. Switch to single calls. Error`, multicallResponse[0].error)
    return undefined
  }

  const [dataFromMulticall] = multicall.interface.decodeFunctionResult(
    'tryAggregate(bool,(address,bytes)[])',
    multicallResponse[0].result,
  )

  const spotAddress = getSpotAddress(network)
  const multicallFailedCalls = calls.filter(
    (x: any, i: number) => dataFromMulticall[i][0] === false,
  )

  let data: any[]
  if (multicallFailedCalls.length !== 0) {
    const failedMultiCallsResponse = await makeCall(
      rpcEndpoint,
      multicallFailedCalls.map(([to, data], i) => {
        return {
          jsonrpc: '2.0',
          id: +requestBody[0].id + i,
          method: 'eth_call',
          params: [
            {
              data: data,
              to: to!,
              from: spotAddress,
            },
            'latest',
          ],
        }
      }),
    )
    let z = 0
    data = dataFromMulticall.map((x: [boolean, string]) => {
      if (!x[0]) {
        return failedMultiCallsResponse[z++].result
      } else {
        return x[1]
      }
    })
  } else {
    data = dataFromMulticall.map((x: [boolean, string]) => x[1])
  }

  return requestBody.map((entry, index) => ({
    id: entry.id,
    jsonrpc: '2.0',
    result: data[index],
  }))
}

type RpcCallParam = unknown & {
  to: string
  data: string | undefined
}

type RpcCall = {
  method: string
  params: [RpcCallParam, unknown]
  id: number
  jsonrpc: '2.0'
}

type CallWithHash = {
  hash: string
  call: RpcCall
}

type RpcResponse = {
  id: number
  jsonrpc: '2.0'
  result: string
}

interface CallWithHashAndResponse extends CallWithHash {
  response: RpcResponse
}

function isValidBody<T extends Record<string, unknown>>(body: any, fields: (keyof T)[]): body is T {
  return Object.keys(body).every((key) => fields.includes(key))
}

export async function rpc(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  const isBatch = Array.isArray(requestBody)

  const calls: RpcCall[] = []

  if (isBatch) {
    requestBody
      .filter((call) => isValidBody<RpcCall>(call, ['method', 'params', 'id', 'jsonrpc']))
      .forEach((call) => {
        calls.push(call)
      })
  } else {
    if (isValidBody<RpcCall>(requestBody, ['method', 'params', 'id', 'jsonrpc'])) {
      calls.push(requestBody)
    }
  }

  if (calls.length === 0) {
    res.status(400).send({ error: 'Invalid request body' })
    return
  }

  const networkQuery = req.query.network

  if (!networkQuery) {
    res.status(400).send({ error: 'Missing network query' })
    return
  }

  const network = networkQuery.toString() as NetworkNames

  const rpcEndpoint = getRpcNode(network)
  if (!rpcEndpoint) {
    res.status(400).json({ error: `Invalid network: ${networkQuery.toString}` })
    return
  }

  const callsWithHash: CallWithHash[] = calls.map((call) => {
    return {
      call: call,
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${JSON.stringify(call.params)}`)),
    }
  })

  const dedupedCalls = callsWithHash.filter(
    (call, index) => callsWithHash.map((call) => call.hash).indexOf(call.hash) === index,
  )

  const mappedCalls = callsWithHash.map((item) =>
    dedupedCalls.map((call) => call.hash).indexOf(item.hash),
  )

  const missingCallsIndexes = dedupedCalls
    .map((call) => call.hash)
    .map((x) => dedupedCalls.map((x) => x.hash).indexOf(x))

  const multicallAddress = getMulticall(network)

  if (calls.every((call) => call.method === 'eth_call') && multicallAddress !== undefined) {
    try {
      const result = await makeMulticall(
        multicallAddress,
        dedupedCalls.map((c) => c.call),
        rpcEndpoint,
        network,
      )
      if (result === undefined) {
        const response = await makeCall(rpcEndpoint, requestBody)
        return res.status(200).send(response)
      }
      const mappedResult: CallWithHashAndResponse[] = callsWithHash.map((call, index) => {
        return {
          ...call,
          response: result[missingCallsIndexes[mappedCalls[index]]],
        }
      })

      const response: RpcResponse[] = calls.map((entry, index) => ({
        id: entry.id,
        jsonrpc: entry.jsonrpc,
        result: mappedResult[index].response.result,
      }))

      return res.status(200).send(response)
    } catch (error) {
      console.warn('RPC multicall failed, falling back to individual calls', error)
    }
  }

  try {
    const response = await makeCall(rpcEndpoint, requestBody)

    return res.status(200).send(response)
  } catch (error) {
    console.error(`RPC call failed for network and body: ${rpcEndpoint}`, requestBody, error)
    return res.status(500).send({ error: `RPC call failed.` })
  }
}

export default rpc
