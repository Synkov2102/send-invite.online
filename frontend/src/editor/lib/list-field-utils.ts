export function addToList<T>(list: T[], maxLength: number, item: T): T[] {
  return list.length < maxLength ? [...list, item] : list;
}

export function removeFromList<T>(list: T[], minLength: number, index: number): T[] {
  return list.length > minLength ? list.filter((_, itemIndex) => itemIndex !== index) : list;
}

export function updateAt<T>(list: T[], index: number, updater: (item: T) => T): T[] {
  return list.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}
