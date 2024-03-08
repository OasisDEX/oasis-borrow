import { Icon } from 'components/Icon'
import React from 'react'
import { arrow_left, arrow_right } from 'theme/icons'
import { Button, Flex, Text } from 'theme-ui'

interface AssetsTablePaginationProps {
  page: number
  totalPages: number
  onNextPage: () => void
  onPrevPage: () => void
}

export function AssetsTablePagination({
  onNextPage,
  onPrevPage,
  page,
  totalPages,
}: AssetsTablePaginationProps) {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: '24px',
        mx: '-32px',
        mt: '24px',
        pt: '24px',
        borderTop: '1px solid',
        borderTopColor: 'neutral20',
      }}
    >
      <Button
        variant="action"
        onClick={onPrevPage}
        disabled={page - 1 < 1}
        sx={{ width: '36px', height: '36px', p: 0 }}
      >
        <Icon icon={arrow_left} size="16px" sx={{ display: 'block', mx: 'auto' }} />
      </Button>
      <Text variant="paragraph4">
        {page} / {totalPages}
      </Text>
      <Button
        variant="action"
        onClick={onNextPage}
        disabled={page + 1 > totalPages}
        sx={{ width: '36px', height: '36px', p: 0 }}
      >
        <Icon icon={arrow_right} size="16px" sx={{ display: 'block', mx: 'auto' }} />
      </Button>
    </Flex>
  )
}
