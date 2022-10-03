import chroma from 'chroma-js'

const customMultiSelectStyles = {
  container: () => ({
    width: '100%',
  }),
  control: (provided) => ({
    ...provided,
    borderColor: '#E2E8F0',
    borderRadius: '0.375rem',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#718096',
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.data.color,
  }),
  multiValue: (styles, { data }) => {
    const color = data.color ? chroma(data.color) : chroma('#718096')
    return {
      ...styles,
      fontSize: '14px',
      backgroundColor: color.alpha(0.5).css(),
    }
  },
  multiValueLabel: (styles) => ({
    ...styles,
    color: '#000',
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
}

export default customMultiSelectStyles

