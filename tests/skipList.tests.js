import * as t from "lib0/testing"
import { SkipList } from "../src/utils/SkipList.js"

/**
 * @param {number} a
 * @param {number} b
 */
const compareNumbers = (a, b) => a - b

class Item {
  /**
   * @param {number} number
   */ 
  constructor(number) {
    this.number = number
  }
}

/**
 * @param {Item} a
 * @param {Item} b
 */
const compareItems = (a, b) => a.number - b.number

/**
 * @param {t.TestCase} tc
 */
export const testInsertOneInOrder = (tc) => {
  const list = new SkipList(1 / 2)
  const array = new Array()
  for (let i = 0; i < 100; i++) {
    list.insertOne(i)
    array.push(i)
  }
  t.compareArrays(array, list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertOneInReverseOrder = (tc) => {
  const list = new SkipList(1 / 2)
  const array = new Array()
  for (let i = 99; i >= 0; i--) {
    list.insertOne(i)
    array.push(i)
  }
  t.compareArrays(array.sort(compareNumbers), list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertOneRandomOrder = (tc) => {
  const list = new SkipList(1 / 2)
  const array = new Array()
  for (let i = 0; i < 100; i++) {
    const ran = Math.random()
    list.insertOne(ran)
    array.push(ran)
  }
  t.compareArrays(array.sort(compareNumbers), list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertMultiInOrder = (tc) => {
  const list = new SkipList(1 / 2)
  let array = new Array()
  for (let i = 0; i < 20; i++) {
    const insertArray = new Array(
      i * 5,
      i * 5 + 1,
      i * 5 + 2,
      i * 5 + 3,
      i * 5 + 4
    )
    list.insertMulti(insertArray)
    array = [...array, ...insertArray]
  }
  t.compareArrays(array.sort(compareNumbers), list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertMultiInReverseOrder = (tc) => {
  const list = new SkipList(1 / 2)
  let array = new Array()
  for (let i = 19; i >= 0; i--) {
    const insertArray = new Array(
      i * 5,
      i * 5 + 1,
      i * 5 + 2,
      i * 5 + 3,
      i * 5 + 4
    )
    list.insertMulti(insertArray)
    array = [...array, ...insertArray]
  }
  t.compareArrays(array.sort(compareNumbers), list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertMultiPathUnusable = (tc) => {
  const list = new SkipList(1 / 2)
  let array = new Array()
  list.insertMulti([0, 1, 6, 8])
  list.insertMulti([5, 7])
  t.compareArrays([0, 1, 5, 6, 7, 8], list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertMultiInRandomOrder = (tc) => {
  const list = new SkipList(1 / 2)
  let array = new Array()
  for (let i = 19; i >= 0; i--) {
    const insertArray = new Array(
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random()
    )
    list.insertMulti(insertArray)
    array = [...array, ...insertArray]
  }
  t.compareArrays(array.sort(compareNumbers), list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertMultiItemInRandomOrder = (tc) => {
  const list = new SkipList(1 / 2, compareItems)
  let array = new Array()
  for (let i = 19; i >= 0; i--) {
    const insertArray = new Array(
      new Item(Math.random()),
      new Item(Math.random()),
      new Item(Math.random()),
      new Item(Math.random()),
      new Item(Math.random())
    )
    list.insertMulti(insertArray)
    array = [...array, ...insertArray]
  }
  t.compareArrays(array.sort(compareItems), list.toArray())
}

/**
 * @param {t.TestCase} tc
 */
export const testInsertMultiItemEdgeCase = (tc) => {
  const list = new SkipList(1 / 2, compareItems)
  const i1 = new Item(1)
  const i2 = new Item(2)
  const i2_2 = new Item(2)
  const i3 = new Item(3)
  const i4 = new Item(4)
  const i4_2 = new Item(4)
  list.insertMulti([i1, i2, i4])
  list.insertMulti([i2_2, i3, i4_2])
  t.compareArrays([
    i1, i2_2, i2, i3, i4_2, i4
  ], list.toArray())
}