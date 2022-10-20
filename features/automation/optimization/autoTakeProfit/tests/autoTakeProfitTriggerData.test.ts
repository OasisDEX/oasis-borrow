import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { expect } from 'chai'
import { Result } from 'ethers/lib/utils'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { AutoTakeProfitFormChange, AutoTakeProfitResetData } from '../state/autoTakeProfitFormChange'
import { AutoTakeProfitTriggerData, defaultAutoTakeProfitData, extractAutoTakeProfitData, pickTriggerWithLowestExecutionPrice, prepareAddAutoTakeProfitTriggerData, prepareAutoTakeProfitResetData } from '../state/autoTakeProfitTriggerData'
import { createMockVault, generateRandomBigNumber } from './utils'

describe('autoTakeProfit Form Change tests', () => {

  describe('Given extractAutoTakeProfitData is called', () => {

    it('handles empty input and returns correct value', (done) => {

      const result = extractAutoTakeProfitData([] as any);

      expect(result).to.deep.equal(defaultAutoTakeProfitData)

      done()
    })

    it('handles correct input and returns correct value', (done) => {
      const data = {
        isAutomationEnabled: true,
        triggers: [
          {
            triggerId: 0,
            groupId: 0,
            commandAddress: '',
            executionParams: ''
          }
        ]
      } as TriggersData;

      const result = extractAutoTakeProfitData([] as any);

      expect(result).to.deep.equal(defaultAutoTakeProfitData)

      done()
    })
  })

  describe('given that prepareAddAutoTakeProfitTriggerData is called', () => {
    it('returns the correct values and performs the desired calculation correctly', (done) => {
      // prepare data  const [, triggerType, executionPrice, maxBaseFeeInGwei] = trigger.result
      const data = {
        vaultData: createMockVault({}),
        executionPrice: new BigNumber(11250),
        maxBaseFeeInGwei: new BigNumber(23.43),
        isCloseToCollateral: true,
        replacedTriggerId: 4
      } as {
        vaultData: Vault,
        executionPrice: BigNumber,
        maxBaseFeeInGwei: BigNumber,
        isCloseToCollateral: boolean,
        replacedTriggerId: number
      }

      const result = prepareAddAutoTakeProfitTriggerData(data.vaultData as any, data.executionPrice, data.maxBaseFeeInGwei, data.isCloseToCollateral, data.replacedTriggerId)

      expect(result.cdpId).equal(data.vaultData.id)
      expect(result.kind).equal('addTrigger')


      done()
    })
  })

  describe('given that pickTriggerWithLowestExecutionPrice is called', () => {
    it('returns the correct values and performs the desired calculation correctly', (done) => {
      // prepare data  const [, triggerType, executionPrice, maxBaseFeeInGwei] = trigger.result
      const idOne = Math.random();

      const triggers = [
        {
          triggerId: idOne,
          result: [
            '',
            7,
            new BigNumber(1),
            new BigNumber(4)
          ]
        },
        {
          triggerId: Math.random(),
          result: [
            '',
            7,
            new BigNumber(4),
            new BigNumber(6)
          ]
        }
      ] as {
        triggerId: number
        result: Result
      }[]

      const expectedResult = {
        executionPrice: new BigNumber(1),
        isToCollateral: true,
        isTriggerEnabled: true,
        maxBaseFeeInGwei: new BigNumber(4),
        triggerId: new BigNumber(idOne),
      }

      const result = pickTriggerWithLowestExecutionPrice(triggers)

      expect(result).to.deep.equal(expectedResult)

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
        toCollateral: true
      } as AutoTakeProfitFormChange;

      const triggerData = {
        executionPrice: generateRandomBigNumber(),
        isToCollateral: true,
        isTriggerEnabled: true,
        maxBaseFeeInGwei: generateRandomBigNumber(),
        triggerId: generateRandomBigNumber()
      } as AutoTakeProfitTriggerData;

      const expectedResult = {
        executionCollRatio: autoTakeProfitState.defaultExecutionCollRatio,
        executionPrice: autoTakeProfitState.defaultExecutionPrice,
        isEditing: false,
        toCollateral: triggerData.isToCollateral,
        txDetails: {},
      } as AutoTakeProfitResetData;

      const result = prepareAutoTakeProfitResetData(autoTakeProfitState, triggerData)
      expect(result).to.deep.equal(expectedResult)

      done()
    })

  })

})