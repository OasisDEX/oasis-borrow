import { encodeAaveAutoBuy } from './encode-aave-auto-buy'
import { SupportedTriggers, AaveAutoBuyTriggerData, AaveAutoSellTriggerData } from '~types'
import { ProtocolId } from 'shared/domain-types'
import { TriggerEncoders } from './types'
import { encodeAaveBasicSell } from './encode-aave-basic-sell'

export const triggerEncoders: TriggerEncoders = {
  [ProtocolId.AAVE3]: {
    [SupportedTriggers.AutoBuy]: encodeAaveAutoBuy,
    [SupportedTriggers.AutoSell]: encodeAaveBasicSell,
  },
}
