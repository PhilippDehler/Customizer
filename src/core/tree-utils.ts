export function treeForEach<TNode>(
  node: TNode,
  getNodes: (node: TNode) => TNode[],
  fn: (node: TNode) => void
) {
  fn(node);
  getNodes(node).forEach((n) => treeForEach(n, getNodes, fn));
}

export function treeForEachReverse<TNode>(
  node: TNode,
  getNodes: (node: TNode) => TNode[],
  fn: (node: TNode) => void
) {
  const children = getNodes(node);
  for (let i = children.length - 1; 0 < i; i--) {
    const child = children[i];
    treeForEachReverse(child, getNodes, fn);
  }
  return fn(node);
}
