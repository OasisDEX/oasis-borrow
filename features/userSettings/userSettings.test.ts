/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { getStateUnpacker } from 'helpers/testHelpers'
import type { Observable } from 'rxjs'
import { of, throwError } from 'rxjs'

import { createUserSettings$ } from './userSettings'
import { SLIPPAGE_DEFAULT } from './userSettings.constants'
import type { SaveUserSettingsFunction } from './userSettings.types'
import { checkUserSettingsLocalStorage$, saveUserSettingsLocalStorage$ } from './userSettingsLocal'

interface MockUserSettingsProps {
  _checkUserSettings$?: () => Observable<{ slippage: string | null }>
  _saveUserSettings$?: SaveUserSettingsFunction
}

export function mockUserSettings(props: MockUserSettingsProps = {}) {
  const mockUserSettings$ = ({
    _checkUserSettings$,
    _saveUserSettings$,
  }: MockUserSettingsProps = {}) => {
    const checkUserSettings$ = _checkUserSettings$ || checkUserSettingsLocalStorage$
    const saveUserSettings$ = _saveUserSettings$ || saveUserSettingsLocalStorage$

    return createUserSettings$(checkUserSettings$, saveUserSettings$)
  }

  return getStateUnpacker(mockUserSettings$(props))
}

describe('userSettings', () => {
  beforeEach(() => localStorage.clear())

  it('should start in editing stage and with default slippage if local storage is empty', () => {
    const state = mockUserSettings()

    expect(state().stage).toEqual('editing')
    expect(state().slippage).toEqual(SLIPPAGE_DEFAULT)
    expect(state().slippageInput).toEqual(SLIPPAGE_DEFAULT)
  })

  it('should start with saved slippage', () => {
    const savedSlippage = new BigNumber(0.1)
    const state = mockUserSettings({
      _checkUserSettings$: () => of({ slippage: savedSlippage.toFixed() }),
    })

    expect(state().slippage).toEqual(savedSlippage)
  })

  it('should update slippage input', () => {
    const newSlippage = new BigNumber(0.1)
    const state = mockUserSettings()

    state().setSlippageInput(newSlippage)
    expect(state().slippage).toEqual(SLIPPAGE_DEFAULT)
    expect(state().slippageInput).toEqual(newSlippage)
  })

  it('should validate if slippage is outside of valid range (0.2-0.001) and block progression', () => {
    const newSlippageOver = new BigNumber(0.21)
    const newSlippageValid = new BigNumber(0.2)
    const newSlippageUnder = new BigNumber(0.0009)
    const state = mockUserSettings()

    state().setSlippageInput(newSlippageOver)
    expect(state().errors).toEqual(['invalidSlippage'])
    expect(state().canProgress).toEqual(false)

    state().setSlippageInput(newSlippageValid)
    expect(state().errors).toEqual([])
    expect(state().canProgress).toEqual(true)

    state().setSlippageInput(newSlippageUnder)
    expect(state().errors).toEqual(['invalidSlippage'])
    expect(state().canProgress).toEqual(false)
  })

  it('should validate if slippage is valid and over warning threshold (0.05)', () => {
    const newSlippage = new BigNumber(0.1)
    const state = mockUserSettings()

    state().setSlippageInput(newSlippage)
    expect(state().warnings).toEqual(['highSlippage'])
    expect(state().canProgress).toEqual(true)
  })

  it('should save slippage, progress to success state and handle reset', () => {
    const newSlippage = new BigNumber(0.1)
    const state = mockUserSettings()

    state().setSlippageInput(newSlippage)
    state().saveSettings!()
    expect(state().stage).toEqual('success')
    expect(state().slippage).toEqual(newSlippage)
    state().reset()
    expect(state().stage).toEqual('editing')
  })

  it('should handle failure on saving slippage', () => {
    const newSlippage = new BigNumber(0.1)
    const state = mockUserSettings({ _saveUserSettings$: () => throwError('error') })

    state().setSlippageInput(newSlippage)
    state().saveSettings!()
    expect(state().stage).toEqual('failure')
    expect(state().slippage).toEqual(SLIPPAGE_DEFAULT)
  })
})
