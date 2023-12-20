import {
  PositionLike,
  Price,
  SupportedTriggers,
  SupportedTriggersSchema,
  ValidationResults,
} from '~types'
import { AutoBuyValidationParams, autoBuyValidator } from './auto-buy-validator'
import { AutoSellTriggerParams, autoSellValidator } from './auto-sell-validator'
import { z } from 'zod'

export type AgainstPositionValidatorParams<Schema extends SupportedTriggersSchema> = {
  position: PositionLike
  executionPrice: Price
  body: z.infer<Schema>
}

export type AgainstPositionValidator<
  Trigger extends SupportedTriggers,
  Schema extends SupportedTriggersSchema,
> = (params: AgainstPositionValidatorParams<Schema>) => ValidationResults

const againstPositionValidators = {
  [SupportedTriggers.AutoBuy]: autoBuyValidator,
  [SupportedTriggers.AutoSell]: autoSellValidator,
}

export const getAgainstPositionValidator = <
  Trigger extends SupportedTriggers,
  Schema extends SupportedTriggersSchema,
>(
  trigger: Trigger,
  schema: Schema,
): AgainstPositionValidator<Trigger, Schema> => {
  return againstPositionValidators[trigger] as AgainstPositionValidator<Trigger, Schema>
}
