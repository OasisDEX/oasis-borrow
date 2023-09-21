import { Icon } from '@makerdao/dai-ui-icons'
import type { WithChildren } from 'helpers/types/With.types'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'

export function OrderInformationTooltipAction({ children }: WithChildren) {
  const [isOpen, setIsOpen] = useState(false)

  const componentRef = useOutsideElementClickHandler(() => setIsOpen(false))

  return (
    <Flex ref={componentRef} sx={{ position: 'relative' }}>
      <Icon
        name="question_o"
        size="20px"
        sx={{ ml: 1 }}
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      />
      <Box
        sx={{
          transform: 'translateY(-100%)',
          top: '-15px',
          display: isOpen ? 'block' : 'none',
          p: 0,
          position: 'absolute',
          right: 0,
          width: '300px',
          bg: 'neutral10',
          boxShadow: 'elevation',
          borderRadius: 'mediumLarge',
          border: 'none',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {children}
      </Box>
    </Flex>
  )
}
