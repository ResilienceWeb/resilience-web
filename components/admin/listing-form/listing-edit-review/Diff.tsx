import * as diff from 'diff'

const styles = {
  added: {
    color: 'green',
    backgroundColor: '#b5efdb',
  },
  removed: {
    color: 'red',
    backgroundColor: '#fec4c0',
  },
}

type Props = {
  label?: string
  string1: string
  string2: string
  mode?: 'characters' | 'words'
}

export default function Diff({
  label,
  string1 = '',
  string2 = '',
  mode = 'characters',
}: Props) {
  if (!string1 && !string2) return null
  if (string1 === string2) return null

  let groups = []

  if (mode === 'characters') groups = diff.diffChars(string1, string2)
  if (mode === 'words') groups = diff.diffWords(string1, string2)

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
      {label && <h3 className="mb-2 text-lg font-medium">{label}</h3>}
      <span>{mappedNodes}</span>
      {string1 !== '' && string2 === '' && (
        <span className="ml-1 inline italic text-gray-600">(deleted)</span>
      )}
    </div>
  )
}
