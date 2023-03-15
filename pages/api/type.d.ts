interface Error {
  error: string
}

export type Result<Data = unknown> = Data | Error

