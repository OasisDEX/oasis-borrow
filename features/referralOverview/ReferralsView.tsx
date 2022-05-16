import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { formatAddress } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useRef, useState } from 'react'
import { Box, Card, Flex, Text, Textarea } from 'theme-ui'

import { fadeInAnimation } from '../../theme/animations'
import { UserReferralState } from './user'

interface Props {
  context: Context
  address: string
  userReferral: UserReferralState
}

export function ReferralsView({ address }: Props) {
  const { t } = useTranslation()

  const clipboardContentRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)

  function copyToClipboard() {
    const clipboardContent = clipboardContentRef.current

    if (clipboardContent) {
      clipboardContent.select()
      document.execCommand('copy')
      setCopied(true)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Card
        sx={{
          backgroundColor: '#ffffff',
          borderColor: 'border',
          borderWidth: '1px',
          borderTop: 'none',
          p: 4,
          height: '100%',
          ...fadeInAnimation,
        }}
      >
        {' '}
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'start',
            height: '100%',
          }}
        >
          <Box>
            <Text variant="text.paragraph2">{t('ref.link')}</Text>

            <Flex
              sx={{
                mt: '12px',
                py: '16px',
                pl: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(90.63deg, #F0F3FD 1.31%, #FCF0FD 99.99%)',
                borderRadius: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <AppLink
                href={`https://oasis.app/?ref=${address}`}
                sx={{ fontSize: 4, flex: '1 1 auto' }}
                variant="inText"
              >
                {`https://oasis.app/?ref=${formatAddress(address, 6)}`}
              </AppLink>
              <Textarea
                ref={clipboardContentRef}
                sx={{ position: 'absolute', top: '-1000px', left: '-1000px' }}
                value={`https://oasis.app/?ref=${address}`}
                readOnly
              />
              <Text
                sx={{
                  fontSize: 1,
                  pr: '24px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  color: 'link',
                  cursor: 'pointer',
                }}
                variant="inText"
                onClick={() => copyToClipboard()}
              >
                <Icon name="copy" sx={{ mr: '8px' }} /> {copied ? 'Link Copied' : `Copy Link`}
              </Text>
            </Flex>
            <Box sx={{ pt: '12px' }}>
              <Text variant="text.label">{t('ref.explanation')}</Text>
            </Box>
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}
