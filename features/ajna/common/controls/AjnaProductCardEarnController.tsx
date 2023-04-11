import { useAppContext } from 'components/AppContextProvider'
import { AlternateProductCard } from 'components/productCards/AlternateProductCard'
import { AjnaProductCardsSkeleton } from 'features/ajna/common/components/AjnaProductCardsSkeleton'
import { AjnaProductCardsWrapper } from 'features/ajna/common/components/AjnaProductCardsWrapper'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const AjnaProductCardEarnController = () => {
  const { t } = useTranslation()
  const { ajnaProductCardsData$ } = useAppContext()
  const [ajnaProductCardsData, ajnaProductCardsDataError] = useObservable(ajnaProductCardsData$)

  return (
    <WithErrorHandler error={[ajnaProductCardsDataError]}>
      <WithLoadingIndicator
        value={[ajnaProductCardsData]}
        customLoader={<AjnaProductCardsSkeleton />}
      >
        {([{ earnCards }]) => (
          <AjnaProductCardsWrapper>
            {earnCards.map((card) => (
              <AlternateProductCard
                header={t(card.headerKey, { token: card.token })}
                background={card.background}
                icon={card.icon}
                key={card.headerKey}
                banner={{
                  ...card.banner,
                  tokens: card.computed.tokens,
                }}
                button={card.button}
                labels={card.labels}
              />
            ))}
          </AjnaProductCardsWrapper>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
