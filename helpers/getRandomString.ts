export function getRandomString() {
  let randomString = ''
  let randomValue = ''

  const buffer = new Uint8Array(16)
  crypto.getRandomValues(buffer)
  buffer[6] = (buffer[6] & 0x0f) | 0x40
  buffer[8] = (buffer[8] & 0x3f) | 0x80

  for (let i = 0; i < 16; i++) {
    randomValue = buffer[i].toString(16)
    if (randomValue.length === 1) {
      randomValue = '0' + randomValue
    }
    randomString += randomValue
  }

  return randomString
}
