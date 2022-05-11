import { Icon } from '@makerdao/dai-ui-icons'
import axios from 'axios'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { ethers } from 'ethers'
import { formatAddress } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Button, Card, Divider, Flex, Grid, Text } from 'theme-ui'
import { Spinner } from 'theme-ui'
import { MerkleRedeemer } from 'types/ethers-contracts/'

import { default as goerliAddresses } from '../../blockchain/addresses/goerli.json'
import { fadeInAnimation } from '../../theme/animations'
// import { ManageClaimButton } from "./ManageClaimButton"
import { UserReferralState } from './user'
const merkleRedeemer = require('../../blockchain/abi/merkle-redeemer.json')

interface Props {
  context: Context
  userReferral: UserReferralState
}

export function FeesView({ userReferral }: Props) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const createUser = async (accept: boolean, referred: boolean) => {
    await axios.post(`/api/user/create`, {
      user_that_referred_address: referred ? userReferral?.user?.user_that_referred_address : null,
      address: userReferral.user?.address,
      accepted: accept,
    })
  }
  const claimFees = async (
    weeks: ethers.BigNumberish[],
    amounts: ethers.BigNumberish[],
    proofs: ethers.utils.BytesLike[][],
  ): Promise<string | undefined> => {
    setProcessing(true)
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const merkleRedeemerContract = new ethers.Contract(
      goerliAddresses.MERKLE_REDEEMER,
      merkleRedeemer,
      signer,
    ) as MerkleRedeemer

    let tx
    try {
      tx = await merkleRedeemerContract.claimMultiple(weeks, amounts, proofs)
      console.log(tx)
      if (tx) {
        await tx.wait(0)

        await axios.post('/api/user/claims/update', {
          user_address: userReferral.user?.address,
          week_number: weeks.map((v) => Number(v)),
        })
        setProcessing(false)
        return tx.hash
      }
      setProcessing(false)
    } catch (error) {
      setProcessing(false)
      return undefined
    }
    return undefined
  }
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pb: '40px',
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
        <Grid
          columns={[1, 3, 3]}
          /* sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: "wrap"
          }} */
        >
          <Box sx={{ py: 1 }}>
            <Text
              sx={{
                color: 'text.subtitle',

                fontSize: 1,
              }}
              variant="strong"
            >
              {t('ref.total')}
            </Text>
            <Text
              sx={{
                fontSize: 7,
              }}
              variant="strong"
            >
              {`${ethers.utils.formatEther(
                ethers.BigNumber.from(userReferral.user?.total_amount),
              )}`}{' '}
              <span style={{ fontSize: '18px' }}>DAI</span>
            </Text>
          </Box>
          <Box sx={{ py: 1 }}>
            <Box sx={{ flex: '1 1 auto' }}>
              <Text
                sx={{
                  color: 'text.subtitle',
                  fontSize: 1,
                }}
                variant="strong"
              >
                {t('ref.not-claimed')}
              </Text>
              <Text
                sx={{
                  fontSize: 7,
                }}
                variant="strong"
              >
                {userReferral.claims &&
                  `${ethers.utils.formatEther(
                    userReferral.claims.amounts.reduce(
                      (p, c) => p.add(c),
                      ethers.BigNumber.from('0'),
                    ),
                  )}`}{' '}
                <span style={{ fontSize: '18px' }}>DAI</span>
              </Text>
            </Box>
          </Box>
          <Flex sx={{ alignItems: ['start', 'end','end'], flexDirection: 'column', py: 1 }}>
            {/*  <ManageClaimButton {...state}/> */}
            {/*  <Button
                variant="secondary"
                disabled={userReferral.state === 'currentUserNoClaims'}
                onClick={() =>
                  //@ts-ignore
                  userReferral.performClaimMultiple()
                }
              >
                {processing ? (
                  <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text sx={{ position: 'relative' }} pl={2}>
                      <Spinner
                        size={25}
                        color="main"
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translate(-105%, -50%)',
                        }}
                      />
                      {'Claiming DAI fees'}
                    </Text>
                  </Flex>
                ) : null}
                {!processing
                  ? userReferral.claims?.amounts.length === 0
                    ? 'Nothing to claim'
                    : t('ref.claim')
                  : null}
              </Button> */}
            <Button
              variant="outline"
              disabled={userReferral.claims?.amounts.length === 0 || processing}
              onClick={() =>
                userReferral.claims
                  ? claimFees(
                      userReferral.claims.weeks,
                      userReferral.claims.amounts,
                      userReferral.claims.proofs,
                    )
                  : null
              }
              sx={{ p: '4px' }}
            >
              <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                {processing ? (
                  <Spinner size={30} color="main" />
                ) : (
                  <Icon name="dai_circle_color" size="30px" />
                )}
                <Text px="2" sx={{ whiteSpace: 'nowrap' }}>
                  {!processing
                    ? userReferral.claims?.amounts.length === 0
                      ? 'No claims'
                      : t('ref.claim')
                    : 'Claiming'}
                </Text>
              </Flex>
            </Button>
          </Flex>
        </Grid>{' '}
        <Divider sx={{ my: '16px' }} />
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'start',
          }}
        >
          <Box sx={{ py: '20px' }}>
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
                      {t('ref.not-referred-yet')}
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
          <Box sx={{ py: '10px' }}>
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
                  {userReferral.user?.user_that_referred_address &&
                    userReferral.user?.accepted &&
                    userReferral.user?.user_that_referred_address.toString()}{' '}
                  {!userReferral.user?.user_that_referred_address &&
                    userReferral.user?.accepted &&
                    t(`ref.you-were-not-referred`)}
                  {userReferral.user?.user_that_referred_address &&
                    !userReferral.user?.accepted &&
                    `${t('ref.you-have-been-invited')} ${formatAddress(
                      userReferral.user?.user_that_referred_address,
                      6,
                    )}`}{' '}
                  {!userReferral.user?.user_that_referred_address &&
                    !userReferral.user?.accepted &&
                    t(`ref.you-were-not-referred`)}
                </Text>
              </Box>
              <Box>
                {userReferral.user?.user_that_referred_address && userReferral.user?.accepted && (
                  <AppLink
                    href={`https://etherscan.com/account/#`}
                    sx={{ fontSize: 2 }}
                    variant="inText"
                  >
                    {' '}
                    Etherscan
                  </AppLink>
                )}
                {userReferral.user?.user_that_referred_address && !userReferral.user?.accepted && (
                  <>
                    {' '}
                    <Button
                      sx={{ fontSize: 2 }}
                      variant="textual"
                      onClick={() => createUser(true, true)}
                    >
                      {' '}
                      {t(`ref.accept-invite`)}
                    </Button>
                    |
                    <Button
                      sx={{ fontSize: 2 }}
                      variant="textual"
                      onClick={() => createUser(false, false)}
                    >
                      {' '}
                      {t(`ref.reject-invite`)}
                    </Button>
                  </>
                )}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}
