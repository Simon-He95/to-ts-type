import { createExtension, createPosition, createRange, getCopyText, getSelection, insertText as insertSnippetText, message, registerCommand, updateText } from '@vscode-use/utils'
import { getBeforeFirstNotSpaceChar, getType, parseClipboardData } from './utils'

export = createExtension(() => {
  registerCommand('to-ts-type.transform', async () => {
    const text = await getCopyText()
    if (!text)
      return

    const parsed = parseClipboardData(text)
    const maybeStructured = /^\s*(?:[{[]|export\s+default\s+|return\s+|(?:const|let|var)\s+)/.test(text)
    if (parsed === undefined && maybeStructured) {
      message.warn({
        message: 'to-ts-type: parse failed, falling back to string',
        buttons: [],
        detail: 'Clipboard is not valid JSON / JS object literal (comments are OK).',
      })
    }
    const type = parsed === undefined ? getType(text) : getType(parsed)
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
