import BigNumber from 'bignumber.js'
import { Banner } from 'components/Banner'
import { AppLink } from 'components/Links'
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
        <AppLink
          href="https://blog.oasis.app/debt-ceiling-increases-to-500m-dai-for-g-uni-vaults-and-more"
          sx={{ fontSize: 4, fontWeight: 'bold' }}
        >
          {t('here')}
        </AppLink>
      </Banner>
    )
  }

  return null
}
