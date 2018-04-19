import test from 'ava'
import {expect} from 'chai'
import {DataSet} from '../src/DataSet.js'

test('DataSet', t => {
  var ds = new DataSet()
  ds.collection('pp')
  var arr = []
  for (let i = 0; i < 200000; i++) {
    let a = parseInt(Math.random() * 100)
    let b = a % 2 === 0
    arr.push({id: i, index: a, status: b})
  }
  ds.pp.insert(arr)

  expect(typeof ds.pp.find === 'function').to.eql(true)
  expect(typeof ds.pp.find({}).sort === 'function').to.eql(true)
  expect(typeof ds.pp.find({}).exec === 'function').to.eql(true)

  ds.pp.find({status: true}).exec().then((e) => {
    expect(e.length > 0).to.eql(true)
  })

  ds.pp.find({$gt: {index: 0}, $lt: {id: 100}}).exec().then((e) => {
    expect(e.length > 0).to.eql(true)
  })

  ds.pp.find({$neq: {index: 20}, $eq: {id: 1}}).sort({index: 'asc', id: 'desc'}).exec().then((e) => {
    expect(e.length > 0).to.eql(true)
  })

  ds.pp.find({$eq: {id: [1, 2, 3]}}).sort({index: 'asc', id: 'desc'}).exec().then((e) => {
    expect(e.length > 0).to.eql(true)
  })

  ds.pp.find({$neq: {id: [1, 2, 3]}}).sort({index: 'asc', id: 'desc'}).exec().then((e) => {
    expect(e.length > 0).to.eql(true)
  })

  ds.pp.find({$gt: {index: 20}}).sort({index: 'asc', id: 'desc'}).exec().then((e) => {
    expect(e.length > 0).to.eql(true)
  })

  ds.pp.find({status: true}).find({$gt: {index: 0}, $lt: {id: 100}}).sort({index: 'asc', id: 'desc'}).exec().then((e) => {
    expect(e.length > 0).to.eql(true)
  })

  ds.pp.find({status: true}).sort({index: 'asc', id: 'desc'}).exec((arr) => {
    return arr.filter(it => {
      return it.index % 2 === 0
    })
  }).then((e) => {
    expect(e.length > 0).to.eql(true)
  })
})
