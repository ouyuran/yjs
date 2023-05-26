import { Item } from "yjs";

const p = 1 / 16;
const MAX_LEVEL = 32;
/**
 * @type {Array<number>}
 */
const pArray = [];
for (let i = 1; i < MAX_LEVEL - 1; i++) {
  pArray.push(Math.pow(p, i));
}

export class RDSLNode {
  /**
   * @param {Item | null} dataNode
   * @param {number} level
   */
  constructor(dataNode, level) {
    /**
     * @type {Item | null}
     */
    this.dataNode = dataNode;
    /**
     * @type {Array<RDSLNode | null>}
     */
    this.rights = [];
    /**
     * @type {Array<RDSLNode | null>}
     */
    this.lefts = [];
    /**
     * @type {Uint32Array}
     */
    this.distances = new Uint32Array(level);
  }

  /**
   * @param {number} level
   * @return {RDSLNode | null}
   */
  getRight(level) {
    return this.rights[level - 1];
  }

  /**
   * @param {number} level
   * @param {RDSLNode | null} node
   * @return {void}
   */
  setRight(level, node) {
    this.rights[level - 1] = node;
  }

  /**
   * @param {number} level
   * @return {RDSLNode | null}
   */
  getLeft(level) {
    return this.lefts[level - 1];
  }

  /**
   * @param {number} level
   * @param {RDSLNode | null} node
   * @return {void}
   */
  setLeft(level, node) {
    this.lefts[level - 1] = node;
  }

  /**
   * Remove self from RDSL identify structure
   */ 
  remove() {
    for (let i = 0; i < this.lefts.length; i++) {
      const level = i + 1;
      const left = this.getLeft(level);
      const right = this.getRight(level);
      if (!left) {
        throw new Error('Should not remove rdsl head!');
      }
      left.setRight(level, right);
      if(right) {
        right.setLeft(level, left);
        right.updateDistance(level, this.getDistance(level));
      }
    }
  }

  /**
   * @param {number} level
   * @return {number}
   */
  getDistance(level) {
    return this.distances[level - 1];
  }

  /**
   * @param {number} level
   * @return {number}
   */
  getRightDistance(level) {
    const right = this.getRight(level);
    if (!right) {
      return Number.MAX_SAFE_INTEGER;
    } else {
      // @ts-ignore
      return right.getDistance(level);
    }
  }

  /**
   * @param {number} level
   * @param {number} delta
   */
  updateDistance(level, delta) {
    this.distances[level - 1] += delta;
  }

  /**
   * @return {Item | null}
   */
  getDataNode() {
    return this.dataNode;
  }

  /**
   * @return {Number}
   */
  static getRandomLevel() {
    let randomValue = Math.random();
    let level = 0;
    while (randomValue < pArray[level] && level < MAX_LEVEL) {
      level++;
    }
    // console.log('random level', level, randomValue)
    return level;
  }
}

export class RDSLHeadNode extends RDSLNode {
  /**
   * @param {Item | null} dataNode
   */
  constructor(dataNode) {
    super(dataNode, MAX_LEVEL);
    this.headLevel = 0;
  }

  /**
   * @param {number} level
   */
  setHeadLevel(level) {
    this.headLevel = level;
  }

  /**
   * @return {number}
   */
  getHeadLevel() {
    return this.headLevel;
  }
}

export class RDSLPath {
  /**
   * @param {number} totalLevels
   * @param {RDSLHeadNode} start
   */
  constructor(totalLevels, start) {
    this.totalLevels = totalLevels;
    /**
     * @type {Array<RDSLNode | Item | null>}
     */
    this.nodes = [];
    /**
     * @type {Array<number>}
     */
    this.distances = [];
    this.start = start;
  }

  /**
   * @param {RDSLNode | Item | null} node
   * @param {number} level
   */
  update(node, level) {
    // This first RDSL node in each level should not be counted
    if (this.nodes[level]) {
      this.distances[level] += (/** @type{RDSLNode | Item} */(node)).getDistance(level);
    } else {
      if (level === 0) {
        this.distances[0] = node ? node.getDistance(0) : 0;
      } else {
        this.distances[level] = 0;
      }
    }
    this.nodes[level] = node;
  }

  /**
   * @param {number} level
   * @return {number}
   */
  getLevelDistance(level) {
    return this.distances[level] ?? 0;
  }

  /**
   * @param {number} level
   * @return {number}
   */
  getDistance(level) {
    level--;
    let total = 0;
    while (level >= 0) {
      total += this.getLevelDistance(level);
      level--;
    }
    return total;
  }

  /**
   * @param {number} level
   * @return {RDSLNode | Item | null}
   */
  getNodeOfLevel(level) {
    return this.nodes[level];
  }

  /**
   * @return {Item | null}
   */
  getDataNode() {
    // @ts-ignore
    return this.nodes[0];
  }

  /**
   * @param {number} level
   * @return {RDSLNode | Item}
   */
  getRetrievalNodeOfLevel(level) {
    return this.getNodeOfLevel(level) ?? this.start;
  }

  /**
   * @param {Array<Item>} nodes
   */
  handleInsert(nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const level = RDSLNode.getRandomLevel();
      let rdslNode = null;
      if (level > 0) {
        rdslNode = new RDSLNode(node, level);
        node.rdslNode = rdslNode;
        this.start.setHeadLevel(Math.max(this.start.getHeadLevel(), level));
      }
      for (let l = 1; l <= this.start.getHeadLevel(); l++) {
        const left = /** @type {RDSLNode} */ (
          this.getRetrievalNodeOfLevel(l)
        );
        const right = left.getRight(l);
        if (l <= level && rdslNode) {
          left.setRight(l, rdslNode);
          rdslNode.setRight(l, right);
          const selfDis = this.getDistance(l);
          rdslNode.updateDistance(l, selfDis);
          rdslNode.setLeft(l, left);
          if (right) {
            const rightDelta = node.getDistance() - rdslNode.getDistance(l);
            right.updateDistance(l, rightDelta);
          }
        } else {
          if (right) {
            const rightDelta = node.getDistance();
            right.updateDistance(l, rightDelta);
          }
        }
      }
    }
  }

  /**
   * @param {number} delta
   */
  handleUpdate(delta) {
    for (let l = 1; l <= this.start.getHeadLevel(); l++) {
      const left = /** @type {RDSLNode} */ (this.getNodeOfLevel(l));
      const right = left.getRight(l);
      if (right) {
        right.updateDistance(l, delta);
      }
    }
    // only level 0 would be impacted
    this.distances[0] += delta;
  }
}

export class RDSLWalker {
  /**
   * @param {RDSLHeadNode} start
   * @param {number} pos
   */
  constructor(start, pos) {
    const level = Math.max(start.getHeadLevel(), 1);
    /**
     * @type {RDSLNode | Item}
     */
    this.currentNode = start;
    this.posLeft = pos;
    this.currentLevel = level;
    this.path = new RDSLPath(level, start);
    this.path.update(start, level);
  }

  shouldGoRight() {
    if (this.currentLevel > 0) {
      return (
        this.posLeft > this.currentNode.getRightDistance(this.currentLevel)
      );
    } else {
      return this.posLeft > 0;
    }
  }

  goRight() {
    let right = this.currentNode.getRight(this.currentLevel);
    if (!right) {
      throw new Error("RDSL: Tried to go right but there is no right node!");
    }
    this.posLeft -= right.getDistance(this.currentLevel);
    this.currentNode = right;
    this.path.update(this.currentNode, this.currentLevel);
    // console.log(`go right level: ${this.currentLevel}, posLeft: ${this.posLeft}`)
  }

  goDown() {
    this.currentLevel--;
    if (this.currentLevel === 0) {
      const dataNode = (/** @type{RDSLNode} */(this.currentNode)).getDataNode();
      this.posLeft -= dataNode ? dataNode.getDistance() : 0;
      this.path.update(dataNode, 0);
      if(dataNode) {
        this.currentNode = dataNode;
      }
    } else {
      this.path.update(this.currentNode, this.currentLevel);
    }
    // console.log(`go down  level: ${this.currentLevel}, posLeft: ${this.posLeft}`)
  }

  /**
   * @return {Boolean}
   */
  finish() {
    if (this.currentLevel < 0) {
      throw new Error("RDSL: Should not go to a nagative level!");
    }
    return (
      this.currentLevel === 0 &&
      (this.posLeft <= 0 || this.currentNode.getRight(0) === null)
    );
  }
}

export class RDSLPosition {
  /**
   * @param {number} posLeft
   * @param {RDSLPath} path
   */
  constructor(posLeft, path) {
    /**
     * @type {Item}
     */
    // @ts-ignore
    this.n = path.nodes[0];
    this.posLeft = posLeft;
    this.path = path;
  }
}
