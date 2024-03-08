import {DetailsSectionContentTable} from 'components/DetailsSectionContentTable'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {useTranslation} from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContent: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { isOpening },
  } = useOmniGeneralContext()

  return (
    <>
      {isOpening ? (
          <DetailsSectionContentTable
            headers={[
              t('ajna.position-page.earn.open.simulation.duration'),
              t('ajna.position-page.earn.open.simulation.estimated-earnings'),
              t('ajna.position-page.earn.open.simulation.net-value'),
            ]}
            rows={[
              ['1', '2', '3'],
              ['1', '2', '3'],
              ['1', '2', '3'],
            ]}
            footnote={<>{t('ajna.position-page.earn.open.simulation.disclaimer')}</>}
          />
      ) : (
        <>Manage overview section</>
      )}
    </>
  )
}
