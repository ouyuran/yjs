import * as t from 'lib0/testing'
import { SkipList } from '../src/utils/SkipList.js'

/**
 * @param {number} a
 * @param {number} b
 */ 
const compareNumbers = (a, b) => a - b

/**
 * @param {t.TestCase} tc
 */
export const testInsertOneInOrder = tc => {
  const list = new SkipList(1/2)
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
export const testInsertOneInReverseOrder = tc => {
  const list = new SkipList(1/2)
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
export const testInsertOneRandomOrder = tc => {
  const list = new SkipList(1/2)
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
export const testInsertMultiInOrder = tc => {
}