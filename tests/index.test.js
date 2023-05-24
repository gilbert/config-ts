const o = require('ospec')
const { Env, read } = require('../dist/index')

process.env.TEST_CONFIG_VAR = '10'

o.spec('[config] read', function () {
  o('read', function () {
    o(read('TEST_CONFIG_VAR')).equals('10')
  })

  o('read throws', function () {
    o(() => read('I_DONT_EXIST__1')).throws('[readtheroom] Please set I_DONT_EXIST__1')
  })

  o('read default & set', function () {
    o(read('I_DONT_EXIST__2', '123')).equals('123')
    o(read('I_DONT_EXIST__2')).equals('123')
  })

  o('read empty string', function () {
    o(read('I_DONT_EXIST__3', '')).equals('')
  })

  o('read default bad type', function () {
    o(() => read('I_DONT_EXIST__4', 123)).throws(`[readtheroom] Default value for key 'I_DONT_EXIST__4' must be a string (found number instead)`)
  })

  o('read conversion', function () {
    o(read('TEST_CONFIG_VAR', Number)).equals(10)
  })

  o('read default conversion & set', function () {
    o(read('I_DONT_EXIST__5', '123', Number)).equals(123)
    o(read('I_DONT_EXIST__5')).equals('123')
  })
})

o.spec('[config] env.branch', function () {
  o('env no match', function () {
    process.env.NODE_ENV = 'nope'
    o(() =>  Env(['one', 'two'])).throws(`[readtheroom] Invalid NODE_ENV 'nope'. Valid values are: one, two`)
  })

  o('env with default', function () {
    delete process.env.NODE_ENV
    const env = Env(['one', 'two'], 'two')
    o(env.name).equals('two')
  })

  o('env with default development', function () {
    delete process.env.NODE_ENV
    o(() =>  Env(['one', 'two'])).throws(`[readtheroom] Invalid NODE_ENV 'development'. Valid values are: one, two`)
  })

  o('choose', function () {
    process.env.NODE_ENV = 'two'
    const env = Env(['one', 'two'])
    const choice = env.branch({
      one: 1,
      two: 2,
    })
    o(choice).equals(2)
  })

  o('choose default', function () {
    process.env.NODE_ENV = 'three'
    const env = Env(['one', 'two', 'three'])
    const choice = env.branch({ x: 10 }, {
      one: 1,
      two: 2,
    })
    o(choice).deepEquals({ x: 10 })
  })

  o('choose default function', function () {
    process.env.NODE_ENV = 'three'
    const env = Env(['one', 'two', 'three'])
    const choice = env.branch(() => [true, 10], {
      one: 1,
      two: 2,
    })
    o(choice).deepEquals([true, 10])
  })

  o('choose default specified', function () {
    process.env.NODE_ENV = 'one'
    const env = Env(['one', 'two', 'three'])
    const choice = env.branch([true, 10], {
      one: 1,
      two: 2,
    })
    o(choice).equals(1)
  })

  o('choose default specified function', function () {
    process.env.NODE_ENV = 'one'
    const env = Env(['one', 'two', 'three'])
    const choice = env.branch([true, 10], {
      one: () => 11,
      two: 2,
    })
    o(choice).equals(11)
  })
})
