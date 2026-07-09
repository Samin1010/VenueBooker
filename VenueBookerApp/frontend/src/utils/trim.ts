export function trimString(value?: string): string {
  return (value ?? "").trim();
}

export function trimObjectStrings<T extends Record<string, any>>(obj: T): T {
  const copy = { ...obj } as Record<string, any>;
  Object.keys(copy).forEach((key) => {
    const v = copy[key];
    if (typeof v === "string") copy[key] = v.trim();
  });
  return copy as T;
}
