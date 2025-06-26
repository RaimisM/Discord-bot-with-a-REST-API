import { describe, it, expect, beforeEach, vi } from 'vitest'
import createDatabase from '../index'

vi.mock('better-sqlite3', () => {
  const betterSqliteMock = vi.fn((url: string, opts: any) => ({ url, opts }))
  Object.assign(globalThis, { betterSqliteMock })
  return { default: betterSqliteMock }
})

vi.mock('kysely', () => {
  const camelCasePluginMock = vi.fn(() => ({ id: 'CamelCasePluginStub' }))
  const sqliteDialectCtor = vi.fn(({ database }: any) => ({
    kind: 'SqliteDialectStub',
    database,
  }))
  const kyselyCtor = vi.fn((config: any) => ({
    __isKyselyStub__: true,
    config,
  }))

  Object.assign(globalThis, {
    camelCasePluginMock,
    sqliteDialectCtor,
    kyselyCtor,
  })

  return {
    CamelCasePlugin: camelCasePluginMock,
    SqliteDialect: sqliteDialectCtor,
    Kysely: kyselyCtor,
  }
})

const M = () => ({
  betterSqliteMock: (globalThis as any).betterSqliteMock as ReturnType<typeof vi.fn>,
  camelCasePluginMock: (globalThis as any).camelCasePluginMock as ReturnType<typeof vi.fn>,
  sqliteDialectCtor: (globalThis as any).sqliteDialectCtor as ReturnType<typeof vi.fn>,
  kyselyCtor: (globalThis as any).kyselyCtor as ReturnType<typeof vi.fn>,
})

beforeEach(() => vi.clearAllMocks())

describe('createDatabase', () => {
  it('creates a Kysely instance with default (read-write) settings', () => {
    const db = createDatabase('test.db')
    const { betterSqliteMock, camelCasePluginMock, sqliteDialectCtor, kyselyCtor } = M()

    expect(db).toEqual(expect.objectContaining({ __isKyselyStub__: true }))
    expect(betterSqliteMock).toHaveBeenCalledWith('test.db', { readonly: false })
    expect(sqliteDialectCtor).toHaveBeenCalledWith({
      database: betterSqliteMock.mock.results[0].value,
    })
    expect(camelCasePluginMock).toHaveBeenCalledTimes(1)
    expect(kyselyCtor).toHaveBeenCalledWith({
      dialect: sqliteDialectCtor.mock.results[0].value,
      plugins: [camelCasePluginMock.mock.results[0].value],
    })
  })

  it('passes the readonly flag through to better-sqlite3', () => {
    const { betterSqliteMock } = M()
    createDatabase(':memory:', { readonly: true })
    expect(betterSqliteMock).toHaveBeenCalledWith(':memory:', { readonly: true })
  })
})