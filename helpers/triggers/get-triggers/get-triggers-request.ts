import { getTriggersConfig } from './get-triggers-config'
import type { GetTriggersParams, GetTriggersResponse } from './get-triggers-types'

export const getTriggersRequest = async ({
  dpm,
  networkId,
}: GetTriggersParams): Promise<GetTriggersResponse> => {
  const { url } = getTriggersConfig({ dpm, networkId })

  const response = await fetch(url)
  // return {
  //   triggers: {
  //     ...responseJson.triggers,
  //     aaveBasicBuy: {
  //       triggerId: '1',
  //       triggerData: '0x0',
  //       triggerType: 119n,
  //       triggerTypeName: 'AaveBasicBuyV2',
  //       decodedParams: {
  //         positionAddress: dpm.proxy,
  //         triggerType: '119',
  //         execLtv: '4550',
  //         targetLtv: '6752',
  //         collateralToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
  //         debtToken: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
  //         deviation: '100',
  //         maxBaseFeeInGwei: '500',
  //         opHash: '0x0',
  //         maxBuyPrice: '3000000000',
  //         maxCoverage: '15000000000',
  //       },
  //     },
  //   },
  // }
  return (await response.json()) as GetTriggersResponse
}
