import { expect } from 'chai'
import sinon from 'sinon'

import { BatchManager, Request } from './BatchManager'

const mockConstructorProps = {
  url: 'https://www.goingnowhere.com',
  fetchJson: undefined,
}

describe('BatchManager', () => {
  let clock: sinon.SinonFakeTimers

  beforeEach(function () {
    clock = sinon.useFakeTimers()
  })

  afterEach(function () {
    clock.restore()
  })

  it('should batch call into single request', async () => {
    const mockBatch = createMockBatch()
    const mockFetchJson = sinon.stub().resolves([]) as any
    mockConstructorProps.fetchJson = mockFetchJson
    const batchManager = new BatchManager(mockConstructorProps.url, mockConstructorProps.fetchJson)
    await batchManager.batchCall(mockBatch)

    expect(mockFetchJson).to.have.been.calledWith(
      mockConstructorProps.url,
      JSON.stringify(mockBatch),
    )
  })

  it('should exclude cache hits', async () => {
    const mockBatch = createMockBatch()

    const mockFetchJson = sinon.stub().resolves(
      mockBatch.map(() => ({
        result: 'cached-result',
      })),
    ) as any
    mockConstructorProps.fetchJson = mockFetchJson

    const batchManager = new BatchManager(mockConstructorProps.url, mockConstructorProps.fetchJson)

    // First call
    await batchManager.batchCall(mockBatch)
    mockFetchJson.reset()

    // Second call
    await batchManager.batchCall(mockBatch)

    expect(mockFetchJson).to.not.have.been.called
  })

  it('should skip cache if cache ttl is exceeded between batches', async () => {
    const mockBatch = createMockBatch()

    const resolvesTo = mockBatch.map(() => ({
      result: 'cached-result',
    }))
    const mockFetchJson = sinon.stub().resolves(resolvesTo) as any
    mockFetchJson.onSecondCall().resolves(resolvesTo)
    mockConstructorProps.fetchJson = mockFetchJson

    const batchManager = new BatchManager(mockConstructorProps.url, mockConstructorProps.fetchJson)

    // First call
    await batchManager.batchCall(mockBatch)
    const defaultCacheTtlPlus100ms = 15100
    clock.tick(defaultCacheTtlPlus100ms)

    // Second call
    await batchManager.batchCall(mockBatch)

    expect(mockFetchJson).to.have.been.calledTwice
    expect(mockFetchJson.getCall(1)).to.have.been.calledWith(
      mockConstructorProps.url,
      JSON.stringify(mockBatch),
    )
    // // expect(mockFetchJson).to.have.been.call(
    //   mockConstructorProps.url,
    //   JSON.stringify(mockBatch),
    // )
  })
})

function createMockBatch(): Request[] {
  return [
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 209,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 210,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 211,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x0000000000085d4780b73119b644ae5ecd22b376',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 212,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xe41d2489571d322189246dafa5ebde1f4699f498',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 213,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 214,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 215,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 216,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 217,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xc00e94cb662c3520282e6f5717214004a7f26888',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 218,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 219,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x514910771af9ca656af840dff83e8264ecf986ca',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 220,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xba100000625a3754423978a60c9317c58a424e3d',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 221,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 222,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 223,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 224,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 225,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 226,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 227,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 228,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 229,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 230,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 231,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 232,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 233,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 234,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xd3d2e2692501a5c9ca623199d38826e513033a17',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 235,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x231b7589426ffe1b75405526fc32ac09d44364c4',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 236,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 237,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xb20bd5d04be54f870d5c0d3ca85d82b34b836405',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 238,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0xabddafb225e10b90d798bb8a886238fb835e2053',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 239,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x50379f632ca68d36e50cfbc8f78fe16bd1499d1e',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 240,
      jsonrpc: '2.0',
    },
    {
      method: 'eth_call',
      params: [
        {
          from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          data: '0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          to: '0x06325440d014e39736583c165c2963ba99faf14e',
        },
        'latest',
      ],
      network: {
        chainId: 2137,
        name: 'unknown',
      },
      id: 241,
      jsonrpc: '2.0',
    },
  ]
}
