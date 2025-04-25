// Treat this as a module
export { };

declare global {
  interface Map<K, V> {
    getOrCreate(key: K, createValue: () => V): V;
  }
}

if (!Map.prototype.getOrCreate) {
  Map.prototype.getOrCreate = function <K, V>(this: Map<K, V>, key: K, createValue: () => V): V {
    
    if (!this.has(key)) {
      this.set(key, createValue());
    }
    
    return this.get(key) as V;
  };
}
