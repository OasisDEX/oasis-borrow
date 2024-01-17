import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function SimpleEarnOverview({ ...props }: any) {
  const { t } = useTranslation()
  console.log('SimpleEarnOverview props', props)
  return (
    <DetailsSectionContentTable
      headers={[
        t('earn-vault.simulate.header1'),
        t('earn-vault.simulate.header2'),
        t('earn-vault.simulate.header3'),
      ]}
      rows={[]}
      footnote={<>{t('earn-vault.simulate.footnote1')}</>}
    />
  )
}
