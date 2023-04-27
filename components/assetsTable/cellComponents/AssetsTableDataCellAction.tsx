import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import {
  getTwitterShareUrl,
  twitterSharePositionText,
  twitterSharePositionVia,
} from 'features/follow/common/ShareButton'
import getConfig from 'next/config'
import { Button, Flex } from 'theme-ui'

const basePath = getConfig()?.publicRuntimeConfig?.basePath

interface AssetsTableDataCellActionProps {
  cta?: string
  disabled?: boolean
  link?: string
  shareButton?: boolean
}

export function AssetsTableDataCellAction({
  cta = 'View',
  disabled = false,
  link,
  shareButton,
}: AssetsTableDataCellActionProps) {
  return (
    <Flex sx={{ justifyContent: 'flex-end' }}>
      {link ? (
        <>
          <AppLink href={link} sx={{ flexGrow: [1, null, null, 'initial'] }}>
            <AssetsTableDataCellAction cta={cta} disabled={disabled} />
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
        <Button variant="tertiary" sx={{ width: ['100%', null, null, 'auto'] }} disabled={disabled}>
          {cta}
        </Button>
      )}
    </Flex>
  )
}
