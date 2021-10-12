import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Flex, Grid, Link, Spinner, Text } from 'theme-ui'

export function TxStatusCardProgress({
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
    <Card sx={{ backgroundColor: 'warning', border: 'none', p: 2, px: 3, borderRadius: 'round' }}>
      <Flex sx={{ alignItems: 'center', p: 1 }}>
        <Spinner size={20} color="onWarning" />
        <Grid pl={2} gap={0}>
          <Text variant="paragraph3" color="onWarning">
            {text}
          </Text>
          <Link href={`${etherscan}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            <Text variant="paragraph4" sx={{ fontWeight: 'semiBold' }} color="onWarning">
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
    <Card sx={{ backgroundColor: 'success', border: 'none', p: 2, borderRadius: 'round' }}>
      <Flex sx={{ alignItems: 'center', p: 1 }}>
        <Icon name="checkmark" size={20} color="onSuccess" />
        <Grid pl={2} gap={0}>
          <Text variant="paragraph3" color="onSuccess">
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
              color="onSuccess"
            >
              {t('view-on-etherscan')}
            </Text>
          </Link>
        </Grid>
      </Flex>
    </Card>
  )
}
