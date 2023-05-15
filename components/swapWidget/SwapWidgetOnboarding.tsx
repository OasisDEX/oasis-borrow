import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useOnboarding } from 'helpers/useOnboarding'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Box, Button, Flex, Image, Text } from 'theme-ui'

export const SwapWidgetOnboarding = () => {
  const [, setAsOnboarded] = useOnboarding('Exchange')
  const { t } = useTranslation()
  return (
    <Flex
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'neutral10',
        zIndex: 'menu',
        borderRadius: 'mediumLarge',
        py: 4,
        px: 3,
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center', px: 2 }}>
        <Text variant="swapHeader" sx={{ mt: 4 }}>
          {t('exchange.onboarding.title')}
        </Text>
        <Image
          sx={{
            mt: 4,
            mb: 2,
          }}
          src={staticFilesRuntimeUrl('/static/img/oasis-x-lifi-swap.svg')}
        />
        <Text variant="boldParagraph2" sx={{ mb: 2 }}>
          {t('exchange.onboarding.subtitle')}
        </Text>
        <Text variant="paragraph3" sx={{ px: 3, textAlign: 'center', color: 'neutral80', mb: 3 }}>
          <Trans
            i18nKey="exchange.onboarding.body"
            components={[<AppLink href={t('exchange.onboarding.faq-url')} />]}
          />
        </Text>
      </Box>
      <Button sx={{ width: '100%' }} onClick={() => setAsOnboarded()}>
        {t('exchange.onboarding.button')}
      </Button>
    </Flex>
  )
}
