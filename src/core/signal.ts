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

for (let x = 0; x < 10; x++)
  createEffect(() => {
    createEffect(() => {
      console.log("one");
    }, [undefined]);
    console.log("ten");
  });

for (let x = 0; x < 10; x++)
  createEffect(() => {
    console.log("x");
  }, [undefined]);

// output:
// one
// 10x ten
// x
