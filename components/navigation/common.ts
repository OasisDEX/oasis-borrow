export function mobileLinkSx(isOpen: boolean) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 1,
    width: '100%',
    py: '14px',
    px: 3,
    fontSize: 2,
    lineHeight: '18px',
    color: isOpen ? 'primary100' : 'neutral80',
    textDecoration: 'none',
    fontWeight: 'semiBold',
    borderRadius: 'medium',
    bg: 'neutral10',
    transition: 'color 200ms, background-color 200ms',
    '&:hover': {
      color: 'primary100',
      bg: 'neutral30',
    },
  }
}
