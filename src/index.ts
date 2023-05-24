//
// Configuration helpers
//
/**
 * Reads a key from `process.env`.
 * Throws an error if value is `undefined` or an empty string.
 **/
export function read<T>(
  /** The key to read from process.env */
  key: string
): string
export function read<T>(
  /** The key to read from `process.env` */
  key: string,
  /** Defaults to this value if the read value is `undefined` or empty string. */
  defaultValue: string,
): string
export function read<T>(
  /** The key to read from process.env */
  key: string,
  /** Convert your string value to whatever you want */
  parse: (val: string) => T,
): T
export function read<T>(
  /** The key to read from process.env */
  key: string,
  /** Defaults to this value if the read value is `undefined` or empty string */
  defaultValue: string,
  /** Convert your string value to whatever you want */
  parse: (val: string) => T,
): T

export function read<T>(
  key: string,
  _defaultValue?: string | ((val: string) => T),
  _parse?: (val: string) => T,
) {
  const [defaultValue, parse] = (function () {
    if (typeof _defaultValue === 'function') {
      // e.g. read('FOO', (val) => parseInt(val))
      return [undefined, _defaultValue] as const
    }
    else if (typeof _parse === 'function') {
      // e.g. read('FOO', '123', (val) => parseInt(val))
      return [_defaultValue, _parse] as const
    }
    else if (_defaultValue !== undefined) {
      // e.g. read('FOO', '123')
      return [_defaultValue, undefined] as const
    }
    else {
      // e.g. read('FOO')
      return [undefined, undefined] as const
    }
  })()

  if (defaultValue !== undefined && typeof defaultValue !== 'string') {
    // e.g. read('FOO', 123)
    throw new Error(`[readtheroom] Default value for key '${key}' must be a string (found ${typeof defaultValue} instead)`)
  }

  const val = process.env[key]
  if (val === undefined || (val === '' && defaultValue !== '')) {
    if (defaultValue !== undefined) {
      // Since value is unset, set it here so 3rd party
      // code can read default value
      process.env[key] = defaultValue

      return parse ? parse(defaultValue) : defaultValue
    }
    throw new Error(`[readtheroom] Please set ${key}`)
  }
  return parse ? parse(val) : val
}

export function Env<E extends string, Envs extends E[]>(
  validEnvs: Envs,
  defaultEnv?: E,
) {
  type Env = Envs[number]
  type ConfigVal<T> = T | ((env: Env) => T)
  const node_env = read('NODE_ENV', defaultEnv || 'development')
  const env = validEnvs.find(env => env === node_env)
  if (!env) {
    throw new Error(`[readtheroom] Invalid NODE_ENV '${node_env}'. Valid values are: ${validEnvs.join(', ')}`)
  }

  function branch<T>(defaultValue: ConfigVal<T>, choices: Partial<Record<Env, ConfigVal<T>>>): T;
  function branch<T>(choices: Record<Env, ConfigVal<T>>): T;
  function branch<T>(defaultValue: any, choices?: any): T {
    const _env = env!
    if (choices === undefined) {
      choices = defaultValue
    }
    else if (!(_env in choices)) {
      return typeof defaultValue === 'function' ? defaultValue(_env) : defaultValue
    }

    const v = choices[_env]
    if (typeof v === 'function') {
      return v(_env)
    }
    else return v
  }


  return {
    name: env as Env,
    branch,
  }
}
