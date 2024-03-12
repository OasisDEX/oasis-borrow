import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import {
  OmniContentCard,
  useOmniCardDataLink,
  useOmniCardDataVaultFee,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { OmniProductType } from 'features/omni-kit/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionFooter: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { label },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { interestRate },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  // it is safe to assume that in erc-4626 context label is always availabe string
  const { id, curator } = erc4626VaultsByName[label as string]

  const curatorContentCardCuratorData = useOmniCardDataLink({
    translationCardName: 'curator',
    ...curator,
  })
  const curatorContentCardVaultFeeData = useOmniCardDataVaultFee({
    fee: interestRate,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.vault-fee.title')}
        description={t(`erc-4626.content-card.vault-fee-${id}.modal-description`)}
        value={formatDecimalAsPercent(interestRate)}
      />
    ),
  })

  return (
    <>
      <OmniContentCard asFooter {...curatorContentCardCuratorData} />
      <OmniContentCard asFooter {...curatorContentCardVaultFeeData} />
    </>
  )
}
