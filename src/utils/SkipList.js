/**
 * @template T
 */
export class SkipList {
  /**
   * @param {number} p
   * @param {(function(T,T):number)} [compare]
   */
  constructor(p, compare) {
    this.p = p
    this.head = new SkipListHead()
    this.compare = compare ?? ((a, b) => Number(a) - Number(b))
  }

  static MAX_LEVEL = 32

  /**
   * @param {number} p
   */
  static getRandomLevel(p) {
    if (!p || p >= 1) {
      throw new Error("p must be in [0, 1)")
    }
    let level = 0
    while (Math.random() < p && level < SkipList.MAX_LEVEL) {
      level++
    }
    return level
  }

  getHead() {
    return this.head
  }

  getLevel() {
    return this.head.getLevel()
  }

  /**
   * @param {T} data
   */
  insertOne(data) {
    const path = new SkipListWalker(this).retrieve(data)
    this.doInsert(path, data)
  }

  /**
   * Insert multiple datas
   * Tend to run as less retrieve as possible
   * @param {Array<T>} datas
   */
  insertMulti(datas) {
    if (datas.length === 0) {
      return
    }
    let path = null
    for (let i = datas.length - 1; i >= 0; i--) {
      const data = datas[i]
      const left = path?.get(0)
      if (path === null || !this.isPathUsable(path, data)) {
        console.log("new retrieve for " + data)
        path = new SkipListWalker(this).retrieve(data)
      }
      this.doInsert(path, datas[i])
    }
  }

  /**
   * @param {T} data
   * @param {SkipListPath<T>} path
   * @return {boolean}
   */
  isPathUsable(path, data) {
    const left = /** @type {DataNode<T>} */ (path.get(0))
    const right = left.getRight()
    if (!left) {
      throw new Error("left is null")
    }
    return (
      (left.isHead || this.compare(left.data, data) < 0) &&
      (!right || this.compare(data, right.data) <= 0)
    )
  }

  /**
   * @param {SkipListPath<T>} path
   * @param {T} data
   */
  doInsert(path, data) {
    const dataNode = new DataNode(data)
    const r = /** @type {DataNode<T>} */ (path.get(0)).setRight(dataNode)

    const level = SkipList.getRandomLevel(this.p)
    if (level > 0) {
      const skipListNode = new SkipListNode(dataNode, level)
      for (let i = 1; i <= level; i++) {
        ;/** @type {SkipListNode<T> | SkipListHead<T>} */ (
          path.get(i)
        ).setRight(skipListNode, i)
      }
    }
  }

  toArray() {
    const out = []
    let current = this.head.dataNode
    while (current.next) {
      current = current.next
      out.push(current.data)
    }
    return out
  }
}

/**
 * @template T
 */
class SkipListPath {
  /**
   * @param {SkipListHead<T>} skipListHead
   */
  constructor(skipListHead) {
    this.skipListHead = skipListHead
    this.path = new Array()
  }

  /**
   * @param {number} level
   * @param {SkipListHead<T> | SkipListNode<T> | DataNode<T>} node
   */
  update(level, node) {
    this.path[level] = node
  }

  /**
   * @param {number} level
   * @return {SkipListHead<T> | SkipListNode<T> | DataNode<T>}
   */
  get(level) {
    if (level === 0) {
      return this.path[0]
    } else {
      return this.path[level] ?? this.skipListHead
    }
  }

  /**
   * @param {SkipListNode<T> | DataNode<T>} node
   */
  insert(node) {
    for (let i = 1; i < node.level; i++) {}
  }
}

/**
 * @template T
 */
class SkipListWalker {
  /**
   * @param {SkipList<T>} list
   */
  constructor(list) {
    /**
     * @type {number}
     */
    this.currentLevel = Math.max(list.getLevel(), 1)
    /**
     * @type {SkipListHead<T> | SkipListNode<T> | DataNode<T>}
     */
    this.currentNode = list.getHead()
    this.path = new SkipListPath(list.head)
    this.compare = list.compare
  }

  /**
   * @param {T} data
   * @return {SkipListPath<T>}
   */
  retrieve(data) {
    while (!this.finish(data)) {
      const next = this.currentNode.getRight(this.currentLevel)
      if (!next || this.compare(data, next.data) < 0) {
        this.currentLevel--
        if (this.currentLevel === 0) {
          this.currentNode = /** @type {SkipListNode<T>} */ (
            this.currentNode
          ).dataNode
        }
      } else {
        this.currentNode = next
      }
      this.path.update(this.currentLevel, this.currentNode)
    }
    return this.path
  }

  /**
   * @param {T} data
   * @return {boolean}
   */
  finish(data) {
    if (this.currentLevel === 0) {
      const right = this.currentNode.getRight(0)
      return !right || this.compare(data, right.data) <= 0
    } else {
      return false
    }
  }
}

/**
 * @template T
 */
class SkipListNode {
  /**
   * @param {DataNode<T>} node
   * @param {number} level
   */
  constructor(node, level) {
    this.dataNode = node
    this.rights = new Array(level - 1)
  }

  get data() {
    return this.dataNode.data
  }

  get level() {
    return this.rights.length + 1
  }

  /**
   * @param {number} level
   * @return {SkipListNode<T>}
   */
  getRight(level) {
    return this.rights[level - 1]
  }

  /**
   * @param {SkipListNode<T> | undefined} node
   * @param {number} level
   */
  setRight(node, level) {
    if (level <= 0 || level > this.level) {
      throw new Error("level must be in [1, this.level]")
    }
    node?.setRight(this.getRight(level), level)
    this.rights[level - 1] = node
  }
}

/**
 * @template T
 */
class SkipListHead {
  constructor() {
    this.dataNode = new DataNodeHead(null)
    this.rights = new Array()
  }

  getLevel() {
    return this.rights.length
  }

  get data() {
    return null
  }

  /**
   * @param {number} level
   * @return {SkipListNode<T> | undefined}
   */
  getRight(level) {
    return this.rights[level - 1]
  }

  /**
   * @param {SkipListNode<T>} node
   * @param {number} level
   */
  setRight(node, level) {
    if (level <= 0 || level > SkipList.MAX_LEVEL) {
      throw new Error("level must be in [1, SkipList.MAX_LEVEL]")
    }
    node.setRight(this.getRight(level), level)
    this.rights[level - 1] = node
  }
}

/**
 * @template T
 */
class DataNode {
  /**
   * @param {T} data
   */
  constructor(data) {
    this.data = data
    this.next = null
  }

  get level() {
    return 0
  }

  get isHead() {
    return false
  }

  /**
   * Insert a new node after this node
   * @param {DataNode<T>} node
   */
  setRight(node) {
    node.next = this.next
    this.next = node
  }

  /**
   * @return {DataNode<T> | null}
   */
  getRight() {
    return this.next
  }
}

/**
 * @template T
 * @extends {DataNode<T>}
 */
class DataNodeHead extends DataNode {
  /**
   * @param {T} data
   */
  constructor(data) {
    super(data)
  }

  get isHead() {
    return true
  }
}
