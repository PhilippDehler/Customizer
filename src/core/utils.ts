export function buildIncrementor() {
  let i = 0;
  return () => i++;
}

const increment = buildIncrementor();
export const createUniqueId = () => {
  return `canva-id-${increment()}`;
};
