const urlRegex = new RegExp(/^[a-zA-Z0-9\-]*$/)

export const urlValidator = (value: string) => {
  return urlRegex.test(value) ? true : false
}
