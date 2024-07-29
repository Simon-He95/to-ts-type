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
    return 'unknown'
  }
  else if (typeof obj === 'object') {
    const record: Record<string, any> = {}
    if (!Object.keys(obj).length)
      return 'object'

    for (const key in obj) {
      const v = obj[key]
      if (v === 'null') {
        // 根据一些常用名推断一下 是否是 string ｜ number, 否则返回 unknown
        if (/phone|name|desc|address|src|label|type/i.test(key)) {
          record[key] = 'string'
        }
        else {
          record[key] = 'unknown'
        }
      }
      else {
        record[key] = getType(v)
      }
    }
    return `${Object.keys(record).reduce((result, key) => {
      const value = record[key]
      if (/[:\-]/.test(key))
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

export function getBeforeFirstNotSpaceChar(text: string, character: number): [string, number] {
  for (let i = character - 1; i >= 0; i--) {
    if (text[i] && text[i] !== ' ')
      return [text[i], i]
  }
  return ['', character]
}
