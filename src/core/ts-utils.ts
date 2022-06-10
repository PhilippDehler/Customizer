export const typesafeKeys = <T>(obj: T) => Object.keys(obj) as (keyof T)[];
