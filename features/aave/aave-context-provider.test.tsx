import { renderHook } from '@testing-library/react'
import { NetworkNames } from 'blockchain/networks'
import { accountContext, AccountContextProvider } from 'components/context/AccountContextProvider'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { mainContext, MainContextProvider } from 'components/context/MainContextProvider'
import { productContext } from 'components/context/ProductContextProvider'
import type { ProductContext } from 'helpers/context/ProductContext.types'
import { LendingProtocol } from 'lendingProtocols'
import type { PropsWithChildren } from 'react'
import React from 'react'

import type { AaveContext } from './aave-context'
import { aaveContext, AaveContextProvider, useAaveContext } from './aave-context-provider'
import * as setupAaveV2ContextModule from './setup-aave-v2-context'

jest.mock('./setup-aave-v2-context', () => {
  return {
    setupAaveV2Context: jest.fn(() => ({} as AaveContext)),
  }
})

jest.mock('./setup-aave-v3-context', () => {
  return {
    setupAaveV3Context: jest.fn(() => ({} as AaveContext)),
  }
})

jest.mock('./setup-spark-v3-context', () => {
  return {
    setupSparkV3Context: jest.fn(() => ({} as AaveContext)),
  }
})

describe('AaveContextProvider', () => {
  const context = { protocols: {} } as ProductContext
  const wrapper = ({ children }: PropsWithChildren<{}>) => (
    <MainContextProvider>
      <DeferedContextProvider context={mainContext}>
        <AccountContextProvider>
          <DeferedContextProvider context={accountContext}>
            <productContext.Provider value={context}>
              <AaveContextProvider>
                <DeferedContextProvider context={aaveContext}>{children}</DeferedContextProvider>
              </AaveContextProvider>
            </productContext.Provider>
          </DeferedContextProvider>
        </AccountContextProvider>
      </DeferedContextProvider>
    </MainContextProvider>
  )

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should call `setupAaveV2Context` only once, even when re-rendering.', () => {
    const spy = jest.spyOn(setupAaveV2ContextModule, 'setupAaveV2Context')
    const { rerender } = renderHook(
      () => useAaveContext(LendingProtocol.AaveV2, NetworkNames.ethereumMainnet),
      { wrapper },
    )
    rerender()
    rerender()
    expect(spy).toBeCalledTimes(1)
  })

  it.skip('Should throw exception because AAVEV2 is not available on optimism', () => {
    expect(() =>
      renderHook(() => useAaveContext(LendingProtocol.AaveV2, NetworkNames.optimismMainnet), {
        wrapper,
      }),
    ).toThrow('AaveContext for network optimism and protocol AaveV2 is not available!')
  })
})
