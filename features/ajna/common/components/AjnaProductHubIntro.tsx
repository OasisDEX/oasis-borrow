import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { productHubLinksMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

interface AjnaProductHubIntroProps {
  selectedProduct: ProductHubProductType
  selectedToken: string
}

export const AjnaProductHubIntro: FC<AjnaProductHubIntroProps> = ({ selectedProduct }) => {
  const { t } = useTranslation()

  // TODO: remove when Ajna Multiply feature flag is no longer needed
  const ajnaMultiplyEnabled = useFeatureToggle('AjnaMultiply')

  return (
    <Box sx={{ my: 5 }}>
      {selectedProduct === ProductHubProductType.Multiply && !ajnaMultiplyEnabled ? (
        <>
          <Text as="p" variant="header5" sx={{ mb: 1 }}>
            {t('ajna.product-finder.multiply-soon-title')}
          </Text>
          <Text as="p" variant="paragraph2">
            <Trans
              i18nKey="ajna.product-finder.multiply-soon-intro"
              components={{
                1: (
                  <AppLink
                    href={INTERNAL_LINKS.ajnaBorrow}
                    sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                  />
                ),
                2: (
                  <AppLink
                    href={INTERNAL_LINKS.ajnaEarn}
                    sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                  />
                ),
              }}
            />
          </Text>
        </>
      ) : (
        <Text
          as="p"
          variant="paragraph2"
          sx={{
            mx: 'auto',
            mt: '24px',
          }}
        >
          {t(`product-hub.intro.${selectedProduct}`)}{' '}
          <AppLink href={productHubLinksMap[selectedProduct]}>
            <WithArrow
              variant="paragraph2"
              sx={{
                display: 'inline-block',
                fontSize: 3,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              Summer.fi {t(`nav.${selectedProduct}`)}
            </WithArrow>
          </AppLink>
        </Text>
      )}
    </Box>
  )
}
