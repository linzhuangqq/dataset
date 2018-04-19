function DataSet () {
  this._datas = {}
}

function Collection (props, name) {
  this.props = props
  this.name = name
}

function Filter (datas) {
  this._filter = {}
  this._sort = {}
  this._datas = datas
}

Filter.prototype.add = function (filter) {
  let f = Object.keys(filter)
  if (f.length === 0) return this
  f.map(name => {
    this._filter[name] = filter[name]
  })
}
Filter.prototype.compare = function (item) {
  let l = Object.keys(this._filter)
  let q = l.filter(name => {
    if ((item[name] !== undefined && item[name] === this._filter[name]) || (name.indexOf('$') === 0 && this[name]({name, item}))) {
      return true
    }
  })
  return l.length === q.length
}

Filter.prototype.$gt = function ({name, item}) {
  let l = Object.keys(this._filter[name])
  let result = l.filter(key => {
    let value = item[key]
    let n = this._filter[name][key]
    if (value > n) {
      return true
    }
  })
  return result.length === l.length
}

Filter.prototype.$lt = function ({name, item}) {
  let l = Object.keys(this._filter[name])
  let result = l.filter(key => {
    let value = item[key]
    let n = this._filter[name][key]
    if (value < n) {
      return true
    }
  })
  return result.length === l.length
}

Filter.prototype.$eq = function ({name, item}) {
  let l = Object.keys(this._filter[name])
  let result = l.filter(key => {
    let value = item[key]
    let n = this._filter[name][key]
    if (Array.isArray(n)) {
      return n.indexOf(value) >= 0
    } else {
      if (value === n) {
        return true
      }
    }
  })
  return result.length === l.length
}

Filter.prototype.$neq = function ({name, item}) {
  let l = Object.keys(this._filter[name])
  let result = l.filter(key => {
    let value = item[key]
    let n = this._filter[name][key]
    if (Array.isArray(n)) {
      return n.indexOf(value) < 0
    } else {
      if (value !== n) {
        return true
      }
    }
  })
  return result.length === l.length
}

Filter.prototype.sort = function (e) {
  Object.keys(e).map(name => {
    this._sort[name] = e[name]
  })
  return this
}

Filter.prototype.exec = function (fn) {
  return new Promise((resolve) => {
    let arr = this._datas.filter(it => {
      return this.compare(it)
    })
    if (typeof fn === 'function') arr = fn(arr)
    arr = new Sort({arr: arr, rule: this._sort})
    console.timeEnd('time')
    return resolve(arr)
  })
}

/*
$gt: {key: 5}
$lt: {key: 5}
$eq: {key: 5}
$eq: {key: 5}
*/
Filter.prototype.find = function (filter) {
  this.add(filter)
  return this
}

function Sort ({arr, rule}) {
  this.arr = arr
  this.rule = rule
  return this.launch()
}
Sort.prototype.launch = function () {
  let {name, order} = this.getRule()
  if (name === null) return this.arr
  return this.arr.sort((a, b) => {
    return this.closest(a, b, name, order)
  })
}
Sort.prototype.getRule = function (n) {
  let maps = Object.keys(this.rule)
  if (maps.length === 0) {
    return {
      name: null
    }
  }
  let index = maps.indexOf(n)
  if (index >= 0 && n !== undefined) {
    if (index + 1 < maps.length) {
      let name = maps[index + 1]
      let order = this.rule[name]
      return {
        name,
        order
      }
    } else {
      return {
        name: null
      }
    }
  } else {
    let name = maps.shift()
    let order = this.rule[name]
    return {
      name,
      order
    }
  }
}
Sort.prototype.closest = function (a, b, key, o) {
  let {av, bv} = this.format(a, b, key)
  if (av === bv) {
    let {name, order} = this.getRule(key)
    if (name === null) {
      return this.compare(av, bv, o)
    } else {
      return this.closest(a, b, name, order)
    }
  } else {
    return this.compare(av, bv, o)
  }
}
Sort.prototype.compare = function (av, bv, o) {
  return o === 'asc' ? av - bv : bv - av
}
Sort.prototype.format = function (a, b, key) {
  return {
    av: a[key],
    bv: b[key]
  }
}

Collection.prototype.find = function (filter) {
  console.time('time')
  let copy = [].concat(this.props._datas[this.name])
  let _filter = new Filter(copy)
  _filter.add(filter)
  return _filter
}

Collection.prototype.insert = function (datas) {
  let data = []
  if (Array.isArray(datas)) {
    data = datas
  } else {
    data.push(datas)
  }
  Array.isArray(this.props._datas[this.name]) ? this.props._datas[this.name] = this.props._datas[this.name].concat.apply([], data) : this.props._datas[this.name] = data
  return this
}

DataSet.prototype.collection = function (name) {
  this[name] = new Collection(this, name)
}

var ds = new DataSet()
ds.collection('pp')
var arr = []
for (let i = 0; i < 200000; i++) {
  let a = parseInt(Math.random() * 100)
  let b = a % 2 === 0
  arr.push({id: i, index: a, status: b})
}
ds.pp.insert(arr)
