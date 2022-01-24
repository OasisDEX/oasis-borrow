import BigNumber from 'bignumber.js'
import { Banner } from 'components/Banner'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

export function GuniTempBanner({ id }: { id: BigNumber }) {
  const [isOpen, setIsOpen] = useState(true)
  const { t } = useTranslation()

  const showMessage = [
    '26922',
    '26924',
    '26956',
    '26891',
    '26961',
    '26894',
    '26994',
    '26910',
  ].includes(id.toString())

  if (isOpen && showMessage) {
    return (
      <Banner sx={{ mt: 3 }} close={() => setIsOpen(false)}>
        {t('temporary-guni-message')}
      </Banner>
    )
  }

  return null
}
