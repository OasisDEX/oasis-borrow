import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import {
  getTwitterShareUrl,
  twitterSharePositionText,
  twitterSharePositionVia,
} from 'features/follow/common/ShareButton'
import getConfig from 'next/config'
import React from 'react'
import { Box, Button, Flex } from 'theme-ui'

const basePath = getConfig()?.publicRuntimeConfig?.basePath

interface AssetsTableDataCellActionProps {
  cta?: string
  disabled?: boolean
  link?: string
  newTab?: boolean
  shareButton?: boolean
  onClick?: () => void
}

export function AssetsTableDataCellAction({
  cta = 'View',
  disabled = false,
  link,
  newTab = false,
  shareButton,
  onClick,
}: AssetsTableDataCellActionProps) {
  return (
    <Flex sx={{ justifyContent: 'flex-end' }}>
      {link ? (
        <>
          <AppLink
            href={link}
            sx={{ flexGrow: [1, null, null, 'initial'], pointerEvents: disabled ? 'none' : 'auto' }}
            internalInNewTab={newTab}
          >
            <AssetsTableDataCellAction cta={cta} disabled={disabled} onClick={onClick} />
          </AppLink>
          {shareButton && (
            <AppLink
              href={getTwitterShareUrl({
                text: twitterSharePositionText,
                url: `${basePath}${link}`,
                via: twitterSharePositionVia,
              })}
              sx={{ ml: 2 }}
            >
              <Button
                variant="tertiary"
                sx={{
                  width: '36px',
                  height: '36px',
                  pt: '3px',
                  pr: 0,
                  pb: 0,
                  pl: '2px',
                  mr: '1px',
                  mb: '3px',
                }}
              >
                <Icon name="share" size={18} />
              </Button>
            </AppLink>
          )}
        </>
      ) : (
        <Button
          variant="tertiary"
          sx={{ width: ['100%', null, null, 'auto'] }}
          disabled={disabled}
          onClick={onClick}
        >
          <Box sx={{ display: ['none', null, null, 'block'], position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
          {cta}
        </Button>
      )}
    </Flex>
  )
}
