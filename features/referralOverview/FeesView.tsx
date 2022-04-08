import { User } from '@prisma/client'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { ethers } from 'ethers'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Button, Card, Divider, Flex, Text } from 'theme-ui'
import { MerkleRedeemer } from 'types/ethers-contracts/'

import { default as goerliAddresses } from '../../blockchain/addresses/goerli.json'
import { fadeInAnimation } from '../../theme/animations'

const merkleRedeemer = require('../../blockchain/abi/merkle-redeemer.json')

interface Props {
  context: Context

  claims: {
    weeks: ethers.BigNumber[]
    amounts: ethers.BigNumber[]
    proofs: string[][]
  }
  user: User
  topEarners: User[]
}

// TODO divide Overview into two separate files FeesView and ReferralsView
export function FeesView({ claims, user, topEarners }: Props) {
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
    // @ts-ignore
    const merkleRedeemerContract: MerkleRedeemer = new ethers.Contract(
      goerliAddresses.MERKLE_REDEEMER,
      merkleRedeemer,
      signer,
    )
    let tx
    try {
      tx = await merkleRedeemerContract.claimMultiple(weeks, amounts, proofs)
      if (tx) {
        await tx.wait(1)
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
              {`${user?.total_amount} DAI`}
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
                  {claims &&
                    `${ethers.utils.formatEther(
                      claims.amounts.reduce((p, c) => p.add(c), ethers.BigNumber.from('0')),
                    )} DAI`}
                </Text>
              </Box>
              <Flex sx={{ alignItems: 'center' }}>
                <Button
                  variant="secondary"
                  disabled={claims?.amounts.length ===0}
                  sx={{
                    textAlign: 'center',
                    px: '12px',
                    verticalAlign: 'baseline',
                    fontSize: 'inherit',
                  }}
                  onClick={() =>
                    claims ? claimFees(claims.weeks, claims.amounts, claims.proofs) : null
                  }
                >
                  {!processing ? t('ref.claim') : 'Claiming DAI fees'}
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
            {topEarners?.map((item, index) => (
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
                      {item.address}{' '}
                    </Text>
                  </Box>
                  <Box>
                    <AppLink
                      href={`https://etherscan.com/account/${item.address}`}
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
