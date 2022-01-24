import BigNumber from 'bignumber.js'
import { Banner } from 'components/Banner'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Heading } from 'theme-ui'

export const guniExistingVaults = [
  '26922',
  '26924',
  '26956',
  '26891',
  '26961',
  '26894',
  '26994',
  '26910',
]

export function GuniTempBanner({ id }: { id: BigNumber }) {
  const [isOpen, setIsOpen] = useState(true)
  const { t } = useTranslation()

  const showMessage = guniExistingVaults.includes(id.toString())

  if (isOpen && showMessage) {
    return (
      <Banner sx={{ mt: 3 }} close={() => setIsOpen(false)}>
        <Heading as="h3" sx={{ color: 'onWarning' }}>
          {t('temporary-guni-message')}
          <AppLink
            href="https://blog.oasis.app/debt-ceiling-increases-to-500m-dai-for-g-uni-vaults-and-more"
            sx={{ fontSize: 4, fontWeight: 'bold', color: 'onWarning' }}
          >
            {t('here')}
          </AppLink>
        </Heading>
      </Banner>
    )
  }

  return null
}
