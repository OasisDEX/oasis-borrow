import axios from 'axios'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { ethers } from 'ethers'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Button, Card, Divider, Flex, Text } from 'theme-ui'
import { Spinner } from 'theme-ui'
import { MerkleRedeemer } from 'types/ethers-contracts/'

import { default as goerliAddresses } from '../../blockchain/addresses/goerli.json'
import { fadeInAnimation } from '../../theme/animations'
import { UserReferralState } from './user'

const merkleRedeemer = require('../../blockchain/abi/merkle-redeemer.json')

interface Props {
  context: Context
  userReferral: UserReferralState
}

export function FeesView({ userReferral }: Props) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)

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
        await tx.wait(1)
        
        await axios.post('/api/user/claims/update', {
          user_address: userReferral.user?.address,
          week_number: weeks.map((v) => Number(v)),
        })
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
              {t('ref.total')}
            </Text>
            <Text
              sx={{
                fontSize: '40px',
              }}
              variant="strong"
            >
              {`${ethers.utils.formatEther(
                ethers.BigNumber.from(userReferral.user?.total_amount),
              )} DAI`}
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
                  {t('ref.not-claimed')}
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
                  {userReferral.claims &&
                    `${ethers.utils.formatEther(
                      userReferral.claims.amounts.reduce(
                        (p, c) => p.add(c),
                        ethers.BigNumber.from('0'),
                      ),
                    )} DAI`}
                </Text>
              </Box>
              <Flex sx={{ alignItems: 'center' }}>
                <Button
                  variant="secondary"
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
                  {!processing ? t('ref.claim') : null}
                </Button>
              </Flex>
            </Flex>
          </Box>
          <Divider sx={{ mt: '16px' }} />
          <Box sx={{ py: '32px' }}>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 4,
              }}
              variant="strong"
            >
              {t('ref.top')}
            </Text>
            {userReferral.topEarners?.map((item, index) => (
              <Box key={index}>
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
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}
