const emailRegex = new RegExp(/\S+@\S+\.\S+/)

export const emailValidator = (value: string) => {
    if (value === '') return false
    return emailRegex.test(value)
        ? ''
        : 'Please enter a valid email (or leave it blank)'
}

export const emailRequiredValidator = (value: string) => {
    if (!value || value === '') return 'Email is required'
    return emailRegex.test(value) ? '' : 'Please enter a valid email.'
}

export const fieldRequiredValidator = (value) => {
    let error
    if (!value) {
        error = 'This field is required'
    }
    return error
}
