import { MessageCard } from 'components/MessageCard'
import type { OmniValidationMessagesControllerProps } from 'features/omni-kit/controllers'
import { useRefinanceContext } from 'features/refinance/contexts'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const RefinanceValidationMessages: FC<OmniValidationMessagesControllerProps> = ({
  validations,
  type,
}) => {
  const { t } = useTranslation()

  const {
    form: { state },
  } = useRefinanceContext()

  const messagesWithTranslations = validations.map((message) => {
    return (
      <>
        {message.message.translationKey &&
          t(
            `refinance.validations.${message.message.translationKey}`,
            state.strategy
              ? {
                  quoteToken: state.strategy.secondaryToken,
                  collateralToken: state.strategy.primaryToken,
                  protocol: LendingProtocolLabel[state.strategy.protocol],
                  ...message.message.params,
                }
              : {
                  ...message.message.params,
                },
          )}
        {message.message.component}
      </>
    )
  })

  return (
    <MessageCard
      messages={messagesWithTranslations}
      type={type === 'success' ? 'ok' : type}
      withBullet={validations.length > 1}
    />
  )
}
