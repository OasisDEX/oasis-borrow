import { aaveBasicBuyTriggerDataSchema } from './validators'
import 'jest-extended'
describe('Trigger Data Validator', () => {
  const validTriggerData = {
    executionLTV: 100n,
    targetLTV: 100n,
    maxBuyPrice: 100n,
    maxBaseFee: 100n,
  }
  it('should return success when the given triggerData is valid', () => {
    const result = aaveBasicBuyTriggerDataSchema.safeParse(validTriggerData)
    expect(result.success).toBeTruthy()
  })
  it('should return error when the given executionLTV has decimal places', () => {
    const result = aaveBasicBuyTriggerDataSchema.safeParse({
      ...validTriggerData,
      executionLTV: '100.1',
    })

    const errors = result.success === false ? result.error.errors : []

    expect(result.success).toBeFalsy()
    expect(errors).toIncludeAllPartialMembers([{ code: 'custom', params: { code: 'not-bigint' } }])
  })

  it('should return error when the given executionLTV is bigger than 10_000', () => {
    const result = aaveBasicBuyTriggerDataSchema.safeParse({
      ...validTriggerData,
      executionLTV: 10_001n,
    })

    const errors = result.success === false ? result.error.errors : []

    expect(result.success).toBeFalsy()
    expect(errors).toIncludeAllPartialMembers([
      { code: 'custom', params: { code: 'ltv-out-of-range' } },
    ])
  })
})
