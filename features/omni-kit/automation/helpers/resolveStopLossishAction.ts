import { TriggerAction } from 'helpers/triggers'

export const resolveStopLossishAction = ({
  existingSLTrigger,
  existingTSLTrigger,
  action,
}: {
  existingSLTrigger: boolean
  existingTSLTrigger: boolean
  action?: TriggerAction
}) =>
  action === TriggerAction.Remove
    ? TriggerAction.Remove
    : existingSLTrigger || existingTSLTrigger
      ? TriggerAction.Update
      : TriggerAction.Add
