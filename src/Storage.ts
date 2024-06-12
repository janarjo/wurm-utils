export enum LocalStorageKey {
  TREASURE_MAPS = 'treasureMaps',
  CURRENT_POSITION = 'currentPosition',
  SERVER = 'server'
}

export function load<T>(key: LocalStorageKey): T | undefined {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : undefined
}

export function save<T>(key: LocalStorageKey, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function remove(key: LocalStorageKey) {
  localStorage.removeItem(key)
}
