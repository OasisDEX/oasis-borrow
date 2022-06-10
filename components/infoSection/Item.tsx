import { useState } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box, Flex, Grid, IconButton, Text } from 'theme-ui'
// import { Item } from "./Item";

export interface DropDownValue {
  title: string
  value: string
}

export interface ItemProps {
  title: string
  value?: string
  dropdownValues?: DropDownValue[]
}

export function Item({ title, dropdownValues, value }: ItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <li
      style={{
        fontSize: theme.fontSizes[1],
        fontWeight: theme.fontWeights.semiBold,
      }}
    >
      <Flex>
        <Text
          sx={{
            mr: 'auto',
            color: theme.colors.text.subtitle,
          }}
        >
          {title}
        </Text>
        <Box>
          <Box>
            <Text
              sx={{
                color: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {value}
              {dropdownValues?.length && (
                <IconButton
                  onClick={() => setOpen(!open)}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    width: 'fit-content',
                    display: 'flex',
                    justifyContent: 'right',
                    ml: 1,
                  }}
                >
                  <svg
                    style={{ transform: open ? 'rotate(180deg)' : '' }}
                    width="9"
                    height="6"
                    viewBox="0 0 9 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.2998 1.3999L4.4998 4.9999L7.6998 1.3999"
                      stroke="black"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </IconButton>
              )}
            </Text>
          </Box>
        </Box>
      </Flex>
      {open && (
        <Grid as="ul" gap={2} sx={{ p: 0, m: 0, pl: theme.space[3], mt: 2, listStyle: 'none' }}>
          {dropdownValues && dropdownValues.map((item) => <Item {...item} />)}
        </Grid>
      )}
    </li>
  )
}
