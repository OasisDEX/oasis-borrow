import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import React, { useRef, useState } from 'react'
import { Box, Card, Divider, Flex, Text, Textarea } from 'theme-ui'

import { fadeInAnimation } from '../../theme/animations'
import { UserReferralState } from './user'

interface Props {
  context: Context
  address: string
  userReferral: UserReferralState
}

export function ReferralsView({ address, userReferral }: Props) {
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
        minHeight: '608px',
        height: '100%',
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
        /*    onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave} */
      >
        {' '}
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'start',
            height: '100%',
          }}
        >
          <Box sx={{ pb: '32px' }}>
            <Text
              sx={{
                color: 'text.body',
                fontSize: 4,
              }}
              variant="strong"
            >
              {t('ref.link')}
            </Text>

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
                {`https://oasis.app/?ref=${address.slice(0, 7)}...${address.slice(-6)}`}
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
                }}
                variant="inText"
                onClick={() => copyToClipboard()}
              >
                <Icon name="copy" sx={{ mr: '8px' }} /> {copied ? 'Link Copied' : `Copy Link`}
              </Text>
            </Flex>
            <Box sx={{ pt: '12px' }}>
              <Text variant="text.paragraph3">{t('ref.explanation')}</Text>
              <AppLink href={`https://kb.oasis.app/`} sx={{ fontSize: 2 }} variant="inText">
                {t('ref.faq-link')}
              </AppLink>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ py: '32px' }}>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 4,
              }}
              variant="strong"
            >
              {t('ref.you-referred')}
            </Text>
            {userReferral.referrals &&
              userReferral.referrals.map((item, index) => (
                <Box key={index}>
                  <Flex sx={{ pt: '12px', flexWrap: 'wrap', alignItems: 'center' }} key={index}>
                    <Box sx={{ flex: '1 1 auto' }}>
                      <Text
                        sx={{
                          color: 'text.subtitle',
                          overflowWrap: 'break-word',
                          fontSize: 2,
                        }}
                        variant="subtitle"
                      >
                        {item}{' '}
                      </Text>
                    </Box>
                    <Box>
                      <AppLink
                        href={`https://etherscan.com/account/${item}`}
                        sx={{ fontSize: 2 }}
                        variant="inText"
                      >
                        {' '}
                        Etherscan
                      </AppLink>
                    </Box>
                  </Flex>
                </Box>
              ))}
            {userReferral.referrals && userReferral.referrals.length === 0 && (
              <Box>
                <Flex sx={{ pt: '12px', flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 auto' }}>
                    <Text
                      sx={{
                        color: 'text.subtitle',
                        overflowWrap: 'break-word',
                        fontSize: 2,
                      }}
                      variant="subtitle"
                    >
                      You have no referrals
                    </Text>
                  </Box>
                  <Box>
                    <AppLink
                      href={`https://etherscan.com/account/#`}
                      sx={{ fontSize: 2 }}
                      variant="inText"
                    >
                      {' '}
                    </AppLink>
                  </Box>
                </Flex>
              </Box>
            )}
          </Box>
          <Box>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 4,
              }}
              variant="strong"
            >
              {t('ref.referred-you')}
            </Text>

            <Flex sx={{ pt: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 auto' }}>
                <Text
                  sx={{
                    color: 'text.subtitle',
                    overflowWrap: 'break-word',
                    fontSize: 2,
                  }}
                  variant="subtitle"
                >
                  {userReferral.user?.user_that_referred_address && userReferral.user?.user_that_referred_address.toString()}{' '}
                  {!userReferral.user?.user_that_referred_address && `You were not referred`}
                </Text>
              </Box>
              <Box>
                <AppLink
                  href={`https://etherscan.com/account/#`}
                  sx={{ fontSize: 2 }}
                  variant="inText"
                >
                  {' '}
                  Etherscan
                </AppLink>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}
