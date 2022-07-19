import { MagicLinkMessage } from './magicLink'

export function getMessageKey(msg: MagicLinkMessage) {
  switch (msg.kind) {
    case 'emailIsInvalid':
      return 'email-invalid'
  }
}

export function MagicLinkForm() {
  // const { t } = useTranslation()
  // const { magicLinkConnect$ } = useAppContext()
  // const magicLinkConnect = useObservable(magicLinkConnect$)
  // const [inputFocus, setInputFocus] = useState(false)
  //
  // if (!magicLinkConnect) return null
  //
  // const { email, change, login, messages } = magicLinkConnect
  // const showError = messages.length > 0 && !inputFocus
  //
  // return (
  //   <Grid>
  //     <Heading as="h1" sx={{ mb: 3 }}>
  //       {t('connect-email')}
  //     </Heading>
  //     <Grid
  //       as="form"
  //       onSubmit={(e) => {
  //         e.preventDefault()
  //         login && login()
  //       }}
  //       sx={{ width: '100%' }}
  //     >
  //       <Input
  //         placeholder={t('email')}
  //         variant={showError ? 'inputSurfaceError' : 'inputSurface'}
  //         value={email}
  //         onChange={(e) => change!({ kind: 'email', email: e.target.value })}
  //         onFocus={() => setInputFocus(true)}
  //         onBlur={() => setInputFocus(false)}
  //       />
  //       {showError && (
  //         <Text variant="error" sx={{ textAlign: 'left' }}>
  //           {messages.map((msg) => t(getMessageKey(msg)))}
  //         </Text>
  //       )}
  //       <Button variant="primarySquare" disabled={!login} type="submit">
  //         {t('continue')}
  //       </Button>
  //     </Grid>
  //     <Flex sx={{ alignItems: 'center', justifyContent: 'center' }} mt={2}>
  //       <Text sx={{ color: 'neutral80' }}>{t('powered-by')}</Text>
  //       <Icon name="magic_link" sx={{ ml: 2, mt: 1 }} size="auto" width="62px" height="24px" />
  //     </Flex>
  //   </Grid>
  // )
}
