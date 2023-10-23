import { MessageCard } from 'components/MessageCard'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type { OmniValidationItem } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniValidationMessagesControllerProps {
  validations: OmniValidationItem[]
  type: 'warning' | 'error' | 'notice' | 'success'
}

export const OmniValidationMessagesController: FC<OmniValidationMessagesControllerProps> = ({
  validations,
  type,
}) => {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken, product },
  } = useOmniGeneralContext()

  const token = product === 'earn' ? quoteToken : collateralToken

  const messagesWithTranslations = validations.map((message) => {
    return (
      <>
        {message.message.translationKey &&
          t(`ajna.validations.${message.message.translationKey}`, {
            token,
            quoteToken,
            collateralToken,
            ...message.message.params,
          })}
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
