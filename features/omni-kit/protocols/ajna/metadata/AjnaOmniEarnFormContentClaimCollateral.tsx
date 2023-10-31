import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import { OmniFormContentSummary } from 'features/omni-kit/components/sidebars/OmniFormContentSummary'
import { AjnaOmniEarnFormOrder } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnFormOrder'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans } from 'next-i18next'
import React from 'react'

export function AjnaOmniEarnFormContentClaimCollateral() {
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
      <OmniFormContentSummary showReset={false}>
        <AjnaOmniEarnFormOrder />
      </OmniFormContentSummary>
    </>
  )
}
