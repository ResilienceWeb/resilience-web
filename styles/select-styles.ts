import chroma from 'chroma-js'

const customMultiSelectStyles = {
  container: () => ({
    width: '100%',
  }),
  control: (provided) => ({
    ...provided,
    borderColor: '#E2E8F0',
    borderRadius: '6px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#71717a',
    fontSize: '14px',
  }),
  option: (provided, { data }) => ({
    ...provided,
    color: data.color,
  }),
  multiValue: (provided, { data }) => {
    const color = data.color ? chroma(data.color) : chroma('#718096')
    return {
      ...provided,
      backgroundColor: color.alpha(0.5).css(),
    }
  },
  multiValueLabel: (provided) => ({
    ...provided,
    fontSize: '14px',
    color: '#000',
  }),
  multiValueRemove: (provided, { data }) => ({
    ...provided,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 1000,
  }),
}

export default customMultiSelectStyles
