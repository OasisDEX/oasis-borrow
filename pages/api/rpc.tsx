import { withSentry } from '@sentry/nextjs'
import axios from 'axios'
import * as ethers from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'

const threadId = Math.floor(Math.random() * 1000000)

const debug = true

const withCache = false

type Counters = {
  clientIds: { [key: string]: number }
  threadId: number
  requests: number
  startTime: number
  logTime: number
  sleepCount: number
  initialTotalPayloadSize: number
  dedupedTotalPayloadSize: number
  initialTotalCalls: number
  dedupedTotalCalls: number
  totalPayloadSize: number
  totalCalls: number
  missingTotalCalls: number
  bypassedPayloadSize: number
  bypassedCallsCount: number
  targets: { [key: string]: number }
}

const counters: Counters = {
  clientIds: {},
  threadId: 0,
  requests: 0,
  sleepCount: 0,
  startTime: 0,
  logTime: 0,
  initialTotalPayloadSize: 0,
  dedupedTotalPayloadSize: 0,
  initialTotalCalls: 0,
  dedupedTotalCalls: 0,
  missingTotalCalls: 0,
  totalPayloadSize: 0,
  totalCalls: 0,
  bypassedPayloadSize: 0,
  bypassedCallsCount: 0,
  targets: {},
}

type Cache = {
  lastBlockNumberFetchTimestamp: number
  lastRecordedBlockNumber: number
  cachedResponses: { [key: string]: any }
  persistentCache: { [key: string]: any }
  locked: boolean
  useCount: number
}

const blockRecheckDelay = 3000

const cache: { [key: string]: Cache } = {}

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
function getSpotAddress(network: string) {
  switch (network) {
    case 'mainnet':
      return `0x65C79fcB50Ca1594B025960e539eD7A9a6D434A3`
    case 'goerli':
      return `0xACe2A9106ec175bd56ec05C9E38FE1FDa8a1d758`
    default:
      throw new Error('unsupported network')
  }
}
function getMulticall(network: string) {
  switch (network) {
    case 'mainnet':
      return `0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696`
    case 'goerli':
      return `0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696`
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

async function makeCall(network: string, calls: any[]) {
  const callsLength = JSON.stringify(calls).length
  let config = {
    headers: {
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
      // 'Content-Encoding': 'gzip, br',
      'Content-Length': '',
    },
  }
  counters.totalPayloadSize += callsLength
  counters.totalCalls += calls.length
  counters.requests += 1

  if (calls.length === 1) {
    config = {
      headers: {
        ...config.headers,
        'Content-Length': JSON.stringify(calls[0]).length.toString(),
      },
    }
    const response = await axios.post(getRpcNode(network), JSON.stringify(calls[0]), config)
    return [response.data]
  } else {
    config = {
      headers: {
        ...config.headers,
        'Content-Length': callsLength.toString(),
      },
    }
    const response = await axios.post(getRpcNode(network), calls, config)
    return response.data
  }
}

interface CallWithHash {
  hash: string
  call: any
}

interface CallWithHashAndResponse extends CallWithHash {
  response: any
}

export async function rpc(req: NextApiRequest, res: NextApiResponse) {
  let finalResponse: any[] = []
  let mappedCalls: any[] = []
  const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  counters.initialTotalPayloadSize += JSON.stringify(requestBody).length
  counters.startTime = counters.startTime || Date.now()
  counters.threadId = threadId

  const network = req.query.network.toString()
  const clientId = req.query.clientId.toString()
  //withCache = req.query.withCache.toString() === "true"

  if (debug && !withCache) {
    console.log('no cache')
  }

  if (!cache[network]) {
    cache[network] = {
      lastBlockNumberFetchTimestamp: 0,
      lastRecordedBlockNumber: 0,
      cachedResponses: {},
      persistentCache: {},
      locked: false,
      useCount: 0,
    }
  }
  if (Array.isArray(requestBody) && requestBody.every((call) => call.method === 'eth_call')) {
    const multicallAddress = getMulticall(network)
    const multicall = new ethers.Contract(multicallAddress, abi)

    const calls = requestBody
      .map((rpcCall: any) => rpcCall.params)
      .map((params: any) => [params[0].to, params[0].data])

    if (calls.length === 0) {
      return
    }

    calls.map((call) =>
      counters.targets[call[0]] === undefined
        ? (counters.targets[call[0]] = 1)
        : counters.targets[call[0]]++,
    )

    counters.initialTotalCalls += calls.length

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

    if (withCache) {
      await sleepUntill(() => !cache[network].locked, 100, 'cache[network].locked')
    }

    try {
      if (withCache) {
        cache[network].useCount++
      }
      const missingCalls = dedupedCalls.filter(
        (x) => !cache[network].cachedResponses[x.hash] || !withCache,
      )

      const missingCallsIndexes = dedupedCalls
        .map((call) => call.hash)
        .map((x) => missingCalls.map((x) => x.hash).indexOf(x))

      const multicallTx = await multicall.populateTransaction.tryAggregate(
        false,
        missingCalls.map((call) => call.call),
      )

      counters.dedupedTotalCalls += dedupedCalls.length
      counters.missingTotalCalls += missingCalls.length
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

      counters.totalCalls += 1
      counters.requests += 1
      counters.totalPayloadSize += JSON.stringify(callBody).length

      counters.dedupedTotalPayloadSize += JSON.stringify(callBody).length
      const multicallResponse = await makeCall(network, [callBody])

      counters.clientIds[clientId] = (counters.clientIds[clientId] || 0) + 1
      if (multicallResponse[0].error) {
        throw new Error(multicallResponse[0].error.message)
      }

      const [dataFromMulticall] = multicall.interface.decodeFunctionResult(
        'tryAggregate(bool,(address,bytes)[])',
        multicallResponse[0].result,
      )

      const spotAddress = getSpotAddress(network)
      const multicallFailedCalls = missingCalls.filter(
        (x: any, i: number) => dataFromMulticall[i][0] === false,
      )

      let data: any[]
      if (multicallFailedCalls.length !== 0) {
        const failedMultiCallsRepsonse = await makeCall(
          network,
          multicallFailedCalls.map((x, i) => {
            return {
              jsonrpc: '2.0',
              id: +requestBody[0].id + i,
              method: 'eth_call',
              params: [
                {
                  data: x.call[1],
                  to: x.call[0],
                  from: spotAddress,
                },
                'latest',
              ],
            }
          }),
        )
        let z = 0
        data = dataFromMulticall.map((x: [boolean, string]) => {
          if (x[0] === false) {
            return failedMultiCallsRepsonse[z++].result
          } else {
            return x[1]
          }
        })
      } else {
        data = dataFromMulticall.map((x: [boolean, string]) => x[1])
      }
      const callsWithResponses: CallWithHashAndResponse[] = callsWithHash.map((x, index) => {
        if (cache[network].cachedResponses[x.hash] === undefined || !withCache) {
          if (missingCallsIndexes[mappedCalls[index]] === -1) {
            throw new Error('Missing call index not found') //This means that cache do not work properly
          }

          if (withCache)
            cache[network].cachedResponses[x.hash] = data[missingCallsIndexes[mappedCalls[index]]]

          return {
            ...x,
            response: data[missingCallsIndexes[mappedCalls[index]]],
          }
        } else {
          return {
            ...x,
            response: cache[network].cachedResponses[x.hash],
          }
        }
      })

      finalResponse = requestBody.map((entry, index) => ({
        id: entry.id,
        jsonrpc: entry.jsonrpc,
        result: callsWithResponses[index].response,
      }))
      if (withCache) {
        cache[network].useCount--
      }
    } catch (error) {
      if (withCache) {
        cache[network].useCount--
      }
      let errMsg
      let errStack
      if (error instanceof Error) errMsg = error.message
      else errMsg = JSON.stringify(error)
      if (error instanceof Error) errStack = error.stack
      console.log(errMsg)
      console.log(errStack)

      counters.bypassedPayloadSize += JSON.stringify(requestBody).length
      counters.bypassedCallsCount += requestBody.length
      console.log('RPC call failed, falling back to individual calls')
      finalResponse = await makeCall(req.query.network.toString(), requestBody)
      counters.clientIds[clientId] = (counters.clientIds[clientId] || 0) + 1
      console.log('RPC call failed, fallback successful')
      console.log(JSON.stringify(counters))
    }
  } else {
    if (Array.isArray(requestBody)) {
      const callsCount = requestBody.filter((call) => call.method === 'eth_call').length
      const notCallsCount = requestBody.filter((call) => call.method !== 'eth_call').length
      finalResponse = await makeCall(req.query.network.toString(), requestBody)
      counters.clientIds[clientId] = (counters.clientIds[clientId] || 0) + 1
      counters.initialTotalCalls += callsCount + notCallsCount
      if (debug) console.log('RPC no batching of Array, falling back to individual calls')
      console.log(JSON.stringify({ callsCount, notCallsCount, ...counters }))
    } else {
      counters.initialTotalCalls++
      if (debug) console.log('RPC no batching, falling back to individual calls')
      if (isBlockNumberRequest(requestBody)) {
        if (
          (Date.now() - cache[network].lastBlockNumberFetchTimestamp > blockRecheckDelay ||
            !withCache) &&
          (cache[network].locked === false || !withCache)
        ) {
          try {
            if (withCache) {
              cache[network].locked = true
              await sleepUntill(
                () => cache[network].useCount === 0,
                100,
                'cache[network].useCount === 0',
              )
            }

            const result = await makeCall(req.query.network.toString(), [requestBody])
            counters.clientIds[clientId] = (counters.clientIds[clientId] || 0) + 1
            if (withCache) {
              cache[network].lastRecordedBlockNumber = parseInt(result[0].result, 16)
              cache[network].lastBlockNumberFetchTimestamp = Date.now()
              cache[network].cachedResponses = {}
              cache[network].locked = false
            }
            return res.status(200).send({
              id: requestBody.id,
              jsonrpc: requestBody.jsonrpc,
              result: result[0].result,
            })
          } catch (e) {
            cache[network].locked = false
            console.log(e)
            return res.status(500).send({ error: e, message: 'Error while fetching block number' })
          }
        } else {
          if (debug && cache[network].locked)
            console.log('ERROR Block number from cache due to lock')

          return res.status(200).send({
            id: requestBody.id,
            jsonrpc: requestBody.jsonrpc,
            result: '0x' + cache[network].lastRecordedBlockNumber.toString(16),
          })
        }
      } else {
        if (isCodeRequest(requestBody)) {
          let result: any
          if (cache[network].persistentCache[requestBody.params[0]] && withCache) {
            if (debug) console.log('Contract code from cache', requestBody.params[0])
          } else {
            if (debug) console.log('Fetching contract code', requestBody.params[0])
            result = await makeCall(req.query.network.toString(), [requestBody])
            counters.clientIds[clientId] = (counters.clientIds[clientId] || 0) + 1
            if (withCache) cache[network].persistentCache[requestBody.params[0]] = result[0].result
          }
          return res.status(200).send({
            id: requestBody.id,
            jsonrpc: requestBody.jsonrpc,
            result: withCache
              ? cache[network].persistentCache[requestBody.params[0]]
              : result[0].result,
          })
        } else {
          counters.bypassedCallsCount += 1
          counters.bypassedPayloadSize += JSON.stringify(requestBody).length
          finalResponse = await makeCall(req.query.network.toString(), [requestBody])
          if (Array.isArray(finalResponse) && finalResponse.length === 1) {
            finalResponse = finalResponse[0]
          }
          counters.clientIds[clientId] = (counters.clientIds[clientId] || 0) + 1
        }
      }
    }
  }

  if (counters.logTime < Date.now() - 1000 * 60) {
    //every minute
    counters.logTime = Date.now()
    console.log(JSON.stringify(counters))
    counters.clientIds = {}
  }

  return res.status(200).send(finalResponse)
}

export default withSentry(rpc)
async function sleepUntill(check: () => boolean, maxCount: number, message: string) {
  return new Promise((res, rej) => {
    if (!check()) {
      try {
        counters.sleepCount++
        console.log(`Sleeping on ${message} ... current count: ${maxCount}`)
        console.log(JSON.stringify({ sleep: true, ...counters }))
        const interval = setInterval(() => {
          maxCount--
          if (maxCount === 0) {
            clearInterval(interval)
            rej(new Error('Max count reached'))
          }
          if (check()) {
            clearInterval(interval)
            res(true)
          }
        }, 50)
      } catch (e) {
        rej(e)
      }
    } else {
      res(true)
    }
  })
}

function isBlockNumberRequest(_body: any) {
  return false //body.method === 'eth_blockNumber'
}

function isCodeRequest(_body: any) {
  return false //body.method === 'eth_getCode'
}
