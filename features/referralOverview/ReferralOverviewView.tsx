import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { NewReferralModal } from 'components/NewReferralModal'
import { useTranslation } from 'next-i18next'
import React, { useRef, useState } from 'react'
import { Box, Button, Card, Divider, Flex, Grid, Text, Textarea } from 'theme-ui'

import { useModal } from '../../helpers/modalHook'
import { fadeInAnimation } from '../../theme/animations'

const listOfReffered = [
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71',
]
const referrer = '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71'
const topEarners = {
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B71': 12312312123123,
  '0x3924fa215FAB8CC847f233dC10369518c9491EF7': 34534545345345,
  '0x4Eb7F19D6eFcACE59EaED70220da5002709f9B72': 12312312123123,
}
interface Props {
  context: Context
  address: string
}

export function ReferralOverviewView({ context, address }: Props) {
  const openModal = useModal()
  const { t } = useTranslation()
  const connectedAccount = context?.status === 'connected' ? context.account : undefined
  const clipboardContentRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)

  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  function copyToClipboard() {
    const clipboardContent = clipboardContentRef.current

    if (clipboardContent) {
      clipboardContent.select()
      document.execCommand('copy')
      setCopied(true)
    }
  }
  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      {/*  {connectedAccount && connectedAccount !== address ?  "Shame on you" : "It is you"} */}
      <Flex sx={{ mt: 5, mb: 4, flexDirection: 'column' }}>
        {isOwnerViewing && (
          <>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 7,
              }}
              variant="strong"
            >
              Referral
            </Text>
            <Grid
              columns={[1, null, 2]}
              sx={{
                justifyItems: 'center',
                /* ...slideInAnimation, */
                position: 'relative',
                width: '100%',
                gap: 4,
                margin: '0 auto',
              }}
            >
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
                        <AppLink href="#" sx={{ fontSize: 4, flex: '1 1 auto' }} variant="inText">
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
                          <Icon name="copy" sx={{ mr: '8px' }} />{' '}
                          {copied ? 'Link Copied' : `Copy Link`}
                        </Text>
                      </Flex>
                      <Box sx={{ pt: '12px' }}>
                        <Text variant="text.paragraph3">{t('ref.explanation')}</Text>
                        <AppLink
                          href={`https://kb.oasis.app/`}
                          sx={{ fontSize: 2 }}
                          variant="inText"
                        >
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
                      {listOfReffered.map((item) => (
                        <>
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
                        </>
                      ))}
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
                            {referrer}{' '}
                          </Text>
                        </Box>
                        <Box>
                          <AppLink
                            href={`https://etherscan.com/account/${referrer}`}
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
              </Box>{' '}
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
                          color: 'text.subtitle',

                          fontSize: 3,
                        }}
                        variant="strong"
                      >
                        {/* {t('ref.total')} */} Total DAI fees earned
                      </Text>
                      <Text
                        sx={{
                          fontSize: '40px',
                        }}
                        variant="strong"
                      >
                        $11,550.02 DAI{' '}
                      </Text>
                    </Box>
                    <Box sx={{}}>
                      <Flex sx={{ pt: '12px', flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 auto' }}>
                          <Text
                            sx={{
                              color: 'text.subtitle',

                              fontSize: 4,
                            }}
                            variant="strong"
                          >
                            {/* {t('ref.notClaimed')} */} DAI fees not claimed yet
                          </Text>
                          <Text
                            sx={{
                              color: 'text',
                              pt: '12px',
                              pb: '12px',
                              fontSize: 5,
                            }}
                            variant="strong"
                          >
                            $1,200.00 DAI
                          </Text>
                        </Box>
                        <Flex sx={{ alignItems: 'center' }}>
                          <Button
                            variant="secondary"
                            sx={{
                              textAlign: 'center',
                              px: '12px',
                              verticalAlign: 'baseline',
                              fontSize: 'inherit',
                            }}
                          >
                            {/* {t('ref.claim')} */} Claim DAI fees
                          </Button>
                          <Button
                            variant="secondary"
                            sx={{
                              textAlign: 'center',
                              px: '12px',
                              verticalAlign: 'baseline',
                              fontSize: 'inherit',
                            }}
                            onClick={() => openModal(NewReferralModal, { referrer: referrer })}
                          >
                            {/* {t('ref.claim')} */} Fake butt
                          </Button>
                        </Flex>
                      </Flex>
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
                        {/* {t('ref.top')} */} Top earners
                      </Text>
                      {Object.keys(topEarners).map((item) => (
                        <>
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
                        </>
                      ))}
                    </Box>
                  </Flex>
                </Card>
              </Box>
            </Grid>
          </>
        )}
      </Flex>
    </Grid>
  )
}
