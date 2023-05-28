import { renderHook } from '@testing-library/react'
import {
  CustomNetworkStorageKey,
  mainnetNetworkParameter,
  NetworkIds,
  NetworkNames,
  useCustomNetworkParameter,
} from 'blockchain/networks'

describe('getCustomNetworkParameter', () => {
  it('Should return mainnet as default network', () => {
    localStorage.clear()
    const { result } = renderHook(() => useCustomNetworkParameter())

    const [currentState] = result.current

    expect(currentState).toBe(mainnetNetworkParameter)
  })

  it('Should return mainnet if localStorage has invalid value', () => {
    localStorage.setItem(CustomNetworkStorageKey, 'invalid')
    const { result } = renderHook(() => useCustomNetworkParameter())

    const [currentState] = result.current

    expect(currentState).toBe(mainnetNetworkParameter)
  })
  it('Should return mainnet if localStorage has unsupported network', () => {
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
    expect(currentState).toBe(mainnetNetworkParameter)
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
