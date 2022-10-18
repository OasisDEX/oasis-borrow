import { expect } from 'chai'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { AutoTakeProfitFormChange } from '../state/autoTakeProfitFormChange'
import { AutoTakeProfitTriggerData, extractAutoTakeProfitData, prepareAutoTakeProfitResetData } from '../state/autoTakeProfitTriggerData'

test('autoTakeProfit Form Change tests', () => {

  describe('Given extractAutoTakeProfitData is called', () => {
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

    it('handles correct input and returns correct value', (done) => {
      const result = extractAutoTakeProfitData(data);


      done()
    })
  })

  describe('given that prepareAutoTakeProfitResetData is called', () => {

    it('returns correct values based on input',(done) => {
      const autoTakeProfitState = { } as AutoTakeProfitFormChange;
      const triggerData = {  } as AutoTakeProfitTriggerData;

      const result = prepareAutoTakeProfitResetData(autoTakeProfitState, triggerData)
    })

  })

})