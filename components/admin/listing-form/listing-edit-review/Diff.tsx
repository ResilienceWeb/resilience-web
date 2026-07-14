import * as diff from 'diff'

const styles = {
  added: {
    color: 'green',
    backgroundColor: '#b5efdb',
  },
  removed: {
    color: 'red',
    backgroundColor: '#fec4c0',
    textDecoration: 'line-through',
  },
}

type Props = {
  label?: string
  string1: string | null | undefined
  string2: string | null | undefined
  mode?: 'characters' | 'words'
}

export default function Diff({
  label,
  string1,
  string2,
  mode = 'words',
}: Props) {
  const str1 = string1 ?? ''
  const str2 = string2 ?? ''

  if (!str1 && !str2) return null
  if (str1 === str2) return null

  let groups = []

  if (mode === 'characters') groups = diff.diffChars(str1, str2)
  if (mode === 'words') groups = diff.diffWords(str1, str2)

  const mappedNodes = groups.map((group, index) => {
    const { value, added, removed } = group
    let nodeStyles
    if (added) nodeStyles = styles.added
    if (removed) nodeStyles = styles.removed
    return (
      <span style={nodeStyles} key={index}>
        {value}
      </span>
    )
  })

  return (
    <div>
      {label && <h3 className="mt-2 text-lg font-semibold">{label}</h3>}
      <span>{mappedNodes}</span>
      {str1 !== '' && str2 === '' && (
        <span className="ml-1 inline text-gray-600 italic">(deleted)</span>
      )}
    </div>
  )
}
