# readtheroom

![banner](.github/readtheroom.png)

A small, versatile TypeScript library for declaratively handling configuration settings from environment variables with type safety.

## Motivation

Reading environment variables in a typesafe manner can get annoying quick. `readtheroom` simplifies the process by giving you helpers to read, validate, set environment-specific defaults, and even convert types in a single `const` statement that you can easily `export` from a single file.

## Getting Started

```shell
npm install readtheroom
```

Once installed, import it like so:

```typescript
import { Env, read } from 'readtheroom'
```

## Examples

In the comments below, "present" means a non-empty string, and "not present" means `undefined` or an empty string.

### read

```typescript
import { read } from 'readtheroom'

//
// Reads from process.env.DB_NAME
// Throws if not present.
//
export const dbName = read('DB_NAME')

//
// Reads from process.env.DB_USER
// If not present, uses 'default_user' as its value.
//
export const dbUser = read('DB_USER', 'default_user');


//
// Reads from process.env.MAX_CONNECTIONS
// If present, converts the string value into a number.
// If not present, throws.
//
export const maxConnections = read('MAX_CONNECTIONS', Number);

//
// Same as above, but with a default value.
// Note that you must provide the default value as a string,
// so that your converter function retains a consistent input type.
//
export const maxConnections2 = read('MAX_CONNECTIONS', '4', Number);
```

### Env

Env allows you to:

1. Validate your currently running NODE_ENV.
2. Choose different config values based on that NODE_ENV.

```typescript
import { read, Env } from 'readtheroom'

//
// Reads process.env.NODE_ENV
// If present, validates that it is either 'development' or 'production'
// If not present, defaults to 'development' (this is the default default)
//
export const env = Env(['test', 'development', 'production'])

//
// Same as above, except defaults to 'test' instead of 'development'
//
export const env2 = Env(['test', 'development', 'production'], 'test')


//
// Reads process.env.DATABASE_URL *unless* in test environment.
// Wraps the default value in a thunk so `read` doesn't throw unnecessarily.
//
export const dbConfig = env.branch(
  () => read('DATABASE_URL'),
  {
    test: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
    //
    // Could also be this if you wanted:
    //
    // test: () => read('TEST_DATABASE_URL')
  }
)
```
