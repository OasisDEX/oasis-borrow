import { getSupportedPositions } from '../src/utils'
import protocolMock from '../mocks/debank_complex_protocol.json'
import protocolMockBase from '../mocks/debank_complex_protocol_base.json'
import protocolMockOp from '../mocks/debank_complex_protocol_op.json'

describe('portfolio-overview utils', () => {
  describe('getSupportedPositions', () => {
    it('should parse and return supported positions only - eth', () => {
      const positions = getSupportedPositions(protocolMock as any)
      expect(
        positions.map((pos) => {
          return {
            id: pos.stats?.net_usd_value,
          }
        }),
      ).toStrictEqual([
        { id: 223.15024295156613 },
        { id: 486.928514566971 },
        { id: 202.1437835794202 },
        { id: 95.26311770964453 },
        { id: 507.31441504714604 },
        { id: 0.8122354205645324 },
      ])
    })

    it('should parse and return supported positions only - base', () => {
      const positions = getSupportedPositions(protocolMockBase as any)
      expect(
        positions.map((pos) => {
          return {
            id: pos.stats?.net_usd_value,
          }
        }),
      ).toStrictEqual([
        {
          id: 127.0220706851955,
        },
      ])
    })

    it('should parse and return supported positions only - op', () => {
      const positions = getSupportedPositions(protocolMockOp as any)
      expect(
        positions.map((pos) => {
          return {
            id: pos.stats?.net_usd_value,
          }
        }),
      ).toStrictEqual([{ id: 161.43623031869728 }])
    })
  })
})
