import BigNumber from 'bignumber.js'

export function recursiveLog(thing: any, name: string, depth: number = 0, tag: string = '') {
  if (BigNumber.isBigNumber(thing)) {
    log(thing.toString(), name, depth, tag)
  } else if (typeof thing === 'object' && thing !== null) {
    log('(stepping into obj key)', name, depth, tag)
    Object.keys(thing).forEach((key) => {
      recursiveLog(thing[key], key, depth + 1, tag)
    })
  } else if (typeof thing === 'function') {
    log('(function)', name, depth, tag)
  } else {
    log(thing, name, depth, tag)
  }
}

function spaces(depth: number) {
  let ret = ''
  for (let i = 0; i < depth; i++) {
    ret += ' '
  }
  return ret
}

function log(value: any, name: string, depth: number, tag: string) {
  console.log(`${tag} - ${spaces(depth)} ${name}: ${value}`)
}
