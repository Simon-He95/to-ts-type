import { createExtension, createPosition, createRange, getCopyText, getSelection, insertText as insertSnippetText, registerCommand, updateText } from '@vscode-use/utils'
import { useJSONParse } from 'lazy-js-utils'
import { getBeforeFirstNotSpaceChar, getType } from './utils'

export = createExtension(() => {
  registerCommand('to-ts-type.transform', async () => {
    const text = await getCopyText()
    if (!text)
      return
    // text 需要过滤 一些注释比如// 或者 /** */
    let obj
    try {
      obj = useJSONParse(text)
    }
    catch (error) {
      console.error(error)
    }

    const type = getType(obj) || getType(text)
    const { line, character, lineText, selection } = getSelection()!
    const [beforeChar, newChar] = getBeforeFirstNotSpaceChar(lineText, character)

    let insertText = ''
    if (beforeChar === '(') {
      insertText = `<${type}>`
    }
    else if (/[:<=]/.test(beforeChar)) {
      insertText = type
    }
    else if (beforeChar) {
      if (beforeChar === 't' && lineText.slice(newChar - 'export'.length + 1, newChar + 1) === 'export')
        insertText = type
      else
        insertText = `: ${type}`
    }
    else {
      insertText = `type \${1:IType} = ${type}`
    }
    const { start, end } = selection
    if (start.line !== end.line || start.character !== end.character) {
      //  替换
      updateText((edit) => {
        edit.replace(createRange(start.line, start.character, end.line, end.character), insertText.replace(/^: /, ''))
      })
    }
    else {
      insertSnippetText(insertText, createPosition(line, character))
    }
  })
})
