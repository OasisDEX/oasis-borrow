import { withSentry } from "@sentry/nextjs";
import axios from 'axios'
import * as ethers from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'

const RPC = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`

function getRpcNode(network: string) {
  switch (network) {
    case 'mainnet':
      return `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    default:
      throw new Error('unsupported network')
  }
}

function getMultiCallAddress(network: string) {
  switch (network) {
    case 'mainnet':
      return `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    default:
      throw new Error('unsupported network')
  }
}

const abi = [{
  inputs: [
    {
      components: [
        { internalType: "address", name: "target", type: "address" },
        { internalType: "bytes", name: "callData", type: "bytes" }
      ],
      internalType: "struct Multicall2.Call[]",
      name: "calls",
      type: "tuple[]"
    }
  ],
  name: "aggregate",
  outputs: [
    { internalType: "uint256", name: "blockNumber", type: "uint256" },
    { internalType: "bytes[]", name: "returnData", type: "bytes[]" }
  ],
  stateMutability: "nonpayable",
  type: "function"
}]

let savedCalls = 0
let callsDid = 0

async function makeCall(network: string, calls: any[]) {
  const response = await axios.post(getRpcNode(network), calls)
  callsDid += 1
  return response.data
}
export async function rpc(req: NextApiRequest, res: NextApiResponse) {
  let finalResponse
  if (process.env.ENABLE_MULTICALL && Array.isArray(req.body) && req.body.every(call => call.method === 'eth_call')) {
    const rpcNode = getRpcNode(req.query.network.toString())
    const provider = new ethers.providers.JsonRpcProvider(rpcNode)
    const multicall = new ethers.Contract('0x5ba1e12693dc8f9c48aad8770482f4739beed696', abi, provider)

    const calls = req.body
      .map((rpcCall: any) => rpcCall.params)
      .map((params: any) => [params[0].to, params[0].data])

    const multicallTx = await multicall.populateTransaction.aggregate(calls)
    try {
      const multicallResponse = await provider.call(multicallTx)
      callsDid += 1
      const [, data] = multicall.interface.decodeFunctionResult(
        "aggregate((address,bytes)[])",
        multicallResponse
      );

      finalResponse = req.body.map((entry, index) => ({
        id: entry.id,
        jsonrpc: entry.jsonrpc,
        result: data[index]
      }))

      savedCalls += req.body.length
    } catch {
      finalResponse = await makeCall(req.query.network.toString(), req.body)
    }
  } else {
    finalResponse = await makeCall(req.query.network.toString(), req.body)
  }

  console.log(`Total calls did: ${callsDid}, batched calls: ${savedCalls}`)
  return res.status(200).send(finalResponse)
}

export default withSentry(rpc)
