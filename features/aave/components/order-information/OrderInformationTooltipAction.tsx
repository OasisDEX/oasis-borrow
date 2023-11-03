import { Icon } from 'components/Icon'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import type { PropsWithChildren } from 'react'
import React, { useState } from 'react'
import { question_o } from 'theme/icons'
import { Box, Flex } from 'theme-ui'

export function OrderInformationTooltipAction({ children }: PropsWithChildren<{}>) {
  const [isOpen, setIsOpen] = useState(false)

  const componentRef = useOutsideElementClickHandler(() => setIsOpen(false))

  return (
    <Flex ref={componentRef} sx={{ position: 'relative' }}>
      <Icon
        icon={question_o}
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
