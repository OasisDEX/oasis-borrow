import BigNumber from 'bignumber.js'

import type { AaveUserConfigurationResult } from './aave-user-configuration'
import { createAaveUserConfiguration } from './aave-user-configuration'

// userConfig -> https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getuserconfiguration
// reservesList -> https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getreserveslist
describe('AaveUserConfiguration', () => {
  function generateUserConfig(input: string): string {
    return new BigNumber(`0b${input}`).toString()
  }

  function assert(
    asset: string,
    assetName: string,
    isCollateral: boolean,
    isBorrowed: boolean,
    results: AaveUserConfigurationResult[],
  ) {
    const interestingRow = results.find((row) => row.asset === asset && row.assetName === assetName)

    expect(interestingRow?.collateral).toBe(isCollateral)
    expect(interestingRow?.borrowed).toBe(isBorrowed)
  }

  it('parses debt and collateral', () => {
    const reservesList = [
      '0x reserve that is used as collateral',
      '0x reserve that is used as debt',
      '0x reserve that is used as neither debt nor collateral',
      '0x reserve that is used as debt and collateral',
    ]

    const userConfig = generateUserConfig('11000110')

    const dictionary = {
      '0x reserve that is used as collateral': 'A',
      '0x reserve that is used as debt': 'B',
      '0x reserve that is used as neither debt nor collateral': 'C',
      '0x reserve that is used as debt and collateral': 'D',
    }

    const results = createAaveUserConfiguration([userConfig], reservesList, dictionary)
    // console.log(results)
    assert('0x reserve that is used as collateral', 'A', true, false, results)
    assert('0x reserve that is used as debt', 'B', false, true, results)
    assert('0x reserve that is used as neither debt nor collateral', 'C', false, false, results)
    assert('0x reserve that is used as debt and collateral', 'D', true, true, results)
  })

  it('handles implicit zeros at start', () => {
    const reservesList = [
      '0x reserve that is used as collateral',
      '0x reserve that is used as debt',
      '0x reserve that is used as neither debt nor collateral',
    ]

    // despite having three reserves, bits at start of userConfig
    // are implicit zeros and so not included
    const userConfig = generateUserConfig('110')

    const dictionary = {
      '0x reserve that is used as collateral': 'A',
      '0x reserve that is used as debt': 'B',
      '0x reserve that is used as neither debt nor collateral': 'C',
    }

    const results = createAaveUserConfiguration([userConfig], reservesList, dictionary)
    // console.log(results)
    assert('0x reserve that is used as collateral', 'A', true, false, results)
    assert('0x reserve that is used as debt', 'B', false, true, results)
    assert('0x reserve that is used as neither debt nor collateral', 'C', false, false, results)
  })

  it('handles one at start', () => {
    const reservesList = [
      '0x reserve that is used as collateral',
      '0x reserve that is used as collateral and debt',
      '0x reserve that is used as debt only',
    ]

    // despite having three reserves, bits at start of userConfig
    // are implicit zeros and so not included
    const userConfig = generateUserConfig('11110')

    const dictionary = {
      '0x reserve that is used as collateral': 'A',
      '0x reserve that is used as collateral and debt': 'B',
      '0x reserve that is used as debt only': 'C',
    }

    const results = createAaveUserConfiguration([userConfig], reservesList, dictionary)

    assert('0x reserve that is used as collateral', 'A', true, false, results)
    assert('0x reserve that is used as collateral and debt', 'B', true, true, results)
    assert('0x reserve that is used as debt only', 'C', false, true, results)
  })
})
