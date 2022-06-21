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
type Observer<T> = (newValue: T, prevValue: T) => void;
export type ObservedSetter<T> = (set: ((prev: T) => T) | Omit<T, "Function">) => T;
export type ObserveredSignal<T> = {
  value: Accessor<T>;
  setValue: ObservedSetter<T>;
  observe: (observer: Observer<T>) => void;
  unobserve: (observer: Observer<T>) => void;
};

export const createObservableSignal = <T>(initalValue: T): ObserveredSignal<T> => {
  let value = initalValue;
  let observable = new Set<Observer<T>>();
  const setValue: ObservedSetter<T> = (setter) => {
    const newValue = typeof setter === "function" ? setter(value) : (setter as T);
    observable.forEach((o) => o(newValue as T, value));
    value = newValue;
    return newValue;
  };
  const observe = (o: Observer<T>) => observable.add(o);
  const unobserve = (o: Observer<T>) => observable.delete(o);
  return { observe, unobserve, setValue, value: () => value };
};

export const getEffectId = () => Error().stack!;

const createEffect = (() => {
  const effectDependencyMap = new Map<string, any[]>();

  return (effect: () => (() => void) | void, dependencies?: any[]) => {
    if (typeof dependencies === "undefined") return effect();
    // super magic function
    const effectId = getEffectId();

    const alreadyCalled = effectDependencyMap.has(effectId);

    const cachedDeps = effectDependencyMap.get(effectId);

    // if the effect was already called and the dependencies didn't change, do nothing(for now)
    if (alreadyCalled && cachedDeps!.every((dep, idx) => dep === dependencies[idx])) return;

    effect();
    effectDependencyMap.set(effectId, dependencies);
  };
})();

// for (let x = 0; x < 10; x++)
//   createEffect(() => {
//     createEffect(() => {
//       console.log("one");
//     }, [undefined]);
//     console.log("ten");
//   });

// for (let x = 0; x < 10; x++)
//   createEffect(() => {
//     console.log("x");
//   }, [undefined]);

// output:
// one
// 10x ten
// x
