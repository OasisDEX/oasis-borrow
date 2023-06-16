import { renderHook } from '@testing-library/react'
import {
  CustomNetworkStorageKey,
  NetworkIds,
  NetworkNames,
  useCustomNetworkParameter,
} from 'blockchain/networks'

describe('getCustomNetworkParameter', () => {
  it('Should return null if localStorage has invalid value', () => {
    localStorage.setItem(CustomNetworkStorageKey, 'invalid')
    const { result } = renderHook(() => useCustomNetworkParameter())

    const [currentState] = result.current

    expect(currentState).toBe(null)
  })
  it('Should return null if localStorage has unsupported network', () => {
    localStorage.setItem(
      CustomNetworkStorageKey,
      JSON.stringify({
        network: 'unsupported',
        id: 21372137,
        hexId: '0x1461CE9',
      }),
    )
    const { result } = renderHook(() => useCustomNetworkParameter())
    const [currentState] = result.current
    expect(currentState).toBe(null)
  })
  it('Should return custom network if localStorage has valid value', () => {
    const customNetwork = {
      network: NetworkNames.optimismMainnet,
      id: NetworkIds.OPTIMISMMAINNET,
      hexId: '0xa',
    }

    localStorage.setItem(CustomNetworkStorageKey, JSON.stringify(customNetwork))
    const { result } = renderHook(() => useCustomNetworkParameter())
    const [currentState] = result.current
    expect(currentState).toEqual(customNetwork)
  })
})
