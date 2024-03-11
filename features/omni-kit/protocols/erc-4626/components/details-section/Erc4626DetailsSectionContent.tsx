import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { Erc4626DetailsSectionContentEstimatedEarnings } from 'features/omni-kit/protocols/erc-4626/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContent: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { isOpening, quoteToken },
  } = useOmniGeneralContext()

  return (
    <>
      {isOpening ? (
        <DetailsSectionContentTable
          headers={[
            t('omni-kit.position-page.earn.open.duration'),
            t('omni-kit.position-page.earn.open.estimated-earnings'),
            t('omni-kit.position-page.earn.open.net-value'),
          ]}
          rows={[
            [
              t('omni-kit.position-page.earn.open.earnings-per-1d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={zero}
                rewards={[{ amount: zero, token: 'MORPHO' }]}
              />,
              `${formatCryptoBalance(zero)} ${quoteToken}`,
            ],
            [
              t('omni-kit.position-page.earn.open.earnings-per-30d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={zero}
                rewards={[{ amount: zero, token: 'MORPHO' }]}
              />,
              `${formatCryptoBalance(zero)} ${quoteToken}`,
            ],
            [
              t('omni-kit.position-page.earn.open.earnings-per-365d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={zero}
                rewards={[{ amount: zero, token: 'MORPHO' }]}
              />,
              `${formatCryptoBalance(zero)} ${quoteToken}`,
            ],
          ]}
          footnote={<>{t('omni-kit.position-page.earn.open.disclaimer')}</>}
        />
      ) : (
        <>Manage overview section</>
      )}
    </>
  )
}
