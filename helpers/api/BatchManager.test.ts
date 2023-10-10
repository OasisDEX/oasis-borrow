import NodeCache from 'node-cache'

import type { Request } from './BatchManager'
import { BatchManager } from './BatchManager'

const mockConnection = 'https://www.goingnowhere.com'

describe('BatchManager', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should batch call into single request', async () => {
    const mockBatch = createMockBatch()
    const mockFetchJson = jest.fn(() => Promise.resolve([]))

    const batchManager = createBatchManager(mockFetchJson)
    await batchManager.batchCall(mockBatch)

    expect(mockFetchJson).toHaveBeenCalledTimes(1)
    expect(mockFetchJson).toHaveBeenCalledWith(mockConnection, JSON.stringify(mockBatch))
  })

  it('should exclude cache hits', async () => {
    const mockBatch = createMockBatch()
    const mockFetchJson = jest.fn().mockResolvedValue(
      mockBatch.map(() => ({
        result: 'cached-result',
      })),
    )

    const batchManager = createBatchManager(mockFetchJson)

    // First call
    await batchManager.batchCall(mockBatch)

    // Second call
    await batchManager.batchCall(mockBatch)

    expect(mockFetchJson).toHaveBeenCalledTimes(1)
  })

  it('should skip cache if cache ttl is exceeded between batches', async () => {
    const mockBatch = createMockBatch()
    const resolvesTo = mockBatch.map(() => ({
      result: 'cached-result',
    }))
    const mockFetchJson = jest.fn().mockResolvedValue(resolvesTo)

    const batchManager = createBatchManager(mockFetchJson)

    // First call
    await batchManager.batchCall(mockBatch)
    const defaultCacheTtlPlus100ms = 15100
    jest.advanceTimersByTime(defaultCacheTtlPlus100ms)

    // Second call
    await batchManager.batchCall(mockBatch)

    expect(mockFetchJson).toHaveBeenCalledTimes(2)
    expect(mockFetchJson).toHaveBeenLastCalledWith(mockConnection, JSON.stringify(mockBatch))
  })
  describe('ordering results', () => {
    it('should maintain request order when served 100% via cache', async () => {
      const mockBatch = createMockBatch()
      const fetchJsonMockResult = mockBatch.map((requestInsideBatch) => ({
        result: requestInsideBatch,
      }))
      const mockFetchJson = jest.fn(() => {
        return new Promise((resolve) => resolve(fetchJsonMockResult))
      })
      const batchManager = createBatchManager(mockFetchJson)

      // First call
      await batchManager.batchCall(mockBatch)

      // Second call (all from cache)
      const batchResults = await batchManager.batchCall(mockBatch)

      batchResults.forEach(function (result, index) {
        expect(result.requestIdx).toBe(index)
      })
      expect(batchResults.map((batchResult) => batchResult.data)).toEqual(mockBatch)
    })

    it('should maintain the request order when all requests skip cache', async () => {
      const mockBatch = createMockBatch()
      const fetchJsonMockResult = mockBatch.map((requestInsideBatch) => ({
        result: requestInsideBatch,
      }))
      const mockFetchJson = jest.fn(() => new Promise((resolve) => resolve(fetchJsonMockResult)))
      const batchManager = createBatchManager(mockFetchJson)

      // ACT
      const batchResults = await batchManager.batchCall(mockBatch)

      // ASSERT
      batchResults.forEach(function (result, index) {
        expect(result.requestIdx).toBe(index)
      })
      expect(batchResults.map((batchResult) => batchResult.data)).toEqual(mockBatch)
    })

    // TODO: [Mocha -> Jest] Rewrite in Jest compatible format.
    it.skip('should maintain request order when served partially <100% by the cache', async () => {
      // ARRANGE

      const firstBatch = createMockBatch(0, 3)
      const secondBatch = createMockBatch(6, 9)
      const thirdBatch = createMockBatch(3, 6)

      const mockFetchJson = jest
        .fn()
        .mockResolvedValueOnce(
          firstBatch.map((requestInsideBatch) => {
            return new Promise((resolve) => resolve({ result: requestInsideBatch }))
          }),
        )
        .mockResolvedValueOnce(
          secondBatch.map((requestInsideBatch) => {
            return new Promise((resolve) => resolve({ result: requestInsideBatch }))
          }),
        )
        .mockResolvedValueOnce(
          thirdBatch.map((requestInsideBatch) => {
            return new Promise((resolve) => resolve({ result: requestInsideBatch }))
          }),
        )

      const batchManager = createBatchManager(mockFetchJson)

      await batchManager.batchCall(firstBatch)
      await batchManager.batchCall(secondBatch)

      // ACT

      // Final call with cached requests interwoven with uncached
      const batchResults = await batchManager.batchCall([
        ...firstBatch,
        ...thirdBatch,
        ...secondBatch,
      ])

      // ASSERT

      batchResults.forEach(function (result, index) {
        expect(result.requestIdx).toBe(index)
      })
      expect(batchResults.map((batchResult) => batchResult.data)).toEqual([
        ...firstBatch,
        ...thirdBatch,
        ...secondBatch,
      ])
    })
  })
})

function createBatchManager(mockFetchJson: any) {
  const mockConstructorProps = {
    url: mockConnection,
    cache: new NodeCache({ stdTTL: 15 }),
  }

  return new BatchManager(mockConstructorProps.url, mockConstructorProps.cache, {
    fetchJsonFn: mockFetchJson,
    debug: false,
  })
}

function createMockBatch(startSliceIndex: number = 0, endSliceIndex: number = 9): Request[] {
  if (startSliceIndex < 0 || startSliceIndex >= 9) {
    throw new Error(`Start Index must be greater than or equal to zero and less than 9`)
  }

  if (endSliceIndex < 1 || endSliceIndex > 9) {
    throw new Error(`End Index must be greater than zero and less than or equal to 9`)
  }

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
  ].slice(startSliceIndex, endSliceIndex)
}
