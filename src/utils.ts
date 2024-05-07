import { isNum } from 'lazy-js-utils'

export function getType(obj: any): string {
  if (Array.isArray(obj)) {
    const item = obj[0]
    if (item === undefined) {
      // 空数组
      return '[]'
    }
    if (obj.length === 1) {
      if (typeof item === 'string')
        return 'string[]'
      else if (isNum(item))
        return 'number[]'
      else if (typeof item === 'object')
        return `${getType(item)}[]`
    }

    const r = [...new Set(obj.map((o) => {
      if (typeof o === 'string')
        return 'string'
      else if (isNum(o))
        return 'number'
      else if (typeof o === 'object')
        return getType(item)
      else if (o instanceof Function)
        return 'Function'
      return 'unknown'
    }))]
    return r.length === 1
      ? `${r[0]}[]`
      : `(${r.join(' | ')})[]`
  }
  else if (obj === null) {
    return 'null'
  }
  else if (typeof obj === 'object') {
    const record: Record<string, any> = {}
    if (!Object.keys(obj).length)
      return 'Object'

    for (const key in obj) {
      const v = obj[key]
      record[key] = getType(v)
    }
    return `${Object.keys(record).reduce((result, key) => {
      const value = record[key]
      if (/[\:\-]/.test(key))
        key = `"${key}"`
      result += `\n  ${key}: ${value};`
      return result
    }, '{ ')}\n}`
  }
  else if (typeof obj === 'string') {
    return 'string'
  }
  else if (isNum(obj)) {
    return 'number'
  }
  else if (obj instanceof Function) {
    return 'Function'
  }
  else if (typeof obj === 'boolean') {
    return 'boolean'
  }
  else if (obj) {
    return obj.toString()
  }
  else {
    return 'any'
  }
}
