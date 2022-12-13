import BigNumber from 'bignumber.js'

export function recursiveLog(thing: any, name: string, depth: number = 0) {
  if (BigNumber.isBigNumber(thing)) {
    log(thing.toString(), name, depth)
  } else if (typeof thing === 'object' && thing !== null) {
    log('(stepping into obj key)', name, depth)
    Object.keys(thing).forEach((key) => {
      recursiveLog(thing[key], key, depth + 1)
    })
  } else if (typeof thing === 'function') {
    log('(function)', name, depth)
  } else {
    log(thing, name, depth)
  }
}

function spaces(depth: number) {
  let ret = ''
  for (let i = 0; i < depth; i++) {
    ret += ' '
  }
  return ret
}

function log(value: any, name: string, depth: number) {
  console.log(`${spaces(depth)} ${name}: ${value}`)
}
