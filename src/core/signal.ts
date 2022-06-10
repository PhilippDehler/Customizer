export type Setter<T> = (set: (prev: T) => T) => T;
export type Accessor<T> = () => T;
export type Signal<T> = [Accessor<T>, Setter<T>];
export const createSignal = <T>(initalValue: T): Signal<T> => {
  let value = initalValue;
  const set: Setter<T> = (setter) => {
    if (typeof setter === "function") return (value = setter(value));
    else return value;
  };
  return [() => value, set];
};
