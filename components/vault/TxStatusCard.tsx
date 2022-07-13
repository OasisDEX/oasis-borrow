import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Link, Spinner, Text } from 'theme-ui'

export interface TxStatusCardProgressProps {
  text: string
  txHash: string
  etherscan: string
}

export function TxStatusCardProgress({ text, txHash, etherscan }: TxStatusCardProgressProps) {
  const { t } = useTranslation()
  return (
    <Card sx={{ backgroundColor: 'warning10', border: 'none', p: 2, px: 3, borderRadius: 'round' }}>
      <Flex sx={{ alignItems: 'center', p: 1 }}>
        <Spinner size={20} color="warning100" />
        <Grid pl={2} gap={0}>
          <Text variant="paragraph3" color="warning100">
            {text}
          </Text>
          <Link href={`${etherscan}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            <Text variant="paragraph4" sx={{ fontWeight: 'semiBold' }} color="warning100">
              {t('view-on-etherscan')}
            </Text>
          </Link>
        </Grid>
      </Flex>
    </Card>
  )
}

export function TxStatusCardSuccess({
  text,
  txHash,
  etherscan,
}: {
  text: string
  txHash: string
  etherscan: string
}) {
  const { t } = useTranslation()
  return (
    <Card sx={{ backgroundColor: 'success10', border: 'none', p: 2, borderRadius: 'round' }}>
      <Flex sx={{ alignItems: 'center', p: 1 }}>
        <Icon name="checkmark" size={20} color="success100" />
        <Grid pl={2} gap={0}>
          <Text variant="paragraph3" color="success100">
            {text}
          </Text>
          <Link href={`${etherscan}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            <Text
              variant="paragraph4"
              sx={{
                fontWeight: 'semiBold',
                display: 'flex',
                alignItems: 'center',
              }}
              color="success100"
            >
              {t('view-on-etherscan')}
            </Text>
          </Link>
        </Grid>
      </Flex>
    </Card>
  )
}
