import BigNumber from 'bignumber.js'
import React from 'react'
import { Card, Flex, Image } from 'theme-ui'

import { formatAmount } from '../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'

interface ProtectionPillProps {
  value: BigNumber
}

export function ProtectionPill({ value }: ProtectionPillProps) {
  return (
    <Card
      sx={{
        background:
          'linear-gradient(92.87deg, rgba(184, 224, 233, 0.4) 13.82%, rgba(253, 219, 242, 0.4) 88.81%)',
        height: '34px',
        py: '5px',
        pl: '10px',
        width: 'fit-content',
        border: 'unset',
      }}
    >
      <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
        <Image src={staticFilesRuntimeUrl(`/static/img/protection.png`)} sx={{ mr: 2 }} />
        {`$${formatAmount(value, 'USD')}`}
      </Flex>
    </Card>
  )
}
