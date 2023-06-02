import { NetworkNames } from 'blockchain/networks'
import * as ethers from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'

function getRpcNode(network: NetworkNames): string | undefined {
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

async function makeCall(rpcEndpoint: string, calls: any[]) {
  const callsLength = JSON.stringify(calls).length
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
      // 'Content-Encoding': 'gzip, br',
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
  requestBody: any[],
  rpcEndpoint: string,
  network: NetworkNames,
) {
  const calls = requestBody
    .map((rpcCall: any) => rpcCall.params)
    .map((params: any) => [params[0].to, params[0].data])

  const multicall = new ethers.Contract(multicallAddress, abi)
  const multicallTx = await multicall.populateTransaction.tryAggregate(false, calls)

  const callBody = {
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
      network,
      multicallFailedCalls.map((x, i) => {
        return {
          jsonrpc: '2.0',
          id: +requestBody[0].id + i,
          method: 'eth_call',
          params: [
            {
              data: x[1],
              to: x[0],
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
    jsonrpc: entry.jsonrpc,
    result: data[index],
  }))
}

export async function rpc(req: NextApiRequest, res: NextApiResponse) {
  const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  const networkQuery = req.query.network

  if (!networkQuery) {
    return res.status(400).send({ error: 'Missing network query' })
  }

  const network = networkQuery.toString() as NetworkNames

  const rpcEndpoint = getRpcNode(network)
  if (!rpcEndpoint) {
    res.status(400).json({ error: `Invalid network: ${networkQuery.toString}` })
    return
  }

  const multicallAddress = getMulticall(network)

  if (
    Array.isArray(requestBody) &&
    requestBody.every((call) => call.method === 'eth_call') &&
    multicallAddress !== undefined
  ) {
    try {
      const result = await makeMulticall(multicallAddress, requestBody, rpcEndpoint, network)
      if (result === undefined) {
        const response = await makeCall(network, requestBody)
        return res.status(200).send(response)
      }
      return res.status(200).send(result)
    } catch (error) {
      console.warn('RPC multicall failed, falling back to individual calls', error)
    }
  }

  try {
    if (Array.isArray(requestBody)) {
      const response = await makeCall(rpcEndpoint, requestBody)
      return res.status(200).send(response)
    }

    const response = await makeCall(rpcEndpoint, [requestBody])
    if (Array.isArray(response) && response.length === 1) {
      return res.status(200).send(response[0])
    }

    return res.status(200).send(response)
  } catch (error) {
    console.error(`RPC call failed for network and body: ${rpcEndpoint}`, requestBody, error)
    return res.status(500).send({ error: `RPC call failed.` })
  }
}

export default rpc
