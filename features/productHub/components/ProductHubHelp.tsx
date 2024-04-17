import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import type { OmniProductType } from 'features/omni-kit/types'
import { productHubHelp } from 'features/productHub/meta'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React, { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { question_o } from 'theme/icons'
import { Box, Button, Flex, Text } from 'theme-ui'

interface ProductHubHelpProps {
  selectedProduct: OmniProductType
}

export const ProductHubHelp: FC<ProductHubHelpProps> = ({ selectedProduct }) => {
  const { t } = useTranslation()

  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const outsideRef = useOutsideElementClickHandler(() => setIsOpen(false))

  return (
    <Box ref={outsideRef} sx={{ position: 'relative' }}>
      <Button
        variant="action"
        sx={{
          display: 'flex',
          alignItems: 'center',
          columnGap: 1,
          width: ['100%', null, 'auto'],
          height: '56px',
          px: 3,
          border: '1px solid',
          borderColor: isOpen ? 'primary100' : 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          color: 'primary100',
          transition: 'border-color 200ms',
          '&:hover': {
            borderColor: isOpen ? 'primary100' : 'neutral70',
          },
        }}
        onClick={toggleIsOpen}
      >
        <Icon icon={question_o} size="20px" />
        <Text variant="paragraph3">{t('help')}</Text>
        <ExpandableArrow
          size={12}
          direction={isOpen ? 'up' : 'down'}
          sx={{
            position: 'absolute',
            top: 0,
            right: '18px',
            bottom: 0,
            display: ['block', null, 'none'],
            mr: '1px',
            my: 'auto',
          }}
        />
      </Button>
      <Flex
        as="ul"
        sx={{
          position: 'absolute',
          top: '100%',
          right: 0,
          flexDirection: 'column',
          rowGap: 3,
          width: ['100%', null, 'auto'],
          m: 0,
          mt: 1,
          p: 3,
          listStyle: 'none',
          border: '1px solid',
          borderColor: 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 1,
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        {productHubHelp[selectedProduct].map(({ link, translationKey }) => (
          <Box as="li" sx={{ whiteSpace: 'nowrap' }}>
            <AppLink href={link} sx={{ fontWeight: 'regular' }}>
              {t(`product-hub.help.${translationKey}`)}
            </AppLink>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
