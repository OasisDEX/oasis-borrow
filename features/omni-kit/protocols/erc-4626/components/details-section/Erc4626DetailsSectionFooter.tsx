import type { Erc4626Position } from '@oasisdex/dma-library'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import {
  OmniContentCard,
  useOmniCardDataLink,
  useOmniCardDataTokensValue,
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
    environment: { isOpening, label, quoteToken },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { interestRate },
    },
    position: { currentPosition },
  } = useOmniProductContext(OmniProductType.Earn)

  const position = currentPosition.position as Erc4626Position
  const simulation = currentPosition.simulation as Erc4626Position | undefined

  // it is safe to assume that in erc-4626 context label is always availabe string
  const { id, curator } = erc4626VaultsByName[label as string]

  const curatorContentCardCommonData = useOmniCardDataLink({
    translationCardName: 'curator',
    ...curator,
  })

  const vaultFeeContentCardCommonData = useOmniCardDataVaultFee({
    fee: interestRate,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.vault-fee.title')}
        description={t(
          `erc-4626.content-card.vault-fee-${id.replace(`-${quoteToken}`, '')}.modal-description`,
        )}
        value={formatDecimalAsPercent(interestRate)}
      />
    ),
  })

  const availableToWithdrawContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.maxWithdrawal,
    tokensAmount: position.maxWithdrawal,
    tokensSymbol: quoteToken,
    translationCardName: 'available-to-withdraw',
  })

  return (
    <>
      <OmniContentCard asFooter {...curatorContentCardCommonData} />
      <OmniContentCard asFooter {...vaultFeeContentCardCommonData} />
      {!isOpening && <OmniContentCard asFooter {...availableToWithdrawContentCardCommonData} />}
    </>
  )
}
