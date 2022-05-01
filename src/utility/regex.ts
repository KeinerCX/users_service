export const UsernameRegex = /^(?:[A-Z]|[a-z]|\d|\.|\_|\-){3,20}$/i

// Retreived from https://regexr.com/3bfsi on the 27th of April 2022
export const PasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm

export const AccessCodeRegex = /^([A-Z]{5}-[A-Z]{5}-[A-Z]{5})$/i

export const CustomEpoch: number | undefined = !process.env.EPOCH ? (process.env.EPOCH as undefined) : +process.env.EPOCH