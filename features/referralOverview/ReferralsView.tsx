import { useMainnetEnsName } from 'blockchain/ens'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { isAddress } from 'ethers/lib/utils'
import { formatAddress } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useRef, useState } from 'react'
import { fadeInAnimation } from 'theme/animations'
import { checkmark, duplicate } from 'theme/icons'
import { Box, Card, Flex, Text, Textarea } from 'theme-ui'

interface Props {
  address: string
}

function ReferralLink({ address }: Props) {
  const { t } = useTranslation()
  const clipboardAddressContentRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)

  function copyToClipboard() {
    const clipboardContent = clipboardAddressContentRef.current
    if (clipboardContent) {
      clipboardContent.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }
  return (
    <Flex
      sx={{
        mt: '12px',
        py: '4px',
        pl: '24px',
        fontWeight: 'semiBold',
        background: 'linear-gradient(90.63deg, #F0F3FD 1.31%, #FCF0FD 99.99%)',
        borderRadius: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <AppLink
        href={`${window.origin}/?ref=${address}`}
        sx={{ fontSize: 4, flex: '1 1 auto', my: '12px' }}
        variant="inText"
      >
        {`${window.origin}/?ref=${isAddress(address) ? formatAddress(address, 6) : address}`}
      </AppLink>
      <Textarea
        ref={clipboardAddressContentRef}
        sx={{ position: 'absolute', top: '-1000px', left: '-1000px' }}
        value={`${window.origin}/?ref=${address}`}
        readOnly
      />
      <Text
        variant="boldParagraph1"
        sx={{
          pr: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          color: 'interactive100',
          cursor: 'pointer',
          my: '12px',
        }}
        onClick={() => copyToClipboard()}
      >
        {copied ? (
          <Icon icon={checkmark} sx={{ mr: '8px' }} />
        ) : (
          <Icon icon={duplicate} sx={{ mr: '8px' }} />
        )}{' '}
        {copied ? t('ref.copied') : t('ref.copy')}
      </Text>
    </Flex>
  )
}

export function ReferralsView({ address }: Props) {
  const { t } = useTranslation()
  const [ensName] = useMainnetEnsName(address)
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        mt: '38px',
        mb: '4px',
      }}
    >
      <Card
        sx={{
          backgroundColor: 'neutral100',
          borderColor: 'border',
          borderWidth: '1px',
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
            <ReferralLink address={ensName || address} />
            <Box sx={{ pt: '12px' }}>
              <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
                {t('ref.explanation')}
              </Text>
            </Box>
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}
