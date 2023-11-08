import { Icon } from 'components/Icon'
import type { PortfolioWalletHistoryResponse } from 'components/portfolio/wallet-history/types'
import dayjs from 'dayjs'
import { formatAddress } from 'helpers/formatters/format'
import React from 'react'
import { question_o } from 'theme/icons'
import { Box, Flex } from 'theme-ui'
import { timeAgo } from 'utils'
export const PortfolioWalletHistory = ({
  walletHistoryData,
}: {
  walletHistoryData: PortfolioWalletHistoryResponse
}) => {
  const { history_list, cate_dict } = walletHistoryData
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      {history_list.map((historyItem) => {
        const parsedTime = dayjs.unix(historyItem.time_at).toDate()
        return (
          <Flex
            key={historyItem.id}
            sx={{
              p: 2,
              borderRadius: 'large',
              alignItems: 'center',
              ':hover': {
                backgroundColor: 'neutral30',
              },
            }}
          >
            <Icon
              icon={question_o}
              size="32px"
              sx={{
                color: 'white',
                mr: 2,
                backgroundColor: 'neutral20',
                borderRadius: 'round',
              }}
            />
            <Flex sx={{ flexDirection: 'column' }}>
              <Box>
                {cate_dict[historyItem.cate_id as keyof typeof cate_dict]?.id || 'Unknown action'}
              </Box>
              <Box>
                {timeAgo({ to: parsedTime, from: new Date() })}
                {formatAddress(historyItem.tx.to_addr, 6)}
              </Box>
            </Flex>
          </Flex>
        )
      })}
    </Flex>
  )
}
