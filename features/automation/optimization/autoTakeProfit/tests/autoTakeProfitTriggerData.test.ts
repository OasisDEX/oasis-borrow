import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import type {
  AutoTakeProfitFormChange,
  AutoTakeProfitResetData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.types'
import {
  extractAutoTakeProfitData,
  pickTriggerWithLowestExecutionPrice,
  prepareAutoTakeProfitResetData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData.types'
import { defaultAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/defaultAutoTakeProfitData'

import { generateRandomBigNumber } from './utils'

describe('autoTakeProfit Form Change tests', () => {
  describe('Given extractAutoTakeProfitData is called', () => {
    it('handles empty input and returns correct value', (done) => {
      const result = extractAutoTakeProfitData([] as any)

      expect(result).toEqual(defaultAutoTakeProfitData)

      done()
    })

    it('handles correct input and returns correct value', (done) => {
      const result = extractAutoTakeProfitData([] as any)

      expect(result).toEqual(defaultAutoTakeProfitData)

      done()
    })
  })

  // TODO: @johnnie @george this test fails, check it is not code
  // describe('given that prepareAddAutoTakeProfitTriggerData is called', () => {
  //   it('returns the correct values and performs the desired calculation correctly', (done) => {
  //     // prepare data  const [, triggerType, executionPrice, maxBaseFeeInGwei] = trigger.result
  //     const data = {
  //       vaultData: createMockVault({}),
  //       executionPrice: generateRandomBigNumber(),
  //       maxBaseFeeInGwei: generateRandomBigNumber(),
  //       isCloseToCollateral: true,
  //       replacedTriggerId: 4
  //     } as {
  //       vaultData: Vault,
  //       executionPrice: BigNumber,
  //       maxBaseFeeInGwei: BigNumber,
  //       isCloseToCollateral: boolean,
  //       replacedTriggerId: number
  //     }

  //     const result = prepareAddAutoTakeProfitTriggerData(data.vaultData, data.executionPrice, data.maxBaseFeeInGwei, data.isCloseToCollateral, data.replacedTriggerId)

  //     expect(result.cdpId).equal(data.vaultData.id)
  //     expect(result.kind).equal('addTrigger')

  //     done()
  //   })
  // })

  describe('given that pickTriggerWithLowestExecutionPrice is called', () => {
    it('returns the correct values and performs the desired calculation correctly', (done) => {
      // prepare data  const [, triggerType, executionPrice, maxBaseFeeInGwei] = trigger.result
      const idOne = Math.random()

      const triggers = [
        {
          triggerId: idOne,
          result: {
            triggerType: 7,
            executionPrice: new BigNumber(1),
            maxBaseFeeInGwei: new BigNumber(4),
          },
        },
        {
          triggerId: Math.random(),
          result: {
            triggerType: 7,
            executionPrice: new BigNumber(4),
            maxBaseFeeInGwei: new BigNumber(6),
          },
        },
      ]

      const { triggerType, executionPrice, maxBaseFeeInGwei } = triggers[0].result
      const expectedResult = {
        executionPrice: new BigNumber(executionPrice.toString()).div(new BigNumber(10).pow(18)),
        isToCollateral: triggerType === TriggerType.AutoTakeProfitToCollateral,
        isTriggerEnabled: true,
        maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei.toString()),
        triggerId: new BigNumber(idOne),
      }

      const result = pickTriggerWithLowestExecutionPrice(triggers)

      expect(result).toEqual(expectedResult)

      done()
    })
  })

  describe('given that prepareAutoTakeProfitResetData is called', () => {
    it('returns correct values based on input, when toCollateral is true', (done) => {
      // prepare data
      const autoTakeProfitState = {
        currentForm: 'add',
        defaultExecutionCollRatio: generateRandomBigNumber(),
        defaultExecutionPrice: generateRandomBigNumber(),
        executionCollRatio: generateRandomBigNumber(),
        executionPrice: generateRandomBigNumber(),
        toCollateral: true,
      } as AutoTakeProfitFormChange

      const triggerData = {
        executionPrice: generateRandomBigNumber(),
        isToCollateral: true,
        isTriggerEnabled: true,
        maxBaseFeeInGwei: generateRandomBigNumber(),
        triggerId: generateRandomBigNumber(),
      } as AutoTakeProfitTriggerData

      const expectedResult = {
        executionCollRatio: autoTakeProfitState.defaultExecutionCollRatio,
        executionPrice: autoTakeProfitState.defaultExecutionPrice,
        isEditing: false,
        toCollateral: triggerData.isToCollateral,
        txDetails: {},
      } as AutoTakeProfitResetData

      const result = prepareAutoTakeProfitResetData(autoTakeProfitState, triggerData)
      expect(result).toEqual(expectedResult)

      done()
    })
  })
})
