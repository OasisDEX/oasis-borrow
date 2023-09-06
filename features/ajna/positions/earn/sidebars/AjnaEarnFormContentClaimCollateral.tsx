import React from 'react'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans } from 'next-i18next'

export function AjnaEarnFormContentClaimCollateral() {
  return (
    <>
      <MessageCard
        messages={[
          <Trans
            i18nKey="ajna.validations.collateral-to-claim"
            components={{
              1: <strong />,
              2: (
                <AppLink
                  sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}
                  // TODO update ajna link
                  href={EXTERNAL_LINKS.KB.HELP}
                />
              ),
            }}
          />,
        ]}
        type="warning"
        withBullet={false}
      />
      <AjnaFormContentSummary showReset={false}>
        <AjnaEarnFormOrder />
      </AjnaFormContentSummary>
    </>
  )
}
