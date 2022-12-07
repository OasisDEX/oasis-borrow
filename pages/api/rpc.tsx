import { withSentry } from '@sentry/nextjs'
import axios, { AxiosResponse } from 'axios'
import * as ethers from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'

const threadId = Math.random()

const debug = true

type Counters = {
  lastLog: number
  clientId: string
  threadId: string
  requests: number
  startTime: number
  logTime: number
  sleepCount: number
  initialTotalPayloadSize: number
  dedupedTotalPayloadSize: number
  initialTotalCalls: number
  dedupedTotalCalls: number
  missingTotalCalls: number
  bypassedPayloadSize: number
  bypassedCallsCount: number
  targets: { [key: string]: number }
}

const counters: Counters = {
  lastLog: 0,
  clientId: '',
  threadId: '',
  requests: 0,
  sleepCount: 0,
  startTime: 0,
  logTime: 0,
  initialTotalPayloadSize: 0,
  dedupedTotalPayloadSize: 0,
  initialTotalCalls: 0,
  dedupedTotalCalls: 0,
  missingTotalCalls: 0,
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

const cache: Cache = {
  lastBlockNumberFetchTimestamp: 0,
  lastRecordedBlockNumber: 0,
  cachedResponses: {},
  persistentCache: {},
  locked: false,
  useCount: 0,
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
  counters.requests += 1
  const response = await axios.post(getRpcNode(network), calls)
  return response.data
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
  counters.initialTotalPayloadSize += JSON.stringify(req.body).length
  counters.startTime = counters.startTime || Date.now()
  counters.threadId = threadId.toString()

  const network = req.query.network.toString()
  const clientId = req.query.clientId.toString()

  const rpcNode = getRpcNode(network)
  const provider = new ethers.providers.JsonRpcProvider(rpcNode)

  if (Array.isArray(req.body) && req.body.every((call) => call.method === 'eth_call')) {
    const multicallAddress = getMulticall(network)
    const multicall = new ethers.Contract(multicallAddress, abi, provider)

    const calls = req.body
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

    await sleepUntill(() => !cache.locked, 100)

    try {
      cache.useCount++
      const missingCalls = dedupedCalls.filter((x) => !cache.cachedResponses[x.hash])

      const missingCallsIndexes = dedupedCalls
        .map((call) => call.hash)
        .map((x) => missingCalls.map((x) => x.hash).indexOf(x))

      const multicallTx = await multicall.populateTransaction.aggregate(
        missingCalls.map((call) => call.call),
      )

      counters.dedupedTotalCalls += dedupedCalls.length
      counters.missingTotalCalls += missingCalls.length

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

      counters.requests += 1
      const multicallResponse = await axios.post<string, AxiosResponse<{ result: string }>>(
        provider.connection.url,
        callBody,
        config,
      )
      const [, data] = multicall.interface.decodeFunctionResult(
        'aggregate((address,bytes)[])',
        multicallResponse.data.result,
      )
      const callsWithResponses: CallWithHashAndResponse[] = callsWithHash.map((x, index) => {
        if (cache.cachedResponses[x.hash] === undefined) {
          if (missingCallsIndexes[mappedCalls[index]] === -1) {
            throw new Error('Missing call index not found') //This means that cache do not work properly
          }
          cache.cachedResponses[x.hash] = data[missingCallsIndexes[mappedCalls[index]]]
          return {
            ...x,
            response: data[missingCallsIndexes[mappedCalls[index]]],
          }
        } else {
          return {
            ...x,
            response: cache.cachedResponses[x.hash],
          }
        }
      })

      finalResponse = req.body.map((entry, index) => ({
        id: entry.id,
        jsonrpc: entry.jsonrpc,
        result: callsWithResponses[index].response,
      }))
    } catch (error) {
      let errMsg
      if (error instanceof Error) errMsg = error.message
      else errMsg = JSON.stringify(error)
      console.log(errMsg)

      counters.bypassedPayloadSize += JSON.stringify(req.body).length
      console.log('RPC call failed, falling back to individual calls')
      finalResponse = await makeCall(req.query.network.toString(), req.body)
    } finally {
      cache.useCount--
    }
  } else {
    if (Array.isArray(req.body)) {
      const callsCount = req.body.filter((call) => call.method === 'eth_call').length
      const notCallsCount = req.body.filter((call) => call.method !== 'eth_call').length
      finalResponse = await makeCall(req.query.network.toString(), req.body)
      if (debug) console.log('RPC no batching of Array, falling back to individual calls')
      console.log(JSON.stringify({ callsCount, notCallsCount, ...counters }))
    } else {
      if (debug) console.log('RPC no batching, falling back to individual calls')
      if (isBlockNumberRequest(req.body)) {
        if (
          Date.now() - cache.lastBlockNumberFetchTimestamp > blockRecheckDelay &&
          cache.locked === false
        ) {
          cache.locked = true
          await sleepUntill(() => cache.useCount === 0, 100)
          const result = await makeCall(req.query.network.toString(), [req.body])
          cache.lastRecordedBlockNumber = parseInt(result[0].result, 16)
          cache.cachedResponses = {}
          cache.locked = false
          return res.status(200).send([
            {
              id: req.body.id,
              jsonrpc: req.body.jsonrpc,
              result: result[0].result,
            },
          ])
        } else {
          return res.status(200).send([
            {
              id: req.body.id,
              jsonrpc: req.body.jsonrpc,
              result: cache.lastRecordedBlockNumber.toString(),
            },
          ])
        }
      } else {
        if (isCodeRequest(req.body)) {
          if (cache.persistentCache[req.body.params[0]]) {
            if (debug) console.log('Contract code from cache', req.body.params[0])
            return res.status(200).send([
              {
                id: req.body.id,
                jsonrpc: req.body.jsonrpc,
                result: cache.persistentCache[req.body.params[0]],
              },
            ])
          } else {
            if (debug) console.log('Fetching contract code', req.body.params[0])
            counters.requests += 1
            const result = await makeCall(req.query.network.toString(), [req.body])
            cache.persistentCache[req.body.params[0]] = result[0].result
            return res.status(200).send([
              {
                id: req.body.id,
                jsonrpc: req.body.jsonrpc,
                result: result[0].result,
              },
            ])
          }
        } else {
          counters.bypassedCallsCount += 1
          counters.bypassedPayloadSize += JSON.stringify(req.body).length
          counters.requests += 1
          finalResponse = await makeCall(req.query.network.toString(), req.body)
        }
      }
    }
  }

  counters.logTime = Date.now()
  if (counters.lastLog < Date.now() - 1000 * 60) {
    //every minute
    counters.lastLog = Date.now()
    console.log(JSON.stringify(counters))
  }

  return res.status(200).send(finalResponse)
}

export default withSentry(rpc)
async function sleepUntill(check: () => boolean, maxCount: number) {
  return new Promise((res, rej) => {
    if (!check()) {
      try {
        counters.sleepCount++
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

function isBlockNumberRequest(body: any) {
  return body.method === 'eth_blockNumber'
}

function isCodeRequest(body: any) {
  return body.method === 'eth_getCode'
}
