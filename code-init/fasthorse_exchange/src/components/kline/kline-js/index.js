/**
 * Bundle of kline
 * Generated: 2019-02-15
 * Version: 1.0.0
 * Author: livelybone(2631541504@qq.com)
 */

import MetaScale from '@livelybone/meta-scale';
import { getRect, posRelativeToClient } from '@livelybone/scroll-get';
import format from 'date-fns/format';
import getDate from 'date-fns/get_date';
import getMonth from 'date-fns/get_month';
import { tap, pan, pinch } from '@livelybone/touch';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * RoundingMode = ['DOWN', 'HALF_UP', 'UP']
 * */
var CNum = function () {
  function CNum() {
    classCallCheck(this, CNum);
  }

  createClass(CNum, null, [{
    key: 'toExponential',
    value: function toExponential(val) {
      var exponential = 0;
      var flag = val < 0 ? -1 : 1;
      var value = Math.abs(val);
      if (value === 0) return { value: 0, exponential: 0 };
      if (value === Infinity) return { value: Infinity, exponential: Infinity };
      if (value < 1) {
        while (value < 1) {
          exponential -= 1;
          value *= 10;
        }
        value = Math.abs(val) / Math.pow(10, exponential);
      } else {
        while (value > 10) {
          exponential += 1;
          value /= 10;
        }
      }
      return { value: value * flag, exponential: exponential };
    }
  }, {
    key: 'toIntWithExponential',
    value: function toIntWithExponential(val) {
      var arr = val.toString().split('.');
      return {
        value: +arr.join(''),
        exponential: arr[0].length - 1 - (arr[1] ? arr[1].length : 0)
      };
    }
  }, {
    key: 'cPrice',
    value: function cPrice(val) {
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      if (roundingMode === 0) return +(+val - 5 * Math.pow(10, -CNum.pPrecision - 1)).toFixed(CNum.pPrecision);else if (roundingMode === 2) return +(+val + 5 * Math.pow(10, -CNum.pPrecision - 1)).toFixed(CNum.pPrecision);
      return +(+val).toFixed(CNum.pPrecision);
    }
  }, {
    key: 'cVolume',
    value: function cVolume(val) {
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      if (roundingMode === 0) return +(+val - 5 * Math.pow(10, -CNum.volPrecision - 1)).toFixed(CNum.volPrecision);else if (roundingMode === 2) return +(+val + 5 * Math.pow(10, -CNum.volPrecision - 1)).toFixed(CNum.volPrecision);
      return +(+val).toFixed(CNum.volPrecision);
    }
  }, {
    key: 'cVal',
    value: function cVal(val) {
      var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      var roundingMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      if (roundingMode === 0) return +(+val - 5 * Math.pow(10, -precision)).toFixed(precision);else if (roundingMode === 2) return +(+val + 5 * Math.pow(10, -precision)).toFixed(precision);
      return +(+val).toFixed(precision);
    }
  }, {
    key: 'toFixed',
    value: function toFixed(val, precision) {
      var roundingMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var p = void 0;
      var v = void 0;
      var exp = 0;
      if (precision >= 0) {
        p = precision;
        v = val;
      } else {
        var obj = CNum.toExponential(val);
        v = obj.value;
        exp = obj.exponential;
        p = Math.max(0, exp + precision);
      }
      var v1 = void 0;
      if (roundingMode === 0) v1 = (+v - 5 * Math.pow(10, -p - 1)).toFixed(p);else if (roundingMode === 2) v1 = (+v + 5 * Math.pow(10, -p - 1)).toFixed(p);else v1 = (+v).toFixed(p);
      return v1 * Math.pow(10, exp);
    }
  }, {
    key: 'flatNumToStr',
    value: function flatNumToStr(val) {
      var str = (+val).toString();
      var reg = /^([-+]?(\d+\.)?\d+)e([-+]?\d+)$/;
      var matched = str.match(reg);
      if (!matched) return str;

      var _matched = slicedToArray(matched, 4),
          num = _matched[1],
          precision = _matched[3];

      var _num$split = num.split('.'),
          _num$split2 = slicedToArray(_num$split, 2),
          int = _num$split2[0],
          _num$split2$ = _num$split2[1],
          decimal = _num$split2$ === undefined ? '' : _num$split2$;

      if (+precision === 0) return num;else if (+precision > 0) {
        var dot = false;
        return int + [].concat(toConsumableArray(Array(Math.max(decimal.length + 1, +precision)))).map(function (v, i) {
          if (dot === false) {
            if (i >= precision) {
              dot = true;
              return '.';
            }
          } else if (i >= precision) {
            return decimal[i + 1];
          }
          return decimal[i] || '0';
        }).join('');
      }

      var _int$match = int.match(/^([-+])?(.*)$/),
          _int$match2 = slicedToArray(_int$match, 3),
          _int$match2$ = _int$match2[1],
          flag = _int$match2$ === undefined ? '' : _int$match2$,
          n = _int$match2[2];

      return flag + '0.' + [].concat(toConsumableArray(Array(-precision - 1))).map(function () {
        return '0';
      }) + n + decimal;
    }
  }, {
    key: 'getPrecision',
    value: function getPrecision(val) {
      var str = val.toString();
      var arr = str.match(/(-?[\d.]*)e(-?\d*)/) || [];

      var _split = (arr[1] || str).split('.'),
          _split2 = slicedToArray(_split, 2),
          _split2$ = _split2[1],
          decimal = _split2$ === undefined ? '' : _split2$;

      return (-arr[2] || 0) + decimal.length;
    }
  }]);
  return CNum;
}();


CNum.pPrecision = 0;
CNum.volPrecision = 0;

/* eslint-disable no-param-reassign */
/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Array<Number>} nArr
 * */
function calcMA(index, dataArr) {
  var nArr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [5, 10, 30, 60];

  return nArr.reduce(function (res, n) {
    var startIndex = Math.max(0, index - n + 1);
    var length = index - startIndex + 1;
    res[n] = [].concat(toConsumableArray(Array(length))).reduce(function (sum, item, i) {
      return sum + dataArr[startIndex + i][4];
    }, 0) / length;
    return res;
  }, {});
}

/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Number|undefined} currVal
 * @param {Object} oldEMA
 * @param {Array<Number>} nArr
 * */
function calcEMA(_ref) {
  var index = _ref.index,
      _ref$dataArr = _ref.dataArr,
      dataArr = _ref$dataArr === undefined ? [] : _ref$dataArr,
      _ref$currVal = _ref.currVal,
      currVal = _ref$currVal === undefined ? undefined : _ref$currVal;
  var oldEMA = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var nArr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [12, 26];

  return nArr.reduce(function (res, n) {
    var value = currVal !== undefined ? currVal : dataArr[index][4];
    if (+index === 0) res[n] = value;else {
      var factor = 2 / (n + 1);
      res[n] = factor * value + (1 - factor) * (oldEMA[n] || value);
    }
    return res;
  }, {});
}

/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Object} oldMACD
 * @param {Number} shortEMA
 * @param {Number} longEMA
 * @param {Number} mDEA
 * */
function calcMACD(index, dataArr) {
  var oldMACD = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var shortEMA = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 12;

  var _calcEMA;

  var longEMA = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 26;
  var mDEA = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 9;

  var EMA = calcEMA({ index: index, dataArr: dataArr }, (_calcEMA = {}, defineProperty(_calcEMA, shortEMA, oldMACD.EMAShort), defineProperty(_calcEMA, longEMA, oldMACD.EMALong), _calcEMA), [shortEMA, longEMA]);
  var EMAShort = EMA[shortEMA];
  var EMALong = EMA[longEMA];
  var DIF = EMAShort - EMALong;
  var DEA = calcEMA({ index: index, currVal: DIF }, defineProperty({}, mDEA, oldMACD.DEA), [mDEA])[mDEA];
  var MACD = (DIF - DEA) * 2;
  return { EMAShort: EMAShort, EMALong: EMALong, DIF: DIF, DEA: DEA, MACD: MACD };
}

/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Number} MA
 * @param {Number} n
 * */
function calcSD(index, dataArr, MA) {
  var n = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;

  var startIndex = Math.max(0, index - n + 1);
  var length = index - startIndex + 1;
  return Math.sqrt([].concat(toConsumableArray(Array(length))).reduce(function (sum, item, i) {
    return sum + Math.pow(dataArr[startIndex + i][4] - MA, 2);
  }, 0) / length);
}

/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Number} n
 * @param {Number} k
 * */
function calcBOLL(index, dataArr) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 7;
  var k = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;

  var MA = calcMA(index, dataArr, [n])[n];
  var SD = calcSD(index, dataArr, MA, n);
  return { MA: MA, UP: MA + k * SD, DOWN: MA - k * SD };
}

/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Object<{K,D,J}>} oldKDJ
 * @param {Number} n
 * */
function calcKDJ(index, dataArr, oldKDJ) {
  var n = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 9;

  var old = _extends({ K: 50, D: 50, J: 50 }, oldKDJ);
  var startIndex = Math.max(0, index - n + 1);
  var length = index - startIndex + 1;
  var l = { high: 0, low: Infinity };
  [].concat(toConsumableArray(Array(length))).forEach(function (item, i) {
    var _dataArr = slicedToArray(dataArr[startIndex + i], 4),
        highest = _dataArr[2],
        lowest = _dataArr[3];

    l.high = Math.max(l.high, highest);
    l.low = Math.min(l.low, lowest);
  });
  if (l.high - l.low === 0) return old;
  var RSV = (dataArr[index][4] - l.low) / (l.high - l.low) * 100;
  var K = 2 / 3 * old.K + 1 / 3 * RSV;
  var D = 2 / 3 * old.D + 1 / 3 * K;
  var J = 3 * K - 2 * D;
  return { K: K, D: D, J: J };
}

/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Object} oldRSI
 * @param {Array<Number>} nArr, [5, 10, 14], [6, 12, 24]
 * */
function calcRSI(index, dataArr) {
  var oldRSI = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var nArr = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [5, 10, 14];

  return nArr.reduce(function (res, n) {
    var startIndex = Math.max(0, index - n + 1);
    var length = index - startIndex + 1;
    var obj = { positive: 0, negative: 0 };
    [].concat(toConsumableArray(Array(length))).forEach(function (item, i) {
      var _ref2 = dataArr[startIndex + i - 1] || dataArr[startIndex + i],
          _ref3 = slicedToArray(_ref2, 5),
          oldClose = _ref3[4];

      var _dataArr2 = slicedToArray(dataArr[startIndex + i], 5),
          close = _dataArr2[4];

      var diff = close - oldClose || 0;
      if (diff >= 0) obj.positive += diff;else obj.negative += -diff;
    });
    if (obj.positive + obj.negative === 0) res[n] = oldRSI[n] || 50;else res[n] = obj.positive / (obj.positive + obj.negative) * 100;
    return res;
  }, {});
}

/**
 * @param {Number|String} index
 * @param {Array<PricesArray>} dataArr
 * @param {Object} oldWR
 * @param {Array<Number>} nArr
 * */
function calcWR(index, dataArr) {
  var oldWR = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var nArr = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [6, 10];

  return nArr.reduce(function (res, n) {
    var startIndex = Math.max(0, index - n + 1);
    var length = index - startIndex + 1;
    var l = { high: 0, low: Infinity };
    [].concat(toConsumableArray(Array(length))).forEach(function (item, i) {
      var _dataArr3 = slicedToArray(dataArr[startIndex + i], 4),
          highest = _dataArr3[2],
          lowest = _dataArr3[3];

      l.high = Math.max(l.high, highest);
      l.low = Math.min(l.low, lowest);
    });
    if (l.high - l.low === 0) res[n] = oldWR[n] || 50;else res[n] = (l.high - dataArr[index][4]) / (l.high - l.low) * 100;
    return res;
  }, {});
}

/* eslint-disable no-param-reassign */

/**
 * @const
 * @readonly
 * @type {ReadonlyArray}
 * @property {Number} 0, timestamp, millisecond 毫秒
 * @property {Number} 1, open
 * @property {Number} 2, highest
 * @property {Number} 3, lowest
 * @property {Number} 4, close
 * @property {Number} 5, volume
 * @property {Number} 6, amount, optional
 * */
var PricesArray = Object.freeze([Date.now(), 1, 1, 1, 1, 1, 1]);

/**
 * @const
 * @readonly
 * @type {ReadonlyArray}
 * K线类型
 * */
var CandleTypes = Object.freeze([{ name: 'candles', value: 'normal' }, { name: 'heikin-ashi', value: 'average' }]);

/**
 * K线时段
 * */
var Times = Object.freeze([{ name: 'time', value: 60 * 1000 }, { name: '1min', value: 60 * 1000 }, { name: '5min', value: 5 * 60 * 1000 }, { name: '15min', value: 15 * 60 * 1000 }, { name: '30min', value: 30 * 60 * 1000 }, { name: '1hour', value: 60 * 60 * 1000 }, { name: '4hour', value: 4 * 60 * 60 * 1000 }, { name: '1day', value: 24 * 60 * 60 * 1000 }, { name: '5day', value: 5 * 24 * 60 * 60 * 1000 }, { name: '1week', value: 7 * 24 * 60 * 60 * 1000 }]);

/**
 * K线指标
 * */
var Indicators = Object.freeze({
  base: [{
    name: 'MA',
    value: 'MA',
    method: function method(index, dataArr) {
      return calcMA(index, dataArr, [5, 10, 30, 60]);
    },
    showFormatter: CNum.cPrice
  }, {
    name: 'EMA',
    value: 'EMA',
    method: function method(index, dataArr, old) {
      return calcEMA({ index: index, dataArr: dataArr }, old, [12, 26]);
    },
    showFormatter: CNum.cPrice
  }, {
    name: 'BOLL',
    value: 'BOLL',
    params: 'n = 7, k = 2',
    method: function method(index, dataArr) {
      return calcBOLL(index, dataArr, 7, 2);
    },
    showFormatter: CNum.cPrice
  }].map(function (item) {
    return _extends({}, item, { type: 'base' });
  }),
  technical: [{
    name: 'MACD',
    value: 'MACD',
    params: 'short = 12, long = 26, nDEA = 9',
    method: function method(index, dataArr, old) {
      return calcMACD(index, dataArr, old, 12, 26, 9);
    },
    bar: ['MACD'],
    ignore: ['EMAShort', 'EMALong'],
    order: ['MACD', 'DIF', 'DEA'],
    showFormatter: CNum.cPrice
  }, {
    name: 'KDJ',
    value: 'KDJ',
    params: 'n = 9',
    method: function method(index, dataArr, old) {
      return calcKDJ(index, dataArr, old, 9);
    },
    showFormatter: CNum.cVal
  }, {
    name: 'RSI',
    value: 'RSI',
    method: function method(index, dataArr, old) {
      return calcRSI(index, dataArr, old, [5, 10, 14]);
    },
    showFormatter: CNum.cVal
  }, {
    name: 'WR',
    value: 'WR',
    method: function method(index, dataArr, old) {
      return calcWR(index, dataArr, old, [6, 10]);
    },
    showFormatter: CNum.cVal
  }].map(function (item) {
    return _extends({}, item, { type: 'technical' });
  })
});

var PageScale = MetaScale();

/**
 * x 轴单位显示长度基准值
 * */
var XAxisUnitWidth = 75 / PageScale;

/**
 * y 轴单位显示长度基准值
 * */
var YAxisUnitWidth = {
  price: 50 / PageScale,
  volume: 20 / PageScale,
  indicator: 20 / PageScale

  /**
   * Months
   * */
};var Months = Object.freeze([{ name: 'Jan', value: 1 }, { name: 'Feb', value: 2 }, { name: 'Mar', value: 3 }, { name: 'Apr', value: 4 }, { name: 'May', value: 5 }, { name: 'Jun', value: 6 }, { name: 'Jul', value: 7 }, { name: 'Aug', value: 8 }, { name: 'Sep', value: 9 }, { name: 'Oct', value: 10 }, { name: 'Nov', value: 11 }, { name: 'Dec', value: 12 }]);

/**
 * Big.js 进位规则
 * */
var RoundTypes = Object.freeze({
  down: 0,
  halfUp: 1,
  halfDown: 2,
  up: 3
});

/**
 * 一些固定尺寸
 * */
var Sizes = Object.freeze({
  unit: Math.round(1 / PageScale),
  candleWidth: Math.round(6 / PageScale),
  candleMinWidth: Math.round(1 / PageScale),
  candleMaxWidth: Math.round(1 / PageScale) * 20,
  textDelta: Math.round(8 / PageScale),
  markerLineLength: Math.round(4 / PageScale),
  markerWidth: Math.round(100 / PageScale),
  yMarkerHeight: Math.round(20 / PageScale),
  xMarkerHeight: Math.round(24 / PageScale),
  xHeightDelta: Math.round(8 / PageScale),
  defaultFontSize: Math.round(10 / PageScale),
  candleChartPaddingRight: Math.round(10 / PageScale),
  candleChartPaddingTop: Math.round(40 / PageScale),
  candleChartPaddingBottom: Math.round(40 / PageScale),
  indicatorChartHeight: Math.round(100 / PageScale),
  indicatorChartPaddingTop: Math.round(8 / PageScale),
  indicatorChartPaddingBottom: Math.round(8 / PageScale),
  volumeChartHeight: Math.round(100 / PageScale),
  volumeChartHeightTop: Math.round(8 / PageScale),
  volumeChartHeightBottom: Math.round(8 / PageScale),
  loadingSize: Math.round(64 / PageScale),
  legendTextMargin: Math.round(2 / PageScale)
});

/**
 * 浏览器渲染每帧的间隔，按 60FPS(IE: 50FPS) 算
 * */
var MsPFrame = function () {
  var isIE = !!window.ActiveXObject || 'ActiveXObject' in window;
  return 1000 / (isIE ? 50 : 60);
}();

/**
 * x-axis acceptedIntervals
 * */
var acceptedIntervals = Object.freeze([{ value: 2 * 60 * 1000, bold: 30 * 60 * 1000, name: '2min' }, { value: 3 * 60 * 1000, bold: 30 * 60 * 1000, name: '3min' }, { value: 4 * 60 * 1000, bold: 30 * 60 * 1000, name: '4min' }, { value: 5 * 60 * 1000, bold: 30 * 60 * 1000, name: '5min' }, { value: 10 * 60 * 1000, bold: 30 * 60 * 1000, name: '10min' }, { value: 15 * 60 * 1000, bold: 60 * 60 * 1000, name: '15min' }, { value: 30 * 60 * 1000, bold: 60 * 60 * 1000, name: '30min' }, { value: 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '60min' }, { value: 1.5 * 60 * 60 * 1000, mod: 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '1.5hour' }, { value: 3 * 60 * 60 * 1000, mod: 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '3hour' }, { value: 6 * 60 * 60 * 1000, mod: 4 * 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '6hour' }, {
  value: 12 * 60 * 60 * 1000,
  mod: 4 * 60 * 60 * 1000,
  bold: 24 * 60 * 60 * 1000,
  name: '12hour'
}, { value: 24 * 60 * 60 * 1000, mod: 16 * 60 * 60 * 1000, bold: 'month', name: '1d' }, { value: 2 * 24 * 60 * 60 * 1000, mod: 40 * 60 * 60 * 1000, bold: 'month', name: '2d' }, { value: 3 * 24 * 60 * 60 * 1000, mod: 64 * 60 * 60 * 1000, bold: 'month', name: '3d' }, { value: 4 * 24 * 60 * 60 * 1000, mod: 88 * 60 * 60 * 1000, bold: 'month', name: '4d' }, { value: 5 * 24 * 60 * 60 * 1000, mod: 112 * 60 * 60 * 1000, bold: 'month', name: '5d' }, { value: 6 * 24 * 60 * 60 * 1000, mod: 136 * 60 * 60 * 1000, bold: 'month', name: '6d' }, { value: 7 * 24 * 60 * 60 * 1000, mod: 160 * 60 * 60 * 1000, bold: 'month', name: '7d' }, { value: 8 * 24 * 60 * 60 * 1000, mod: 184 * 60 * 60 * 1000, bold: 'month', name: '8d' }, { value: 9 * 24 * 60 * 60 * 1000, mod: 208 * 60 * 60 * 1000, bold: 'month', name: '9d' }, { value: 10 * 24 * 60 * 60 * 1000, mod: 232 * 60 * 60 * 1000, bold: 'month', name: '10d' }, { value: 15 * 24 * 60 * 60 * 1000, bold: 'month', alias: '15d' }, { value: 30 * 24 * 60 * 60 * 1000, bold: 'year', alias: '1mon' }, { value: 60 * 24 * 60 * 60 * 1000, bold: 'year', alias: '2mon' }, { value: 90 * 24 * 60 * 60 * 1000, bold: 'year', alias: '3mon' }, { value: 120 * 24 * 60 * 60 * 1000, bold: 'year', alias: '4mon' }]);

/* eslint-disable no-param-reassign */

var getRect$1 = getRect,
    posRelativeToClient$1 = posRelativeToClient;

function className() {
  var prices = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var diff = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (diff) return diff >= 0 ? 'up' : 'down';

  var _prices = slicedToArray(prices, 5),
      open = _prices[1],
      close = _prices[4];

  return close - open >= 0 ? 'up' : 'down';
}

function isPortrait() {
  var orientation = +window.orientation;
  return orientation !== 90 && orientation !== -90;
}

function indValFormat(ind, val) {
  for (var _len = arguments.length, res = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    res[_key - 2] = arguments[_key];
  }

  return typeof ind.showFormatter === 'function' ? ind.showFormatter.apply(ind, [val].concat(res)) : val;
}

function indValObjFormat(ind, obj) {
  return Object.keys(obj).reduce(function (pre, k) {
    pre[k] = indValFormat(ind, obj[k]);
    return pre;
  }, {});
}

//

var script = {
  name: 'YAxis',
  /**
   * @property {Object} origin, format: { x: Number, y: Number }
   * @property {Object} range, format: { max: Number, min: Number, power: Number }
   * */
  props: {
    origin: Object,
    height: Number,
    heightRate: Number,
    range: Object,
    fontSize: Number,
    type: String
  },
  data: function data() {
    return {
      textDelta: Sizes.textDelta,
      markerLineLength: Sizes.markerLineLength
    };
  },

  computed: {
    cOrigin: function cOrigin() {
      var _ref = this.origin || {},
          _ref$x = _ref.x,
          x = _ref$x === undefined ? 0 : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === undefined ? 0 : _ref$y;

      return {
        x: Math.round(x),
        y: Math.round(y)
      };
    },
    cHeight: function cHeight() {
      return Math.round(this.height);
    },
    isVolume: function isVolume() {
      return this.type === 'volume';
    },
    factor: function factor() {
      return Math.pow(10, this.range.power || 0);
    },
    unitHeight: function unitHeight() {
      if (!this.range || !this.heightRate) return 0;
      return this.heightRate * this.factor;
    },
    rangeOfTwo: function rangeOfTwo() {
      if (!this.unitHeight) return null;
      var range = {
        max: Math.ceil(YAxisUnitWidth[this.type] * 2 / this.unitHeight),
        min: Math.floor(YAxisUnitWidth[this.type] / this.unitHeight)
      };
      if (range.max - range.min > 1000) return null;
      return range;
    },
    halfFontSize: function halfFontSize() {
      return this.fontSize / this.unitHeight;
    },
    maxV: function maxV() {
      if (this.range.max * this.range.min < 0) {
        var _sort = [Math.abs(this.range.max), Math.abs(this.range.min)].sort(),
            _sort2 = slicedToArray(_sort, 2),
            rangeMin = _sort2[0],
            rangeMax = _sort2[1];

        if (rangeMax / rangeMin < 5) return rangeMin / this.factor - this.halfFontSize;
      }
      if (this.isVolume && this.range.min < 0) return Infinity;
      return null;
    },
    rule: function rule() {
      var _this = this;

      if (!this.rangeOfTwo) return null;
      var _rangeOfTwo = this.rangeOfTwo,
          max = _rangeOfTwo.max,
          min = _rangeOfTwo.min;

      if (max <= min) return null;

      var match = [].concat(toConsumableArray(Array(max - min))).reduce(function (pre, item, i) {
        var value = min + i;
        if (value && (value % 2 === 0 || value % 5 === 0)) {
          return pre.concat([{ value: value }]);
        }
        return pre;
      }, []);
      if (this.maxV) {
        var cMatch = match.filter(function (m) {
          return m.value < _this.maxV;
        });
        return cMatch[cMatch.length - 1] || match[0] || { value: 1 };
      }
      return match[match.length - 1] || { value: 1 };
    },
    zero: function zero() {
      var _range = this.range,
          max = _range.max,
          min = _range.min,
          power = _range.power;

      return this.calcCoord(0 .toFixed(Math.abs(power)), Math.round(max / this.factor), this.isVolume ? Math.round(this.cOrigin.y + this.height + min * this.heightRate) : 0);
    },
    coords: function coords() {
      var _this2 = this;

      if (!this.origin || !this.rule || !this.range || Object.keys(this.range).length < 1) return [];
      var _range2 = this.range,
          _range2$max = _range2.max,
          max = _range2$max === undefined ? 1 : _range2$max,
          _range2$min = _range2.min,
          min = _range2$min === undefined ? 0 : _range2$min,
          _range2$power = _range2.power,
          power = _range2$power === undefined ? 0 : _range2$power,
          _range2$precision = _range2.precision,
          precision = _range2$precision === undefined ? 0 : _range2$precision;

      return [].concat(toConsumableArray(Array(Math.ceil((max - min) / this.factor)))).reduce(function (pre, item, i) {
        var cValue = Math.ceil(max / _this2.factor - i);
        if (cValue % _this2.rule.value === 0) {
          var value = max - _this2.factor * i;
          if (_this2.maxV && Math.abs(value / _this2.factor) < _this2.rule.value / 2) return pre;
          var coord = _this2.calcCoord(value.toFixed(_this2.isVolume ? Math.max(0, -power) : precision), i);
          var y = coord.textOrigin.y - _this2.fontSize;
          if (_this2.cOrigin.y <= y && coord.textOrigin.y <= _this2.cOrigin.y + _this2.height) {
            return pre.concat(coord);
          }
        }
        return pre;
      }, this.maxV ? [this.zero] : []);
    }
  },
  watch: {
    coords: {
      handler: function handler() {
        this.emitWidth();
      },

      immediate: true
    },
    origin: {
      handler: function handler() {
        this.emitWidth();
      },

      immediate: true
    }
  },
  methods: {
    emitWidth: function emitWidth() {
      var _this3 = this;

      if (this.coords.length > 0 && this.origin) {
        this.$nextTick(function () {
          var el = _this3.$refs.yAxis[0] || _this3.$refs.yAxis;
          if (el) {
            var rectInfo = getRect$1(el);
            _this3.$emit('yWidth', Math.floor(rectInfo.width + Sizes.textDelta));
          }
        });
      }
    },
    calcCoord: function calcCoord(value, delta) {
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var origin = {
        x: +this.cOrigin.x,
        y: y || Math.floor(delta * this.unitHeight + this.cOrigin.y)
      };
      return {
        text: value,
        origin: origin,
        textOrigin: {
          x: Math.round(origin.x + this.textDelta),
          y: Math.round(origin.y + this.fontSize / 2 - Sizes.unit)
        }
      };
    }
  }
};

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _vm.origin && _vm.range ? _c('g', { staticClass: "y-axis" }, [_c('rect', { staticClass: "axis-line y", attrs: { "x": _vm.cOrigin.x, "y": _vm.cOrigin.y, "width": "1", "height": _vm.cHeight } }), _vm._v(" "), _c('g', { ref: "yAxis", staticClass: "axis-coords y" }, _vm._l(_vm.coords, function (c) {
    return _c('g', { key: c.text, staticClass: "axis-coord y" }, [_c('rect', { staticClass: "axis-coord-marker y", attrs: { "x": c.origin.x, "y": c.origin.y, "width": _vm.markerLineLength, "height": "1" } }), _vm._v(" "), _c('text', { staticClass: "axis-coord-text y", attrs: { "x": c.textOrigin.x, "y": c.textOrigin.y, "font-size": _vm.fontSize } }, [_vm._v("\n        " + _vm._s(c.text) + "\n      ")])]);
  })), _vm._v(" "), _c('g', { staticClass: "axis-reflines y" }, _vm._l(_vm.coords, function (c) {
    return _c('rect', { key: c.text, staticClass: "axis-refline y", attrs: { "x": 0, "y": c.origin.y, "width": _vm.cOrigin.x, "height": "1" } });
  }))]) : _vm._e();
};
var __vue_staticRenderFns__ = [];

/* style */
var __vue_inject_styles__ = undefined;
/* scoped */
var __vue_scope_id__ = undefined;
/* module identifier */
var __vue_module_identifier__ = undefined;
/* functional template */
var __vue_is_functional_template__ = false;
/* component normalizer */
function __vue_normalize__(template, style, script$$1, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "YAxis.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var YAxis = __vue_normalize__({ render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ }, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, undefined, undefined);

//

var script$1 = {
  name: 'Candles',
  components: { YAxis: YAxis },
  /**
   * @property {Array<{ prices: PricesArray, origin: { x: Number, y: Number } }>} paths
   * @property {Object} size, format: { width: Number, height: Number }
   * @property {Object<{ max, min, precision, power }>} range
   * */
  props: {
    paths: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    indicator: Object,
    range: Object,
    heightRate: Number,
    showHLine: Boolean,
    svgWidth: Number,
    size: Object,
    fontSize: Number
  },
  data: function data() {
    return {
      CandleTypes: CandleTypes,
      indicatorLines: ''
    };
  },

  computed: {
    yAxisOrigin: function yAxisOrigin() {
      return { x: this.size.width, y: 0 };
    },
    rectY: function rectY() {
      return this.size.height - 1;
    }
  },
  methods: {}
};

/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('g', { staticClass: "candles" }, [_c('y-axis', { attrs: { "origin": _vm.yAxisOrigin, "height": _vm.size.height, "heightRate": _vm.heightRate, "range": _vm.range, "fontSize": _vm.fontSize, "type": "price" }, on: { "yWidth": function yWidth($event) {
        _vm.$emit('yWidth', $event);
      } } }), _vm._v(" "), _vm.paths.paths ? _c('g', { attrs: { "clip-path": "url(#chart-content-clip)" } }, _vm._l(_vm.paths.paths, function (p, k) {
    return _c('path', { key: k, staticClass: "candle", class: k, attrs: { "d": p } });
  })) : _vm._e(), _vm._v(" "), _vm.paths.ind ? _c('g', { attrs: { "clip-path": "url(#chart-content-clip)" } }, _vm._l(_vm.paths.ind, function (l, k) {
    return _c('path', { key: k, staticClass: "indicator-line", class: _vm.indicator.value + '-' + k, attrs: { "d": l } });
  })) : _vm._e(), _vm._v(" "), _vm.showHLine ? _c('rect', { staticClass: "h-line", attrs: { "x": 0, "y": _vm.rectY, "width": _vm.svgWidth, "height": "1" } }) : _vm._e()], 1);
};
var __vue_staticRenderFns__$1 = [];

/* style */
var __vue_inject_styles__$1 = undefined;
/* scoped */
var __vue_scope_id__$1 = undefined;
/* module identifier */
var __vue_module_identifier__$1 = undefined;
/* functional template */
var __vue_is_functional_template__$1 = false;
/* component normalizer */
function __vue_normalize__$1(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "Candles.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var Candles = __vue_normalize__$1({ render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 }, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, undefined, undefined);

//

var script$2 = {
  name: 'CrossCurve',
  props: {
    origin: Object,
    textSize: {
      type: Object,
      default: function _default() {
        return { width: Sizes.markerWidth, height: Sizes.xMarkerHeight };
      }
    },
    chartSize: Object,
    fontSize: Number,
    time: Number,
    value: Number
  },
  data: function data() {
    return {
      valueHeight: Sizes.yMarkerHeight,
      textDelta: Sizes.textDelta
    };
  },

  computed: {
    cValue: function cValue() {
      return CNum.flatNumToStr(+this.value);
    },
    cOrigin: function cOrigin() {
      var _ref = this.origin || {},
          _ref$x = _ref.x,
          x = _ref$x === undefined ? 0 : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === undefined ? 0 : _ref$y;

      return {
        x: Math.floor(x),
        y: Math.floor(y)
      };
    },
    lineOrigin: function lineOrigin() {
      return {
        x: this.cOrigin.x + 0.5,
        y: this.cOrigin.y + 0.5
      };
    },
    timeX: function timeX() {
      return this.c(this.cOrigin.x, this.textSize.width);
    },
    timeTextY: function timeTextY() {
      return Math.round(this.chartSize.height + this.fontSize + this.textDelta);
    },
    valueX: function valueX() {
      return this.c(this.cOrigin.y, this.valueHeight);
    },
    valueText: function valueText() {
      return {
        x: Math.round(this.chartSize.width + this.textDelta),
        y: Math.round(this.cOrigin.y + this.fontSize / 2 - Sizes.unit)
      };
    }
  },
  methods: {
    format: format,
    c: function c(origin, delta) {
      return Math.floor(origin - delta / 2);
    }
  }
};

/* script */
var __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _vm.chartSize && _vm.origin ? _c('g', { staticClass: "cross-curve" }, [_c('line', { staticClass: "cross-h", attrs: { "x1": "0", "y1": _vm.lineOrigin.y, "x2": _vm.chartSize.width, "y2": _vm.lineOrigin.y } }), _vm._v(" "), _c('line', { staticClass: "cross-v", attrs: { "x1": _vm.lineOrigin.x, "y1": 0, "x2": _vm.lineOrigin.x, "y2": _vm.chartSize.height } }), _vm._v(" "), _c('g', { staticClass: "cross-time" }, [_c('rect', { staticClass: "cross-time-bg", attrs: { "x": _vm.timeX, "y": _vm.chartSize.height, "width": _vm.textSize.width, "height": _vm.textSize.height } }), _vm._v(" "), _c('text', { staticClass: "cross-time-text", attrs: { "x": _vm.cOrigin.x, "y": _vm.timeTextY, "font-size": _vm.fontSize, "text-anchor": "middle" } }, [_vm._v(_vm._s(_vm.format(_vm.time, 'YYYY-MM-DD HH:mm')) + "\n    ")])]), _vm._v(" "), _c('g', { staticClass: "cross-value" }, [_c('rect', { staticClass: "cross-value-bg", attrs: { "x": _vm.chartSize.width, "y": _vm.valueX, "width": _vm.textSize.width, "height": _vm.valueHeight } }), _vm._v(" "), _c('text', { staticClass: "cross-value-text", attrs: { "x": _vm.valueText.x, "y": _vm.valueText.y, "font-size": _vm.fontSize } }, [_vm._v(_vm._s(_vm.cValue) + "\n    ")])])]) : _vm._e();
};
var __vue_staticRenderFns__$2 = [];

/* style */
var __vue_inject_styles__$2 = undefined;
/* scoped */
var __vue_scope_id__$2 = undefined;
/* module identifier */
var __vue_module_identifier__$2 = undefined;
/* functional template */
var __vue_is_functional_template__$2 = false;
/* component normalizer */
function __vue_normalize__$2(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "CrossCurve.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var CrossCurve = __vue_normalize__$2({ render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 }, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, undefined, undefined);

//

var script$3 = {
  name: 'CrossCurve',
  props: {
    y: Number,
    width: Number,
    textWidth: {
      type: Number,
      default: Sizes.markerWidth
    },
    price: Number,
    isUp: Boolean,
    fontSize: Number
  },
  data: function data() {
    return {
      valueHeight: Sizes.yMarkerHeight,
      textDelta: Sizes.textDelta
    };
  },

  computed: {
    cPrice: function cPrice() {
      return CNum.flatNumToStr(this.price);
    },
    cY: function cY() {
      return Math.floor(this.y) || 0;
    },
    lineY: function lineY() {
      return this.cY + 0.5;
    },
    rectY: function rectY() {
      return this.c(this.cY, this.valueHeight);
    },
    priceText: function priceText() {
      return {
        x: Math.round(this.width + this.textDelta),
        y: Math.round(this.cY + this.fontSize / 2 - Sizes.unit)
      };
    }
  },
  watch: {},
  methods: {
    format: format,
    c: function c(origin, delta) {
      return Math.floor(origin - delta / 2);
    }
  }
};

/* script */
var __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('g', { staticClass: "curr-price", class: _vm.isUp ? 'up' : 'down' }, [_c('line', { staticClass: "curr-price-line", class: _vm.red, attrs: { "x1": "0", "y1": _vm.lineY, "x2": _vm.width, "y2": _vm.lineY } }), _vm._v(" "), _c('g', { staticClass: "curr-price-value" }, [_c('rect', { staticClass: "curr-price-value-bg", attrs: { "x": _vm.width, "y": _vm.rectY, "width": _vm.textWidth, "height": _vm.valueHeight } }), _vm._v(" "), _c('text', { staticClass: "curr-price-value-text", attrs: { "x": _vm.priceText.x, "y": _vm.priceText.y, "font-size": _vm.fontSize } }, [_vm._v(_vm._s(_vm.cPrice) + "\n    ")])])]);
};
var __vue_staticRenderFns__$3 = [];

/* style */
var __vue_inject_styles__$3 = undefined;
/* scoped */
var __vue_scope_id__$3 = undefined;
/* module identifier */
var __vue_module_identifier__$3 = undefined;
/* functional template */
var __vue_is_functional_template__$3 = false;
/* component normalizer */
function __vue_normalize__$3(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "CurrPrice.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var CurrPrice = __vue_normalize__$3({ render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 }, __vue_inject_styles__$3, __vue_script__$3, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, undefined, undefined);

//

var script$4 = {
  name: 'Legends',
  inject: ['lang', '$tr'],
  /**
   * @property
   * {Object<{ prices: PricesArray, originX: Number, baseInd: Object|Number, techInd: Object|Number }>} nearestItem
   * @property
   * {Object<{ top:Number,
   *           width: Number,
   *           children: {price:Array<Number>, volume:Array<Number>, indicator:Array<Number>}
   *         }>} offset
   * */
  props: {
    lastPrices: Array,
    nearestItem: Object,
    offset: Object,
    baseIndicator: Object,
    techIndicator: Object
  },
  computed: {
    priceItems: function priceItems() {
      return [{ name: 'open', alias: 1 }, { name: 'highest', alias: 2 }, { name: 'lowest', alias: 3 }, { name: 'close', alias: 4 }];
    },
    prices: function prices() {
      var arr = [].concat(toConsumableArray(this.nearestItem && this.nearestItem.prices || this.lastPrices || []));
      arr.className = className(arr);
      return arr;
    },
    baseInd: function baseInd() {
      var ind = this.nearestItem && this.nearestItem.baseInd;
      return ind && this.baseIndicator && indValObjFormat(this.baseIndicator, ind);
    },
    techInd: function techInd() {
      var ind = this.nearestItem && this.nearestItem.techInd;
      return ind && this.techIndicator && indValObjFormat(this.techIndicator, ind);
    },
    baseKeys: function baseKeys() {
      return this.calcKeys(this.baseIndicator, this.baseInd);
    },
    techKeys: function techKeys() {
      return this.calcKeys(this.techIndicator, this.techInd);
    },
    wrapStyle: function wrapStyle() {
      if (!this.offset) return {};
      var width = this.offset.width;

      return { width: width + 'px' };
    },
    volumeStyle: function volumeStyle() {
      if (!this.offset || !this.offset.children || !this.offset.children.volume) return {};
      return { top: this.offset.children.volume[0] + 'px' };
    },
    techStyle: function techStyle() {
      if (!this.offset || !this.offset.children || !this.offset.children.indicator) return {};
      return { top: this.offset.children.indicator[0] + 'px' };
    }
  },
  methods: {
    calcKeys: function calcKeys(indInfo, indItem) {
      if (!indInfo || !indItem) return [];
      var order = indInfo.order,
          ignore = indInfo.ignore;

      var keys = ignore ? Object.keys(indItem).filter(function (k) {
        return !ignore.some(function (ig) {
          return ig === k;
        });
      }) : Object.keys(indItem);
      return order ? keys.sort(function (a, b) {
        var indexA = Object.keys(order).find(function (k) {
          return a === k;
        });
        var indexB = Object.keys(order).find(function (k) {
          return b === k;
        });
        return indexA - indexB;
      }) : keys;
    },
    cTechKey: function cTechKey(k) {
      var bar = this.techIndicator.bar;

      if (bar && bar.some(function (key) {
        return k === key;
      })) return k + '-' + className([], +this.techInd[k]);
      return k;
    },
    flatNum: function flatNum(val) {
      return CNum.flatNumToStr(val);
    }
  }
};

/* script */
var __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "legends", style: _vm.wrapStyle }, [_c('div', { staticClass: "candle-legends" }, [_c('div', { staticClass: "prices" }, _vm._l(_vm.priceItems, function (item) {
    return _c('div', { key: item.name, staticClass: "item" }, [_vm._v(_vm._s(_vm.$tr(item.name)) + ":\n        "), _c('span', { staticClass: "value", class: _vm.prices.className }, [_vm._v("\n          " + _vm._s(_vm.flatNum(_vm.prices[item.alias])) + "\n        ")])]);
  })), _vm._v(" "), _vm.baseInd ? _c('div', { staticClass: "base-indicator-legends" }, [_vm.baseIndicator.params ? [_c('span', { staticClass: "name" }, [_vm._v("\n          " + _vm._s(_vm.baseIndicator.value) + "(" + _vm._s(_vm.baseIndicator.params) + ")\n        ")]), _vm._v(" "), _vm._l(_vm.baseKeys, function (k) {
    return _c('div', { key: k, staticClass: "item" }, [_vm._v(_vm._s(k) + ":\n          "), _c('span', { staticClass: "value", class: _vm.baseIndicator.value + '-' + k }, [_vm._v("\n            " + _vm._s(_vm.flatNum(_vm.baseInd[k])) + "\n          ")])]);
  })] : _vm._l(_vm.baseKeys, function (k) {
    return _c('div', { key: k, staticClass: "item" }, [_vm._v(_vm._s(_vm.baseIndicator.value) + " " + _vm._s(k) + ":\n          "), _c('span', { staticClass: "value", class: _vm.baseIndicator.value + '-' + k }, [_vm._v("\n            " + _vm._s(_vm.flatNum(_vm.baseInd[k])) + "\n          ")])]);
  })], 2) : _vm._e()]), _vm._v(" "), _c('div', { staticClass: "volume-legends", style: _vm.volumeStyle }, [_c('div', { staticClass: "item" }, [_vm._v("Volume:\n      "), _c('span', { staticClass: "value", class: _vm.prices.className }, [_vm._v(_vm._s(_vm.prices[5]))])])]), _vm._v(" "), _vm.techIndicator ? _c('div', { staticClass: "tech-indicator-legends", style: _vm.techStyle }, [_vm.techIndicator.params ? [_c('span', { staticClass: "name" }, [_vm._v("\n        " + _vm._s(_vm.techIndicator.value) + "(" + _vm._s(_vm.techIndicator.params) + ")\n      ")]), _vm._v(" "), _vm.techInd ? _vm._l(_vm.techKeys, function (k) {
    return _c('div', { key: k, staticClass: "item" }, [_vm._v(_vm._s(k) + ":\n          "), _c('span', { staticClass: "value", class: _vm.techIndicator.value + '-' + _vm.cTechKey(k) }, [_vm._v("\n          " + _vm._s(_vm.flatNum(_vm.techInd[k])) + "\n        ")])]);
  }) : _vm._e()] : _vm.techInd ? _vm._l(_vm.techKeys, function (k) {
    return _c('div', { key: k, staticClass: "item" }, [_vm._v(_vm._s(_vm.techIndicator.value) + " " + _vm._s(k) + ":\n        "), _c('span', { staticClass: "value", class: _vm.techIndicator.value + '-' + _vm.cTechKey(k) }, [_vm._v("\n          " + _vm._s(_vm.flatNum(_vm.techInd[k])) + "\n        ")])]);
  }) : _c('span', { staticClass: "name" }, [_vm._v(_vm._s(_vm.techIndicator.value))])], 2) : _vm._e()]);
};
var __vue_staticRenderFns__$4 = [];

/* style */
var __vue_inject_styles__$4 = undefined;
/* scoped */
var __vue_scope_id__$4 = undefined;
/* module identifier */
var __vue_module_identifier__$4 = undefined;
/* functional template */
var __vue_is_functional_template__$4 = false;
/* component normalizer */
function __vue_normalize__$4(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "Legends.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var Legends = __vue_normalize__$4({ render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 }, __vue_inject_styles__$4, __vue_script__$4, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$5 = {
  name: 'Loading',
  props: {
    width: Number,
    height: Number
  }
};

/* script */
var __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('svg', { staticClass: "loading", staticStyle: { "enable-background": "new 0 0 512 512" }, attrs: { "x": "0px", "y": "0px", "width": _vm.width, "height": _vm.height, "viewBox": "0 0 512 512", "xml:space": "preserve" } }, [_c('circle', { staticClass: "loading-circle-1", attrs: { "cx": "256", "cy": "16", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-2", attrs: { "transform": "matrix(0.5 -0.866 0.866 0.5 146.2975 349.7025)", "cx": "376", "cy": "48.2", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-3", attrs: { "transform": "matrix(0.866 -0.5 0.5 0.866 -5.8564 250.1436)", "cx": "463.8", "cy": "136", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-4", attrs: { "cx": "496", "cy": "256", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-5", attrs: { "transform": "matrix(0.5 -0.866 0.866 0.5 -93.7025 589.7025)", "cx": "463.8", "cy": "376", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-6", attrs: { "transform": "matrix(0.866 -0.5 0.5 0.866 -181.5486 250.1436)", "cx": "376", "cy": "463.8", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-7", attrs: { "cx": "256", "cy": "496", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-8", attrs: { "transform": "matrix(0.5 -0.866 0.866 0.5 -333.7025 349.7025)", "cx": "136", "cy": "463.8", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-9", attrs: { "transform": "matrix(0.866 -0.5 0.5 0.866 -181.5486 74.4514)", "cx": "48.2", "cy": "376", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-10", attrs: { "cx": "16", "cy": "256", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-11", attrs: { "transform": "matrix(0.5 -0.866 0.866 0.5 -93.7025 109.7025)", "cx": "48.2", "cy": "136", "r": "16" } }), _vm._v(" "), _c('circle', { staticClass: "loading-circle-12", attrs: { "transform": "matrix(0.866 -0.5 0.5 0.866 -5.8564 74.4514)", "cx": "136", "cy": "48.2", "r": "16" } })]);
};
var __vue_staticRenderFns__$5 = [];

/* style */
var __vue_inject_styles__$5 = undefined;
/* scoped */
var __vue_scope_id__$5 = undefined;
/* module identifier */
var __vue_module_identifier__$5 = undefined;
/* functional template */
var __vue_is_functional_template__$5 = false;
/* component normalizer */
function __vue_normalize__$5(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "Loading.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var Loading = __vue_normalize__$5({ render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 }, __vue_inject_styles__$5, __vue_script__$5, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, undefined, undefined);

var Data = function () {
  function Data() {
    classCallCheck(this, Data);
  }

  createClass(Data, null, [{
    key: 'updateOriginData',

    /**
     * @param {Array<PricesArray>} dataArr
     * @param {Function|null} loopCb
     *        (index, originData, cData, {baseIndicatorData:Array, techIndicatorData:Array}) => any
     * @param {String} type, ['update', 'refresh']
     * */
    value: function updateOriginData(dataArr, loopCb) {
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'update';

      dataArr.sort(function (a, b) {
        return a[0] - b[0];
      });
      var baseExist = !!Data.currBaseIndicator,
          techExist = !!Data.currTechIndicator;

      if (type === 'refresh') {
        Data.originData = dataArr;
        Data.cData = [];
        Data.initIndicators();

        Data.originData.forEach(function (d, i) {
          Data.cData[i] = Data.cPrices(d, Data.originData[i - 1] || d);
          if (baseExist) {
            var value = Data.currBaseIndicator.value;

            Data.indicatorsData[value][i] = Data.calcIndicator(Data.currBaseIndicator, i, Data.indicatorsData[value]);
          }
          if (techExist) {
            var _value = Data.currTechIndicator.value;

            Data.indicatorsData[_value][i] = Data.calcIndicator(Data.currTechIndicator, i, Data.indicatorsData[_value]);
          }
          if (loopCb) loopCb.apply(undefined, toConsumableArray(Data.loopCbParam(i)));
        });
      } else {
        var length = Data.originData.length;

        var dataLength = dataArr.length;
        var indexArr = [];
        var dLength = Math.max(0, length - dataLength);
        for (var j = 0; j < dataLength; j += 1) {
          var matched = false;
          var dItem = dataArr[j];
          for (var i = dLength; i < length; i += 1) {
            var item = Data.originData[i];
            if (dItem[0] === item[0]) {
              indexArr.push({ originDataIndex: i, index: j });
              Data.originData[i] = dItem;
              matched = true;
              break;
            } else if (dItem[0] < item[0]) break;
          }
          if (!matched) {
            indexArr.push({ originDataIndex: Data.originData.length, index: j });
            Data.originData.push(dItem);
          }
        }

        indexArr.forEach(function (o) {
          var i = o.originDataIndex;
          Data.cData[i] = Data.cPrices(Data.originData[i], Data.originData[i - 1] || Data.originData[i]);
          if (baseExist) {
            var value = Data.currBaseIndicator.value;

            Data.indicatorsData[value][i] = Data.calcIndicator(Data.currBaseIndicator, i, Data.indicatorsData[value]);
          }
          if (techExist) {
            var _value2 = Data.currTechIndicator.value;

            Data.indicatorsData[_value2][i] = Data.calcIndicator(Data.currTechIndicator, i, Data.indicatorsData[_value2]);
          }
          if (loopCb) loopCb.apply(undefined, toConsumableArray(Data.loopCbParam(i)));
        });
      }
      Data.originData = [].concat(toConsumableArray(Data.originData));
    }

    /**
     * @param {Object} indicatorInfo
     * @param {Function|null} loopCb
     *        (index, originData, cData, {baseIndicatorData:Array, techIndicatorData:Array}) => any
     * @param {String} type, ['base', 'tech']
     * */

  }, {
    key: 'currIndicatorChange',
    value: function currIndicatorChange(indicatorInfo, loopCb) {
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'base';

      var key = 'curr' + (type === 'base' ? 'Base' : 'Tech') + 'Indicator';
      if (!indicatorInfo) Data[key] = indicatorInfo;else if (!Data[key] || Data[key].value !== indicatorInfo.value) {
        Data[key] = indicatorInfo;
        Data.indicatorsData[indicatorInfo.value] = Data.calcIndicators(indicatorInfo, loopCb, type);
      }
    }
  }, {
    key: 'cPrices',
    value: function cPrices(prices, oldPrices) {
      var _prices = toArray(prices),
          timestamp = _prices[0],
          open = _prices[1],
          highest = _prices[2],
          lowest = _prices[3],
          close = _prices[4],
          volume = _prices[5],
          res = _prices.slice(6);

      [open, highest, lowest, close].forEach(function (p) {
        CNum.pPrecision = Math.max(CNum.pPrecision, CNum.getPrecision(p));
      });
      CNum.volPrecision = Math.max(CNum.volPrecision, CNum.getPrecision(volume));

      var openOld = oldPrices[1];
      var closeOld = oldPrices[4];
      var cOpen = CNum.cPrice((openOld + closeOld) / 2);
      var cClose = CNum.cPrice((highest + lowest + open + close) / 4);
      return [timestamp, cOpen, // open
      Math.max(highest, cOpen, cClose), // highest
      Math.min(lowest, cOpen, cClose), // lowest
      cClose, // close
      volume].concat(toConsumableArray(res));
    }
  }, {
    key: 'initIndicators',
    value: function initIndicators() {
      if (Data.currBaseIndicator) {
        var value = Data.currBaseIndicator.value;

        Data.indicatorsData[value] = [];
      }
      if (Data.currTechIndicator) {
        var _value3 = Data.currTechIndicator.value;

        Data.indicatorsData[_value3] = [];
      }
    }
  }, {
    key: 'calcIndicators',
    value: function calcIndicators(indicatorInfo) {
      var loopCb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'base';

      var res = [];
      Data.originData.forEach(function (d, i) {
        res.push(Data.calcIndicator(indicatorInfo, i, res));
        if (loopCb) loopCb.apply(undefined, toConsumableArray(Data.loopCbParam(i, defineProperty({}, type + 'IndicatorData', res))));
      });
      return res;
    }
  }, {
    key: 'calcIndicator',
    value: function calcIndicator(indicatorInfo, index, inds) {
      var method = indicatorInfo.method;

      return method(index, Data.originData, inds[index - 1]);
    }
  }, {
    key: 'loopCbParam',
    value: function loopCbParam(i, _ref) {
      var baseIndicatorData = _ref.baseIndicatorData,
          techIndicatorData = _ref.techIndicatorData;

      return [i, Data.originData, Data.cData, {
        baseIndicatorData: baseIndicatorData || Data.currBaseIndicator && Data.indicatorsData[Data.currBaseIndicator.value],
        techIndicatorData: techIndicatorData || Data.currTechIndicator && Data.indicatorsData[Data.currTechIndicator.value]
      }];
    }
  }]);
  return Data;
}();
Data.originData = [];

/**
 * @type {Array<PricesArray>}
 * @description Heikin-Ashi candle data
 * */
Data.cData = [];

/**
 * @type {Object}
 * @description Base Indicator info, format:
 * { name:String, value:String, method:(index, dataArr, old) => Object, bar?: Array<String>, ignore?: Array<String> }
 * */
Data.currBaseIndicator = null;

/**
 * @type {Object}
 * @description Tech Indicator info, format:
 * { name:String, value:String, method:(index, dataArr, old) => Object, bar?: Array<String>, ignore?: Array<String> }
 * */
Data.currTechIndicator = null;

/**
 * @type {Object}
 * @description Indicators data
 * */
Data.indicatorsData = {};

var en = {
  'langName': 'en',

  'time': 'Realtime',
  '1min': '1min',
  '5min': '5min',
  '15min': '15min',
  '30min': '30min',
  '1hour': '1hour',
  '4hour': '4hour',
  '1day': '1day',
  '5day': '5day',
  '1week': '1week',
  '1mon': '1mon',

  'Jan': 'Jan',
  'Feb': 'Feb',
  'Mar': 'Mar',
  'Apr': 'Apr',
  'May': 'May',
  'Jun': 'Jun',
  'Jul': 'Jul',
  'Aug': 'Aug',
  'Sep': 'Sep',
  'Oct': 'Oct',
  'Nov': 'Nov',
  'Dec': 'Dec',

  'yyyy': '{year}',

  'candles': 'Candles',
  'heikin-ashi': 'Heikin Ashi',

  'open': 'O',
  'highest': 'H',
  'lowest': 'L',
  'close': 'C',

  'periods': 'Periods',
  'candle-types': 'Candle Types',
  'indicators': 'Indicators',
  'indicators.base': 'Base Indicators',
  'indicators.technical': 'Technical Indicators',
  'MA': 'MA',
  'EMA': 'EMA',
  'BOLL': 'BOLL',
  'SAR': 'SAR',
  'MACD': 'MACD',
  'KDJ': 'KDJ',
  'StochRSI': 'StochRSI',
  'RSI': 'RSI',
  'DMI': 'DMI',
  'OBV': 'OBV',
  'DMA': 'DMA',
  'TRIX': 'TRIX',
  'BRAR': 'BRAR',
  'VR': 'VR',
  'EMV': 'EMV',
  'WR': 'WR',
  'ROC': 'ROC',
  'MTM': 'MTM',
  'PSY': 'PSY',

  'full-screen': 'Full Screen',
  'full-screen-exit': 'Exit Full Screen',

  'data.no': 'No Data',
  'see.landscape': 'Please see it on the horizontal screen',
  'back-to-portrait': 'Back to portrait'
};

var zh = {
  'langName': 'zh-hans',

  'time': '分时',
  '1min': '1分钟',
  '5min': '5分钟',
  '15min': '15分钟',
  '30min': '30分钟',
  '1hour': '1小时',
  '4hour': '4小时',
  '1day': '1天',
  '5day': '5天',
  '1week': '1周',
  '1mon': '1月',

  'Jan': '1月',
  'Feb': '2月',
  'Mar': '3月',
  'Apr': '4月',
  'May': '5月',
  'Jun': '6月',
  'Jul': '7月',
  'Aug': '8月',
  'Sep': '9月',
  'Oct': '10月',
  'Nov': '11月',
  'Dec': '12月',

  'yyyy': '{year}年',

  'candles': 'K线图',
  'heikin-ashi': '平均K线图',

  'open': '开',
  'highest': '高',
  'lowest': '低',
  'close': '收',

  'periods': '周期',
  'candle-types': 'K线类型',
  'indicators': '指标',
  'indicators.base': '基础指标',
  'indicators.technical': '技术指标',
  'MA': 'MA',
  'EMA': 'EMA',
  'BOLL': 'BOLL',
  'SAR': 'SAR',
  'MACD': 'MACD',
  'KDJ': 'KDJ',
  'StochRSI': 'StochRSI',
  'RSI': 'RSI',
  'DMI': 'DMI',
  'OBV': 'OBV',
  'DMA': 'DMA',
  'TRIX': 'TRIX',
  'BRAR': 'BRAR',
  'VR': 'VR',
  'EMV': 'EMV',
  'WR': 'WR',
  'ROC': 'ROC',
  'MTM': 'MTM',
  'PSY': 'PSY',

  'full-screen': '全屏',
  'full-screen-exit': '退出全屏',

  'data.no': '无数据',
  'see.landscape': '请横屏观看',
  'back-to-portrait': '返回竖屏'
};

var zht = {
  'langName': 'zh-hant',

  'time': '分時',
  '1min': '1分鐘',
  '5min': '5分鐘',
  '15min': '15分鐘',
  '30min': '30分鐘',
  '1hour': '1小時',
  '4hour': '4小時',
  '1day': '1天',
  '5day': '5天',
  '1week': '1周',
  '1mon': '1月',

  'Jan': '1月',
  'Feb': '2月',
  'Mar': '3月',
  'Apr': '4月',
  'May': '5月',
  'Jun': '6月',
  'Jul': '7月',
  'Aug': '8月',
  'Sep': '9月',
  'Oct': '10月',
  'Nov': '11月',
  'Dec': '12月',

  'yyyy': '{year}年',

  'candles': 'K線圖',
  'heikin-ashi': '平均K線圖',

  'open': '開',
  'highest': '高',
  'lowest': '低',
  'close': '收',

  'periods': '週期',
  'candle-types': 'K線類型',
  'indicators': '指標',
  'indicators.base': '基礎指標',
  'indicators.technical': '技術指標',
  'MA': 'MA',
  'EMA': 'EMA',
  'BOLL': 'BOLL',
  'SAR': 'SAR',
  'MACD': 'MACD',
  'KDJ': 'KDJ',
  'StochRSI': 'StochRSI',
  'RSI': 'RSI',
  'DMI': 'DMI',
  'OBV': 'OBV',
  'DMA': 'DMA',
  'TRIX': 'TRIX',
  'BRAR': 'BRAR',
  'VR': 'VR',
  'EMV': 'EMV',
  'WR': 'WR',
  'ROC': 'ROC',
  'MTM': 'MTM',
  'PSY': 'PSY',

  'full-screen': '全屏',
  'full-screen-exit': '退出全屏',

  'data.no': '無數據',
  'see.landscape': '請橫屏觀看',
  'back-to-portrait': '返回豎屏'
};

function calcLangs(langs) {
  return langs.reduce(function (pre, lang) {
    // eslint-disable-next-line no-param-reassign
    pre[lang.langName] = lang;
    return pre;
  }, {});
}

var Lang = function () {
  function Lang() {
    classCallCheck(this, Lang);
  }

  createClass(Lang, null, [{
    key: 'addLangSource',

    /**
     * @param {Object} langObj
     * */
    value: function addLangSource(langObj) {
      if (!langObj.langName) throw new Error('Key `langName` in lang object is missed');
      this.langs[langObj.langName] = langObj;
      console.log('Your custom language set successful');
    }

    /**
     * @param {String} key
     * @param {Object} params
     * @param {String} lang
     * */

  }, {
    key: '$tr',
    value: function $tr(key) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var lang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      var language = lang || this.lang;
      if (!this.langs[language]) throw new Error('(Lang.js) No language: ' + language);
      var val = this.langs[language][key];
      if (!val) {
        console.warn('(Lang.js) Key: ' + key + ' is not exist');
        return key;
      }
      var replaceRules = Object.keys(params).map(function (k) {
        return {
          reg: new RegExp('{' + k + '}', 'g'),
          value: params[k]
        };
      });
      return replaceRules.reduce(function (pre, rule) {
        return pre.replace(rule.reg, rule.value);
      }, val);
    }

    /**
     * @param {String} lang
     * */

  }, {
    key: 'setLang',
    value: function setLang(lang) {
      if (!this.langs[lang]) console.error('(Lang.js) No language: ' + lang);else this.lang = lang;
      return this.lang;
    }
  }]);
  return Lang;
}();


Lang.langs = calcLangs([en, zh, zht]);
Lang.lang = zh.langName;

/* eslint-disable no-param-reassign */

var LangMixin = {
  provide: function provide() {
    return {
      lang: this.lang,
      $tr: this.$tr
    };
  },
  created: function created() {
    this.lang = Lang.lang;
  },
  data: function data() {
    return {
      lang: ''
    };
  },

  watch: {
    lang: function lang() {
      this.resize();
    }
  },
  methods: {
    $tr: function $tr(key, params) {
      return Lang.$tr(key, params, this.lang);
    },
    addLangSource: function addLangSource(langObj) {
      Lang.addLangSource(langObj);
    },
    setLang: function setLang(lang) {
      this.lang = Lang.setLang(lang);
    }
  }
};

var DataMixin = {
  /**
   * @property {Array<PricesArray>} data
   * @property {Array<PricesArray>} updateData, for update one or more element
   * */
  props: {
    data: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    updateData: {
      type: Array,
      default: function _default() {
        return [];
      }
    }
  },
  data: function data() {
    /**
     * @property {Object} size, format: { width: Number, height: Number }
     * @property {Array<{ prices: PricesArray, originX: Number, baseInd: Object|Number, techInd: Object|Number }>} cData
     * @property {Object<{ price: { max, min, precision, power }, volume: { max, min, precision, power } }>} originRange
     */
    return {
      myData: [],
      size: null,
      candleWidth: Sizes.candleWidth,
      dragDeltaX: 0,
      cData: [],
      originRange: null,
      candlePaths: null,
      volumePaths: null,
      techIndPaths: null
    };
  },

  computed: {
    contentWidth: function contentWidth() {
      if (!this.chartSize) return 0;
      return this.chartSize.width - Sizes.candleChartPaddingRight;
    },
    halfCandleWidth: function halfCandleWidth() {
      return Math.floor(this.candleWidth / 2);
    },
    cCandleWidth: function cCandleWidth() {
      return this.halfCandleWidth * 2 + 1;
    },
    candleInterval: function candleInterval() {
      return Math.ceil(this.cCandleWidth / 3) - 1;
    },
    volumeWidth: function volumeWidth() {
      return this.cCandleWidth + this.candleInterval - 1;
    },
    volumeDeltaX: function volumeDeltaX() {
      return 0.5 - Math.floor(this.candleInterval / 2);
    },
    candleOffsetWidth: function candleOffsetWidth() {
      return Math.round(this.cCandleWidth + this.candleInterval);
    },
    cutLength: function cutLength() {
      if (!this.size) return 0;
      var length = Math.round((this.contentWidth + this.dragDeltaX) / this.candleOffsetWidth);
      return Math.max(1, length);
    },
    sliceLength: function sliceLength() {
      if (!this.size) return 0;
      var length = Math.round(this.contentWidth / this.candleOffsetWidth);
      return Math.max(1, length);
    },
    cutIndex: function cutIndex() {
      return Math.max(0, this.myData.length - this.cutLength);
    },
    showData: function showData() {
      if (!this.size) return [];
      return this.myData.slice(this.cutIndex, this.cutIndex + this.sliceLength);
    },
    startX: function startX() {
      // x = this.candleOffsetWidth * index + startX
      // y坐标轴处:
      // 等式 this.contentWidth === this.candleOffsetWidth * (index + 1) + startX 成立;
      // 等式 index + 1 === this.sliceLength 成立;
      if (this.sliceLength > this.myData.length) return 0;
      return this.contentWidth - this.candleOffsetWidth * this.sliceLength;
    },
    computedRange: function computedRange() {
      if (!this.originRange) return null;
      var _originRange = this.originRange,
          price = _originRange.price,
          volume = _originRange.volume,
          indicator = _originRange.indicator;

      return {
        price: this.calcRange(price, this.candlesSize.height, {
          top: Sizes.candleChartPaddingTop,
          bottom: Sizes.candleChartPaddingBottom
        }),
        volume: this.calcRange(volume, this.volumeHeight, {
          top: Sizes.volumeChartHeightTop,
          bottom: Sizes.volumeChartHeightBottom
        }),
        indicator: this.calcRange(indicator, this.indicatorHeight, {
          top: Sizes.indicatorChartPaddingTop,
          bottom: Sizes.indicatorChartPaddingBottom
        })
      };
    },
    heightRate: function heightRate() {
      if (!this.computedRange) return {};
      var _computedRange = this.computedRange,
          price = _computedRange.price,
          volume = _computedRange.volume,
          indicator = _computedRange.indicator;

      return {
        price: this.calcHeightRate(price, this.candlesSize.height),
        volume: this.calcHeightRate(volume, this.volumeHeight),
        indicator: this.calcHeightRate(indicator, this.indicatorHeight)
      };
    },
    currPrices: function currPrices() {
      var _ref = this.myData || [],
          length = _ref.length;

      if (!this.myData || length < 1 || !this.computedRange || !this.heightRate.price) return null;
      return this.type === CandleTypes[0].value ? this.myData[length - 1] : Data.cData[length - 1];
    },
    currPrice: function currPrice() {
      if (!this.currPrices) return null;

      var _currPrices = slicedToArray(this.currPrices, 5),
          openPrice = _currPrices[1],
          closePrice = _currPrices[4];

      var range = this.computedRange.price;
      var max = range.max,
          min = range.min;

      if (min > closePrice || closePrice >= max) return null;
      return {
        value: closePrice,
        y: Math.ceil((range.max - closePrice) * this.heightRate.price),
        isUp: closePrice - openPrice >= 0
      };
    },
    periodIsTime: function periodIsTime() {
      return this.period.name === 'time';
    }
  },
  watch: {
    data: {
      handler: function handler(val) {
        if (val) {
          Data.updateOriginData(JSON.parse(JSON.stringify(val)), null, 'refresh');
          this.myData = JSON.parse(JSON.stringify(Data.originData));
        }
      },

      immediate: true
    },
    updateData: {
      handler: function handler(val) {
        if (val) {
          Data.updateOriginData(JSON.parse(JSON.stringify(val)), null, 'update');
          this.myData = JSON.parse(JSON.stringify(Data.originData));
        }
      },

      immediate: true
    },
    showData: function showData(val) {
      var _this = this;

      var cData = [];
      var price = this.initRange(CNum.pPrecision);
      var volume = this.initRange(CNum.volPrecision, 0);
      var indicator = this.initRange(0);
      var candlePaths = void 0;
      var volumePaths = void 0;
      var techIndPaths = void 0;
      var priceKey = this.priceKey();

      var baseIndicator = this.baseIndicator,
          techIndicator = this.techIndicator;

      val.forEach(function (prices, i) {
        var max1 = Math.max(prices[1], prices[2], prices[4]);
        var min1 = Math.min(prices[1], prices[3], prices[4]);

        var _prices = slicedToArray(prices, 6),
            vol = _prices[5];

        if (max1 > price.max) price.max = max1;
        if (min1 < price.min) price.min = min1;
        if (vol > volume.max) volume.max = vol;

        var originX = _this.calcOriginX(prices, i);
        var cPrices = Data.cData[_this.cutIndex + i];
        var item = { prices: prices, cPrices: cPrices, originX: originX };
        if (!_this.periodIsTime && baseIndicator) {
          var _dealInd = _this.dealInd(i, baseIndicator),
              indItem = _dealInd.indItem,
              max = _dealInd.max,
              min = _dealInd.min;

          item.baseInd = indItem;
          if (min < price.min) price.min = min;
          if (max > price.max) price.max = max;
        }
        if (techIndicator) {
          var _dealInd2 = _this.dealInd(i, techIndicator),
              _indItem = _dealInd2.indItem,
              _max = _dealInd2.max,
              _min = _dealInd2.min,
              values = _dealInd2.values;

          item.techInd = _indItem;
          if (_min < indicator.min) indicator.min = indValFormat(techIndicator, _min);
          if (_max > indicator.max) indicator.max = indValFormat(techIndicator, _max);
          values.forEach(function (v) {
            indicator.precision = Math.max(indicator.precision, CNum.getPrecision(indValFormat(techIndicator, v)));
          });
        }
        cData.push(item);

        candlePaths = _this.setCandlePaths(candlePaths, item[priceKey], originX, item.baseInd, i);
        volumePaths = _this.setVolumePaths(volumePaths, prices, originX);
        techIndPaths = _this.setTechPaths(techIndPaths, prices, originX, item.techInd, i);
      });

      if (val.length) {
        price.power = this.calcFactorForAxis(price.max, price.min, price.precision);
        volume.power = this.calcFactorForAxis(volume.max, volume.min, volume.precision);
        if (techIndicator) {
          indicator.power = this.calcFactorForAxis(indicator.max, indicator.min, indicator.precision);
        }
        this.originRange = _extends({}, this.originRange, {
          price: price,
          volume: volume
        }, techIndicator ? { indicator: indicator } : {});
      } else {
        this.originRange = null;
      }

      this.cData = cData;
      this.candlePaths = candlePaths;
      this.volumePaths = volumePaths;
      this.techIndPaths = techIndPaths;
    },
    type: function type(val) {
      var _this2 = this;

      var candlePaths = void 0;
      this.showData.forEach(function (prices, i) {
        var _cData$i = _this2.cData[i],
            originX = _cData$i.originX,
            cPrices = _cData$i.cPrices;

        var p = val === CandleTypes[0].value ? prices : cPrices;
        candlePaths = _this2.setCandlePaths(candlePaths, p, originX, null, i);
      });
      if (candlePaths) {
        this.candlePaths = _extends({}, this.candlePaths, {
          paths: candlePaths.paths
        });
      } else {
        this.candlePaths = null;
      }
    },
    period: function period(val, oldVal) {
      if (val.value === oldVal.value) {
        this.updatePaths();
      }
    },
    heightRate: function heightRate(val, oldVal) {
      var _price$volume$indicat = {
        price: val.price !== oldVal.price,
        volume: val.volume !== oldVal.volume,
        indicator: val.indicator !== oldVal.indicator
      },
          price = _price$volume$indicat.price,
          volume = _price$volume$indicat.volume,
          indicator = _price$volume$indicat.indicator;

      if (price || volume || indicator) {
        this.updatePaths();
      }
    },

    baseIndicator: {
      handler: function handler(val) {
        var _this3 = this;

        var oldVal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (!val || val && val.value !== oldVal.value) {
          if (!this.periodIsTime && this.showData.length > 0) {
            var candlePaths = {};
            if (val) {
              var priceKey = this.priceKey();
              Data.currIndicatorChange(val, function (index, originData, cData, _ref2) {
                var baseIndicatorData = _ref2.baseIndicatorData;

                if (_this3.indexIsInRange(index)) {
                  var i = index - _this3.cutIndex;
                  var originX = _this3.cData[i].originX;

                  var _dealInd3 = _this3.dealInd(i, val, baseIndicatorData),
                      indItem = _dealInd3.indItem,
                      max = _dealInd3.max,
                      min = _dealInd3.min;

                  _this3.cData[i].baseInd = indItem;
                  if (_this3.originRange && _this3.originRange.price) {
                    if (min < _this3.originRange.price.min) _this3.originRange.price.min = min;
                    if (max > _this3.originRange.price.max) _this3.originRange.price.max = max;
                    candlePaths = _this3.setCandlePaths(candlePaths, _this3.cData[i][priceKey], originX, indItem, i, true);
                  }
                }
              }, 'base');
            } else {
              Data.currIndicatorChange(val, null, 'base');
              this.showData.forEach(function (prices, i) {
                _this3.cData[i].baseInd = undefined;
              });
            }
            this.cData = [].concat(toConsumableArray(this.cData));
            this.candlePaths = _extends({}, this.candlePaths, {
              ind: candlePaths.ind
            });
          } else {
            Data.currIndicatorChange(val, null, 'base');
          }
        }
      },

      immediate: true
    },
    techIndicator: {
      handler: function handler(val, oldVal) {
        var _this4 = this;

        var shouldUpdateVolume = !val && oldVal || val && !oldVal;
        if (shouldUpdateVolume || val && oldVal && val.value !== oldVal.value) {
          if (this.showData.length > 0) {
            var volumePaths = void 0;
            var techIndPaths = void 0;
            var indicator = this.initRange();
            if (val) {
              Data.currIndicatorChange(val, function (index, originData, cData, _ref3) {
                var techIndicatorData = _ref3.techIndicatorData;

                if (_this4.indexIsInRange(index)) {
                  var i = index - _this4.cutIndex;
                  var prices = originData[index];
                  var originX = _this4.cData[i].originX;

                  if (shouldUpdateVolume) volumePaths = _this4.setVolumePaths(volumePaths, prices, originX);

                  var _dealInd4 = _this4.dealInd(i, val, techIndicatorData),
                      indItem = _dealInd4.indItem,
                      max = _dealInd4.max,
                      min = _dealInd4.min,
                      values = _dealInd4.values;

                  _this4.cData[i].techInd = indItem;
                  if (min < indicator.min) indicator.min = indValFormat(val, min);
                  if (max > indicator.max) indicator.max = indValFormat(val, max);
                  values.forEach(function (v) {
                    indicator.precision = Math.max(indicator.precision, CNum.getPrecision(indValFormat(val, v)));
                  });
                  techIndPaths = _this4.setTechPaths(techIndPaths, prices, originX, _this4.cData[i].techInd, i);
                }
              }, 'tech');
            } else {
              Data.currIndicatorChange(val, null, 'tech');
              this.showData.forEach(function (prices, i) {
                var originX = _this4.cData[i].originX;

                if (shouldUpdateVolume) volumePaths = _this4.setVolumePaths(volumePaths, prices, originX);
                _this4.cData[i].techInd = undefined;
              });
            }
            this.cData = [].concat(toConsumableArray(this.cData));
            if (val) {
              indicator.power = this.calcFactorForAxis(indicator.max, indicator.min, indicator.precision);
              this.originRange = _extends({}, this.originRange, { indicator: indicator });
            }
            if (shouldUpdateVolume) this.volumePaths = volumePaths;
            this.techIndPaths = techIndPaths;
          } else {
            Data.currIndicatorChange(val, null, 'tech');
          }
        }
      },

      immediately: true
    }
  },
  methods: {
    updatePaths: function updatePaths() {
      var _this5 = this;

      var candlePaths = void 0;
      var volumePaths = void 0;
      var techIndPaths = void 0;
      var priceKey = this.priceKey();
      this.showData.forEach(function (prices, i) {
        var _cData$i2 = _this5.cData[i],
            originX = _cData$i2.originX,
            baseInd = _cData$i2.baseInd,
            techInd = _cData$i2.techInd;

        candlePaths = _this5.setCandlePaths(candlePaths, _this5.cData[i][priceKey], originX, baseInd, i);
        volumePaths = _this5.setVolumePaths(volumePaths, prices, originX);
        techIndPaths = _this5.setTechPaths(techIndPaths, prices, originX, techInd, i);
      });
      this.cData = [].concat(toConsumableArray(this.cData));
      this.candlePaths = candlePaths;
      this.volumePaths = volumePaths;
      this.techIndPaths = techIndPaths;
    },
    initRange: function initRange() {
      var precision = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      return {
        max: 0,
        min: min,
        precision: precision,
        power: 0
      };
    },
    calcOriginX: function calcOriginX(prices, index) {
      return Math.round(this.candleOffsetWidth * index + this.startX);
    },
    calcFactorForAxis: function calcFactorForAxis(max, min, precision) {
      var power = CNum.toExponential(max - min).exponential;
      return Math.max(-precision, power - 1);
    },
    calcRange: function calcRange(range, height) {
      var factors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { top: 1, bottom: 1 };

      if (!range || !this.size || !height) return null;
      var max = range.max,
          min = range.min,
          power = range.power,
          precision = range.precision;

      var rate = (max - min) / height || 1;
      var cRange = {
        max: CNum.cVal(max + rate * factors.top, precision),
        min: CNum.cVal(min - rate * factors.bottom, precision),
        power: power,
        precision: precision
      };
      var factor = Math.pow(10, power);
      var p = Math.max(0, -power);
      if (CNum.cVal(cRange.max - max, p) <= factor) {
        cRange.max += factor;
      }
      if (CNum.cVal(min - cRange.min, p) <= factor) {
        cRange.min -= factor;
      }
      return cRange;
    },
    calcHeightRate: function calcHeightRate(range, height) {
      if (!height || !range) return 1;
      var max = range.max,
          min = range.min;

      var delta = max - min;
      if (!delta) return 1;
      return height / delta;
    },
    dealInd: function dealInd(index, indInfo, indicatorData) {
      var value = indInfo.value,
          ignore = indInfo.ignore;

      var item = (indicatorData || Data.indicatorsData[value])[this.cutIndex + index];
      var keys = Object.keys(item).filter(function (k) {
        return !ignore || !ignore.includes(k);
      }).sort(function (a, b) {
        return item[a] - item[b];
      });
      return {
        keys: keys,
        indItem: item,
        max: item[keys[keys.length - 1]],
        min: item[keys[0]],
        values: keys.map(function (k) {
          return item[k];
        })
      };
    },
    setCandlePaths: function setCandlePaths() {
      var candlePaths = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var prices = arguments[1];
      var originX = arguments[2];
      var indItem = arguments[3];
      var i = arguments[4];
      var onlyInd = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

      if (!this.heightRate.price) return candlePaths;
      var _candlePaths$paths = candlePaths.paths,
          paths = _candlePaths$paths === undefined ? {} : _candlePaths$paths;
      var _candlePaths$ind = candlePaths.ind,
          ind = _candlePaths$ind === undefined ? '' : _candlePaths$ind;

      var _dCandlePath = this.dCandlePath(prices, originX, indItem, i, onlyInd),
          candle = _dCandlePath.candle,
          line = _dCandlePath.line;

      if (!onlyInd && candle) {
        var type = candle.type,
            path = candle.path;

        if (!paths[type]) paths[type] = path;else paths[type] += path;
      }
      if (line) {
        if ((typeof line === 'undefined' ? 'undefined' : _typeof(line)) === 'object') {
          ind = Object.keys(line).reduce(function (pre, k) {
            pre[k] = (pre[k] || '') + line[k];
            return pre;
          }, ind || {});
        } else {
          ind += line;
        }
      }
      return { paths: !onlyInd && paths, ind: ind };
    },
    dCandlePath: function dCandlePath(prices, originX, indItem, i) {
      var _this6 = this;

      var onlyInd = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      var heightRate = this.heightRate.price;
      var candle = void 0;
      var line = void 0;
      if (!onlyInd) {
        var _prices2 = slicedToArray(prices, 5),
            open = _prices2[1],
            highest = _prices2[2],
            lowest = _prices2[3],
            close = _prices2[4];

        if (!this.periodIsTime) {
          var type = this.className(prices);
          var highY = Math.ceil((this.computedRange.price.max - highest) * heightRate);
          var deltaY = [Math.ceil((highest - Math.max(open, close)) * heightRate), Math.max(1, Math.ceil(Math.abs(open - close) * heightRate)), Math.ceil((Math.min(open, close) - lowest) * heightRate)];
          // eslint-disable-next-line max-len
          var path = 'M' + (this.halfCandleWidth + originX) + ',' + highY + ' h1 v' + deltaY[0] + ' h' + this.halfCandleWidth + ' v' + deltaY[1] + ' h' + -this.halfCandleWidth + ' v' + deltaY[2] + ' h-1 v' + -deltaY[2] + ' h' + -this.halfCandleWidth + ' v' + -deltaY[1] + ' h' + this.halfCandleWidth + ' z\n\r';
          candle = { type: type, path: path };
        } else {
          var closeY = Math.ceil((this.computedRange.price.max - close) * heightRate);
          candle = {
            type: 'line',
            path: '' + (i === 0 ? 'M' : 'L') + (this.halfCandleWidth + originX + 0.5) + ',' + (closeY + 0.5) + '\n\r'
          };
          return { candle: candle };
        }
      }

      if (!indItem) return { candle: candle };

      var cX = this.halfCandleWidth + originX + 0.5;
      if ((typeof indItem === 'undefined' ? 'undefined' : _typeof(indItem)) === 'object') {
        line = Object.keys(indItem).reduce(function (pre, k) {
          pre[k] = _this6.baseIndDot(i, cX, indItem[k]);
          return pre;
        }, {});
      } else {
        line = this.baseIndDot(i, cX, indItem);
      }
      return { candle: candle, line: line };
    },
    baseIndDot: function baseIndDot(i, x, val) {
      var rangeMax = this.computedRange.price.max;
      var heightRate = this.heightRate.price;
      return '' + (i === 0 ? 'M' : 'L') + x + ',' + (Math.ceil((rangeMax - val) * heightRate) - 0.5) + '\n\r';
    },
    setVolumePaths: function setVolumePaths() {
      var volumePaths = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var prices = arguments[1];
      var originX = arguments[2];

      if (!this.heightRate.volume) return volumePaths;
      var obj = _extends({}, volumePaths);
      var type = this.className(prices);
      var path = this.dVolumePath(prices, originX);
      if (!obj[type]) obj[type] = path;else obj[type] += path;
      return obj;
    },
    dVolumePath: function dVolumePath(prices, originX) {
      var _prices3 = slicedToArray(prices, 6),
          volume = _prices3[5];

      var min = this.computedRange.volume.min;

      var heightRate = this.heightRate.volume;
      var height = Math.floor((volume - Math.max(0, min)) * heightRate);
      var deltaY = this.volumesSize.height - height - Math.max(0, -min) * heightRate;
      var x = originX + this.volumeDeltaX;
      var y = Math.ceil(this.crossCurveRangeY.volume[0] + deltaY) - 0.5;
      return 'M' + x + ',' + y + ' h' + this.volumeWidth + ' v' + height + ' h' + -this.volumeWidth + ' z\n\r';
    },
    setTechPaths: function setTechPaths() {
      var techIndPaths = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var prices = arguments[1];
      var originX = arguments[2];
      var indItem = arguments[3];
      var i = arguments[4];

      if (!this.heightRate.indicator) return techIndPaths;
      var obj = _extends({}, techIndPaths);
      var p = this.dTechIndPath(originX, prices, indItem, i);
      if (p && (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object') {
        obj = Object.keys(p).reduce(function (pre, k) {
          var _p$k = p[k],
              value = _p$k.value,
              chartType = _p$k.chartType,
              classType = _p$k.classType;

          var key = classType ? k + '-' + classType : k;
          pre[key] = {
            chartType: chartType,
            classType: classType,
            value: (pre[key] && pre[key].value || '') + value
          };
          return pre;
        }, obj || {});
      }
      return obj;
    },
    dTechIndPath: function dTechIndPath(originX, prices, indItem, i) {
      var _this7 = this;

      if (!indItem || !this.techIndicator) return '';
      var cX = this.halfCandleWidth + originX + 0.5;
      var p = void 0;
      if ((typeof indItem === 'undefined' ? 'undefined' : _typeof(indItem)) === 'object') {
        p = Object.keys(indItem).filter(function (k) {
          return !_this7.techIndicator.ignore || !_this7.techIndicator.ignore.includes(k);
        }).reduce(function (pre, k) {
          pre[k] = _this7.techIndDot(i, cX, indItem[k] || 0, _this7.isBar(_this7.techIndicator, k) ? 'bar' : 'line');
          return pre;
        }, {});
      } else {
        p = this.techIndDot(i, cX, indItem, this.isBar() ? 'bar' : 'line');
      }
      return p;
    },
    techIndDot: function techIndDot(i, x, val) {
      var chartType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'line';

      if (!this.computedRange.indicator) return {};
      var rangeMax = this.computedRange.indicator.max;
      var heightRate = this.heightRate.indicator;
      var y = Math.ceil((rangeMax - val) * heightRate + this.crossCurveRangeY.indicator[0]) - 0.5;
      var y1 = Math.ceil(rangeMax * heightRate + this.crossCurveRangeY.indicator[0]) - 0.5;
      if (chartType === 'bar') {
        return {
          chartType: chartType,
          value: 'M' + x + ',' + y + ' V' + y1 + 'z\n\r',
          classType: className([], +val)
        };
      }
      return {
        chartType: chartType,
        value: '' + (i === 0 ? 'M' : 'L') + x + ',' + y + '\n\r'
      };
    },
    isBar: function isBar(indInfo) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      return indInfo && indInfo.bar && (!key || indInfo.bar.includes(key));
    },

    className: className,
    indexIsInRange: function indexIsInRange(index) {
      return this.cutIndex + this.sliceLength > index && index >= this.cutIndex;
    },
    priceKey: function priceKey() {
      return this.type === CandleTypes[0].value ? 'prices' : 'cPrices';
    }
  }
};

//

var script$6 = {
  name: 'TechIndicator',
  components: { YAxis: YAxis },
  /**
   * @property {Array<{ prices: PricesArray, origin: { x: Number, y: Number } }>} data
   * @property {Object} size, format: { width: Number, height: Number }
   * @property {Object<{ max, min, precision, power }>} range
   * */
  props: {
    paths: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    indicator: Object,
    range: Object,
    heightRate: Number,
    y: Number,
    size: Object,
    fontSize: Number
  },
  computed: {
    deltaX: function deltaX() {
      return Math.floor(this.candleWidth / 2);
    },
    yAxisOrigin: function yAxisOrigin() {
      return { x: this.size.width, y: Math.round(this.y) };
    },
    keys: function keys() {
      var _this = this;

      if (!this.indicator) return [];
      return this.indicator.order ? Object.keys(this.paths).sort(function (a, b) {
        var indexA = Object.keys(_this.indicator.order).find(function (k) {
          return a.includes(_this.indicator.order[k]);
        });
        var indexB = Object.keys(_this.indicator.order).find(function (k) {
          return b.includes(_this.indicator.order[k]);
        });
        return indexA - indexB;
      }) : Object.keys(this.paths);
    }
  }
};

/* script */
var __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('g', { staticClass: "tech-indicator" }, [_c('y-axis', { attrs: { "origin": _vm.yAxisOrigin, "height": _vm.size.height, "heightRate": _vm.heightRate, "range": _vm.range, "fontSize": _vm.fontSize, "type": "indicator" }, on: { "yWidth": function yWidth($event) {
        _vm.$emit('yWidth', $event);
      } } }), _vm._v(" "), _vm.indicator ? _c('g', { attrs: { "clip-path": "url(#chart-content-clip)" } }, _vm._l(_vm.keys, function (k) {
    return _c('path', { key: k, class: ['indicator-' + _vm.paths[k].chartType, _vm.indicator.value + '-' + k, _vm.paths[k].classType], attrs: { "d": _vm.paths[k].value } });
  })) : _vm._e()], 1);
};
var __vue_staticRenderFns__$6 = [];

/* style */
var __vue_inject_styles__$6 = undefined;
/* scoped */
var __vue_scope_id__$6 = undefined;
/* module identifier */
var __vue_module_identifier__$6 = undefined;
/* functional template */
var __vue_is_functional_template__$6 = false;
/* component normalizer */
function __vue_normalize__$6(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "TechIndicator.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var TechIndicator = __vue_normalize__$6({ render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 }, __vue_inject_styles__$6, __vue_script__$6, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$7 = {
  name: 'icon-full-screen',
  props: {
    type: String,
    width: Number,
    height: Number
  }
};

/* script */
var __vue_script__$7 = script$7;

/* template */
var __vue_render__$7 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _vm.type !== 'exit' ? _c('svg', { staticClass: "icon-full-screen", staticStyle: { "enable-background": "new 0 0 128 128" }, attrs: { "viewBox": "0 0 128 128", "width": _vm.width, "height": _vm.height }, on: { "click": function click($event) {
        _vm.$emit('update:type', 'exit');
      } } }, [_c('path', { attrs: { "d": "M112,128H80v-8h32c4.4,0,8-3.6,8-8V80h8v32C128,120.8,120.8,128,112,128C112,128,112,128,112,128z\n   M120,16c0-4.4-3.6-8-8-8c0,0,0,0,0,0H80V0h32c8.8,0,16,7.2,16,16v32h-8C120,48,120,16,120,16z\n   M0,112V80h8v32c0,4.4,3.6,8,8,8c0,0,0,0,0,0h32v8H16C7.2,128,0,120.8,0,112C0,112,0,112,0,112z\n   M8,16v32H0V16C0,7.2,7.2,0,16,0c0,0,0,0,0,0h32v8H16C11.6,8,8,11.6,8,16C8,16,8,16,8,16z" } })]) : _c('svg', { staticClass: "icon-full-screen", staticStyle: { "enable-background": "new 0 0 128 128" }, attrs: { "viewBox": "0 0 128 128", "width": _vm.width, "height": _vm.height }, on: { "click": function click($event) {
        _vm.$emit('update:type', '');
      } } }, [_c('path', { attrs: { "d": "M96,80h32v8H96c-4.4,0-8,3.6-8,8v32h-8V96C80,87.2,87.2,80,96,80C96,80,96,80,96,80z\n  M88,32c0,4.4,3.6,8,8,8c0,0,0,0,0,0l32,0v8H96c-8.8,0-16-7.2-16-16V0l8,0C88,0,88,32,88,32z\n  M48,96v32h-8V96c0-4.4-3.6-8-8-8c0,0,0,0,0,0H0l0-8h32C40.8,80,48,87.2,48,96C48,96,48,96,48,96z\n  M40,32V0l8,0v32c0,8.8-7.2,16-16,16c0,0,0,0,0,0H0l0-8l32,0C36.4,40,40,36.4,40,32C40,32,40,32,40,32z" } })]);
};
var __vue_staticRenderFns__$7 = [];

/* style */
var __vue_inject_styles__$7 = undefined;
/* scoped */
var __vue_scope_id__$7 = undefined;
/* module identifier */
var __vue_module_identifier__$7 = undefined;
/* functional template */
var __vue_is_functional_template__$7 = false;
/* component normalizer */
function __vue_normalize__$7(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "IconFullScreen.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var IconFullScreen = __vue_normalize__$7({ render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 }, __vue_inject_styles__$7, __vue_script__$7, __vue_scope_id__$7, __vue_is_functional_template__$7, __vue_module_identifier__$7, undefined, undefined);

//

var script$8 = {
  name: 'ToolBar',
  inject: ['lang', '$tr'],
  components: { IconFullScreen: IconFullScreen },
  props: {
    isMobile: Boolean,
    periodVal: Object,
    isFull: Boolean,
    showIndicators: Array
  },
  data: function data() {
    return {
      period: {
        value: Times[3],
        options: Times
      },
      candleType: {
        value: CandleTypes[0],
        options: CandleTypes
      },
      indicators: {
        value: [],
        options: Indicators
      },
      fullScreen: '',
      showOption: ''
    };
  },

  watch: {
    'showIndicators': {
      handler: function handler(val) {
        if (val) this.indicators.value = val;
      },

      immediate: true
    },
    'periodVal': {
      handler: function handler(val) {
        this.period.value = Times.find(function (t) {
          return val && t.value === val.value && t.name === val.name;
        }) || Times[0];
        if (val !== this.period.value.value) this.emitPeriod(this.period.value);
      },

      immediate: true
    },
    'candleType.value': {
      handler: function handler(val) {
        this.$emit('candleType', val.value);
      },

      immediate: true
    },
    'indicators.value': {
      handler: function handler(val) {
        if (val !== this.showIndicators) this.$emit('update:showIndicators', val);
      },

      immediate: true
    },
    fullScreen: function fullScreen(val) {
      this.$emit('isFullScreen', val === 'exit');
    },

    'isFull': {
      handler: function handler(val) {
        this.fullScreen = val ? 'exit' : '';
      },

      immediate: true
    }
  },
  methods: {
    choseIndicator: function choseIndicator(item, type) {
      var _this = this;

      var index = Object.keys(this.indicators.value).find(function (k) {
        return _this.indicators.value[k].type === type;
      });
      if (index) {
        if (this.indicators.value[index].value === item.value) this.indicators.value.splice(index, 1);else this.indicators.value.splice(index, 1, item);
      } else {
        this.indicators.value.push(item);
      }
    },
    emitPeriod: function emitPeriod(val) {
      this.$emit('period', val);
    },
    show: function show(type) {
      if (type === this.showOption) this.hideOption();else this.showOption = type;
    },
    hideOption: function hideOption() {
      this.showOption = '';
    }
  },
  beforeMount: function beforeMount() {
    if (!this.isMobile) window.addEventListener('click', this.hideOption);else window.addEventListener('touchstart', this.hideOption);
  },
  beforeDestroy: function beforeDestroy() {
    if (!this.isMobile) window.removeEventListener('click', this.hideOption);else window.removeEventListener('touchstart', this.hideOption);
  }
};

/* script */
var __vue_script__$8 = script$8;

/* template */
var __vue_render__$8 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "tool-bar" }, [_c('div', { staticClass: "periods", class: { mobile: _vm.isMobile }, on: { "click": function click($event) {
        $event.stopPropagation();_vm.show('periods');
      } } }, [_vm.isMobile ? [_vm._v("\n      " + _vm._s(_vm.$tr('periods')) + "\n      "), _c('div', { staticClass: "options", class: { show: _vm.showOption === 'periods' } }, _vm._l(_vm.period.options, function (t) {
    return _c('button', { key: t.name, staticClass: "option", class: { selected: _vm.period.value === t || _vm.period.value.name === t.name && _vm.period.value.value === t.value }, on: { "touchstart": function touchstart($event) {
          $event.stopPropagation();
        }, "click": function click($event) {
          $event.stopPropagation();_vm.emitPeriod(t);
        } } }, [_vm._v(_vm._s(_vm.$tr(t.name)) + "\n        ")]);
  }))] : _vm._l(_vm.period.options, function (t) {
    return _c('button', { key: t.name, staticClass: "period", class: { selected: _vm.period.value === t }, on: { "click": function click($event) {
          _vm.emitPeriod(t);
        } } }, [_vm._v(_vm._s(_vm.$tr(t.name)) + "\n      ")]);
  })], 2), _vm._v(" "), _c('div', { staticClass: "candle-types", on: { "click": function click($event) {
        $event.stopPropagation();_vm.show('candle-types');
      } } }, [_vm._v("\n    " + _vm._s(_vm.$tr('candle-types')) + "\n    "), _c('div', { staticClass: "options", class: { show: _vm.showOption === 'candle-types' } }, _vm._l(_vm.candleType.options, function (type) {
    return _c('button', { key: type.value, staticClass: "option", class: { selected: _vm.candleType.value === type }, on: { "touchstart": function touchstart($event) {
          $event.stopPropagation();
        }, "click": function click($event) {
          $event.stopPropagation();_vm.candleType.value = type;
        } } }, [_vm._v(_vm._s(_vm.$tr(type.name)) + "\n      ")]);
  }))]), _vm._v(" "), _c('div', { staticClass: "indicators", on: { "click": function click($event) {
        $event.stopPropagation();_vm.show('indicators');
      } } }, [_vm._v("\n    " + _vm._s(_vm.$tr('indicators')) + "\n    "), _c('div', { staticClass: "options", class: { show: _vm.showOption === 'indicators' } }, [_vm._l(_vm.indicators.options, function (g, k, i) {
    return [_c('h5', { key: k + '-caption', staticClass: "caption" }, [_vm._v(_vm._s(_vm.$tr('indicators.' + k)))]), _vm._v(" "), _c('div', { key: k + '-options', staticClass: "option-group" }, _vm._l(g, function (i) {
      return _c('button', { key: i.value, staticClass: "option", class: { selected: _vm.indicators.value.some(function (ind) {
            return ind.value === i.value;
          }) }, on: { "touchstart": function touchstart($event) {
            $event.stopPropagation();
          }, "click": function click($event) {
            $event.stopPropagation();_vm.choseIndicator(i, k);
          } } }, [_vm._v(_vm._s(_vm.$tr(i.name)) + "\n          ")]);
    })), _vm._v(" "), i === 0 ? _c('div', { key: k + '-decoration', staticClass: "decoration" }) : _vm._e()];
  })], 2)]), _vm._v(" "), _c('div', { staticClass: "icon-full" }, [_c('span', { staticClass: "tool-tip" }, [_vm._v(_vm._s(_vm.$tr(_vm.fullScreen === 'exit' ? 'full-screen-exit' : 'full-screen')))]), _vm._v(" "), _c('icon-full-screen', { attrs: { "type": _vm.fullScreen }, on: { "update:type": function updateType($event) {
        _vm.fullScreen = $event;
      } } })], 1)]);
};
var __vue_staticRenderFns__$8 = [];

/* style */
var __vue_inject_styles__$8 = undefined;
/* scoped */
var __vue_scope_id__$8 = undefined;
/* module identifier */
var __vue_module_identifier__$8 = undefined;
/* functional template */
var __vue_is_functional_template__$8 = false;
/* component normalizer */
function __vue_normalize__$8(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "ToolBar.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var ToolBar = __vue_normalize__$8({ render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 }, __vue_inject_styles__$8, __vue_script__$8, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, undefined, undefined);

//

var script$9 = {
  name: 'Volume',
  components: { YAxis: YAxis },
  /**
   * @property {Array<{ prices: PricesArray, origin: { x: Number, y: Number } }>} data
   * @property {Object} size, format: { width: Number, height: Number }
   * @property {Object<{ max, min, precision, power }>} range
   * */
  props: {
    paths: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    range: Object,
    heightRate: Number,
    y: Number,
    size: Object,
    svgWidth: Number,
    showHLine: Boolean,
    fontSize: Number
  },
  computed: {
    yAxisOrigin: function yAxisOrigin() {
      return { x: this.size.width, y: Math.round(this.y) };
    },
    rectY: function rectY() {
      return Math.round(this.y + this.size.height - 1);
    }
  }
};

/* script */
var __vue_script__$9 = script$9;

/* template */
var __vue_render__$9 = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('g', { staticClass: "volumes", staticStyle: { "overflow": "hidden" } }, [_c('y-axis', { attrs: { "origin": _vm.yAxisOrigin, "height": _vm.size.height, "heightRate": _vm.heightRate, "range": _vm.range, "fontSize": _vm.fontSize, "type": "volume" }, on: { "yWidth": function yWidth($event) {
        _vm.$emit('yWidth', $event);
      } } }), _vm._v(" "), _c('g', { attrs: { "clip-path": "url(#chart-content-clip)" } }, _vm._l(_vm.paths, function (p, k) {
    return _c('path', { key: k, staticClass: "volume", class: k, attrs: { "d": p } });
  })), _vm._v(" "), _vm.showHLine ? _c('rect', { staticClass: "h-line", attrs: { "x": 0, "y": _vm.rectY, "width": _vm.svgWidth, "height": "1" } }) : _vm._e()], 1);
};
var __vue_staticRenderFns__$9 = [];

/* style */
var __vue_inject_styles__$9 = undefined;
/* scoped */
var __vue_scope_id__$9 = undefined;
/* module identifier */
var __vue_module_identifier__$9 = undefined;
/* functional template */
var __vue_is_functional_template__$9 = false;
/* component normalizer */
function __vue_normalize__$9(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "Volumes.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var Volumes = __vue_normalize__$9({ render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 }, __vue_inject_styles__$9, __vue_script__$9, __vue_scope_id__$9, __vue_is_functional_template__$9, __vue_module_identifier__$9, undefined, undefined);

//

var script$a = {
  name: 'XAxis',
  inject: ['lang', '$tr'],
  /**
   * time unit(时间单位)，millisecond(毫秒)
   * @property {Array<{ prices: PricesArray, originX: Number, baseInd: Object|Number, techInd: Object|Number }>} cData
   * */
  props: {
    y: Number,
    width: Number,
    period: Number,
    candleWidth: Number,
    candleInterval: Number,
    data: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    showLength: Number,
    fontSize: Number
  },
  data: function data() {
    return {
      acceptedIntervals: [{ value: 2 * 60 * 1000, bold: 30 * 60 * 1000, name: '2min' }, { value: 3 * 60 * 1000, bold: 30 * 60 * 1000, name: '3min' }, { value: 4 * 60 * 1000, bold: 30 * 60 * 1000, name: '4min' }, { value: 5 * 60 * 1000, bold: 30 * 60 * 1000, name: '5min' }, { value: 10 * 60 * 1000, bold: 30 * 60 * 1000, name: '10min' }, { value: 15 * 60 * 1000, bold: 60 * 60 * 1000, name: '15min' }, { value: 30 * 60 * 1000, bold: 60 * 60 * 1000, name: '30min' }, { value: 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '60min' }, { value: 1.5 * 60 * 60 * 1000, mod: 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '1.5hour' }, { value: 3 * 60 * 60 * 1000, mod: 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '3hour' }, { value: 6 * 60 * 60 * 1000, mod: 4 * 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '6hour' }, { value: 12 * 60 * 60 * 1000, mod: 4 * 60 * 60 * 1000, bold: 24 * 60 * 60 * 1000, name: '12hour' }, { value: 24 * 60 * 60 * 1000, mod: 16 * 60 * 60 * 1000, bold: 'month', name: '1d' }, { value: 2 * 24 * 60 * 60 * 1000, mod: 40 * 60 * 60 * 1000, bold: 'month', name: '2d' }, { value: 3 * 24 * 60 * 60 * 1000, mod: 64 * 60 * 60 * 1000, bold: 'month', name: '3d' }, { value: 4 * 24 * 60 * 60 * 1000, mod: 88 * 60 * 60 * 1000, bold: 'month', name: '4d' }, { value: 5 * 24 * 60 * 60 * 1000, mod: 112 * 60 * 60 * 1000, bold: 'month', name: '5d' }, { value: 6 * 24 * 60 * 60 * 1000, mod: 136 * 60 * 60 * 1000, bold: 'month', name: '6d' }, { value: 7 * 24 * 60 * 60 * 1000, mod: 160 * 60 * 60 * 1000, bold: 'month', name: '7d' }, { value: 8 * 24 * 60 * 60 * 1000, mod: 184 * 60 * 60 * 1000, bold: 'month', name: '8d' }, { value: 9 * 24 * 60 * 60 * 1000, mod: 208 * 60 * 60 * 1000, bold: 'month', name: '9d' }, { value: 10 * 24 * 60 * 60 * 1000, mod: 232 * 60 * 60 * 1000, bold: 'month', name: '10d' }, { value: 15 * 24 * 60 * 60 * 1000, bold: 'month', alias: '15d' }, { value: 30 * 24 * 60 * 60 * 1000, bold: 'year', alias: '1mon' }, { value: 60 * 24 * 60 * 60 * 1000, bold: 'year', alias: '2mon' }, { value: 90 * 24 * 60 * 60 * 1000, bold: 'year', alias: '3mon' }, { value: 120 * 24 * 60 * 60 * 1000, bold: 'year', alias: '4mon' }],
      textDelta: Sizes.textDelta,
      markerLineLength: Sizes.markerLineLength
    };
  },

  computed: {
    cY: function cY() {
      return Math.round(this.y);
    },
    cWidth: function cWidth() {
      return Math.round(this.width);
    },
    delta: function delta() {
      return Math.floor(this.candleWidth / 2);
    },
    candleOffsetWidth: function candleOffsetWidth() {
      return this.candleInterval + this.candleWidth;
    },
    distanceOfTwo: function distanceOfTwo() {
      return {
        max: Math.floor(XAxisUnitWidth * 2 / this.candleOffsetWidth),
        min: Math.ceil(XAxisUnitWidth / this.candleOffsetWidth)
      };
    },
    showRule: function showRule() {
      var _this = this;

      if (!this.period) return this.acceptedIntervals[this.acceptedIntervals.length - 1];
      var cInterval = this.period;
      var match = this.acceptedIntervals.filter(function (acc) {
        var value = acc.value;

        var n = value / cInterval;
        return _this.distanceOfTwo.max >= n && n >= _this.distanceOfTwo.min;
      });
      return match[match.length - 1] || this.acceptedIntervals[this.acceptedIntervals.length - 1];
    },
    coords: function coords() {
      var _this2 = this;

      var length = this.data.length;

      if (!this.showLength || !this.period || !length || !this.periodMatchedData()) return [];
      var _showRule = this.showRule,
          value = _showRule.value,
          _showRule$mod = _showRule.mod,
          mod = _showRule$mod === undefined ? 0 : _showRule$mod,
          alias = _showRule.alias;

      var lastItem = this.data[length - 1];
      var last = { time: lastItem.prices[0], x: lastItem.originX };
      return this.data.concat([].concat(toConsumableArray(Array(Math.max(0, +this.showLength - this.data.length)))).reduce(function (pre) {
        last.time = +last.time + _this2.period;
        last.x += _this2.candleOffsetWidth;
        return pre.concat([{ prices: [last.time], originX: last.x }]);
      }, [])).reduce(function (pre, _ref) {
        var prices = _ref.prices,
            originX = _ref.originX;

        var _prices = slicedToArray(prices, 1),
            time = _prices[0];

        if (alias) {
          var date = getDate(+time);
          if (alias === '15d') {
            if (date === 15 || date === 1) {
              return pre.concat([_this2.calcCoord(prices, originX)]);
            }
            return pre;
          }
          var n = +alias.match(/^(\d)mon/)[1];
          if ((getMonth(+time) + 1) % n === mod && date * 24 * 60 * 60 * 1000 <= _this2.period) {
            return pre.concat([_this2.calcCoord(prices, originX)]);
          }
          return pre;
        }
        if (time % value === mod) {
          return pre.concat([_this2.calcCoord(prices, originX)]);
        }
        return pre;
      }, []);
    }
  },
  watch: {
    coords: {
      handler: function handler() {
        this.emitHeight();
      },

      immediate: true
    }
  },
  methods: {
    periodMatchedData: function periodMatchedData() {
      var _this3 = this;

      if (this.data.length > 1) {
        var getTime = function getTime(index) {
          return _this3.data[index].prices[0];
        };
        var matched = getTime(1) - getTime(0) === this.period;
        // if (!matched) console.warn(`Your data doesn't matched the period(${this.period})`)
        return matched;
      }
      return true;
    },
    calcCoord: function calcCoord(prices, originX) {
      return {
        prices: prices,
        origin: {
          x: originX + this.delta,
          y: this.cY
        },
        text: this.text(+prices[0]),
        bold: this.bold(+prices[0]),
        textY: Math.round(this.cY + this.fontSize + this.textDelta)
      };
    },
    bold: function bold(time) {
      var bool = void 0;
      var bold = this.showRule.bold;

      if (typeof bold === 'number') bool = time % bold === 0;else {
        var t = format(time, 'YYYY-MM-DD HH:mm');
        if (bold === 'month') {
          bool = /\s{4}-\s{2}-01 00:00/.test(t);
        } else {
          bool = /\s{4}-01-01 00:00/.test(t);
        }
      }
      return bool ? 'bold' : '';
    },
    text: function text(time) {
      var _showRule2 = this.showRule,
          name = _showRule2.name,
          alias = _showRule2.alias;

      var t = void 0;
      if (!alias && !/d/.test(name)) {
        t = format(time, 'HH:mm');
        if (t !== '00:00') return t;
      }

      if (!alias || alias && /d/.test(alias)) {
        t = format(time, 'DD');
        if (t !== '01') {
          return t;
        }
      }

      t = format(time, 'MM');
      if (t === '01') return this.$tr('yyyy', { year: format(time, 'YYYY') });
      return this.$tr(Months[getMonth(time)].name);
    },
    emitHeight: function emitHeight() {
      var _this4 = this;

      if (this.coords.length > 0) {
        this.$nextTick(function () {
          var el = _this4.$refs.xAxis[0] || _this4.$refs.xAxis;
          if (el) {
            var rectInfo = getRect$1(el);
            _this4.$emit('xHeight', Math.floor(rectInfo.height + Sizes.textDelta));
          }
        });
      }
    }
  }
};

/* script */
var __vue_script__$a = script$a;

/* template */
var __vue_render__$a = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _vm.period ? _c('g', { staticClass: "x-axis" }, [_c('rect', { staticClass: "axis-line x", attrs: { "x": "0", "y": _vm.cY, "width": _vm.cWidth, "height": "1" } }), _vm._v(" "), _c('g', { staticClass: "axis-coords x" }, _vm._l(_vm.coords, function (c) {
    return _c('g', { key: c.prices[0], ref: "xAxis", refInFor: true, staticClass: "axis-coord x", class: c.bold, attrs: { "clip-path": "url(#chart-content-clip)" } }, [_c('rect', { staticClass: "axis-coord-marker x", attrs: { "x": c.origin.x, "y": c.origin.y, "width": "1", "height": _vm.markerLineLength } }), _vm._v(" "), _c('text', { staticClass: "axis-coord-text x", attrs: { "x": c.origin.x, "y": c.textY, "font-size": _vm.fontSize, "text-anchor": "middle" } }, [_vm._v("\n        " + _vm._s(c.text) + "\n      ")])]);
  })), _vm._v(" "), _c('g', { staticClass: "axis-refline x" }, _vm._l(_vm.coords, function (c) {
    return _c('rect', { key: c.prices[0], staticClass: "axis-coord-marker x", attrs: { "x": c.origin.x, "y": 0, "width": "1", "height": _vm.cY } });
  }))]) : _vm._e();
};
var __vue_staticRenderFns__$a = [];

/* style */
var __vue_inject_styles__$a = undefined;
/* scoped */
var __vue_scope_id__$a = undefined;
/* module identifier */
var __vue_module_identifier__$a = undefined;
/* functional template */
var __vue_is_functional_template__$a = false;
/* component normalizer */
function __vue_normalize__$a(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "XAxis.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var XAxis = __vue_normalize__$a({ render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a }, __vue_inject_styles__$a, __vue_script__$a, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, undefined, undefined);

//

/**
 * @author livelybone
 * @email 2631541504@qq.com
 * */
var script$b = {
  name: 'Index',
  mixins: [LangMixin, DataMixin],
  components: {
    ToolBar: ToolBar,
    Candles: Candles,
    XAxis: XAxis,
    CrossCurve: CrossCurve,
    Volumes: Volumes,
    Loading: Loading,
    CurrPrice: CurrPrice,
    TechIndicator: TechIndicator,
    Legends: Legends
  },
  props: {
    fontSize: {
      type: Number,
      default: Sizes.defaultFontSize
    },
    markerWidth: {
      type: Number,
      default: Sizes.markerWidth
    },
    loading: Boolean,
    period: {
      type: Object,
      default: function _default() {
        return Times[3];
      }
    },
    isMobile: Boolean,
    showIndicators: Array
  },
  data: function data() {
    return {
      author: 'livelybone(2631541504@qq.com)',
      toolbarSize: {},
      loadingSize: Sizes.loadingSize,
      textDelta: Sizes.textDelta,
      axis: {
        x: {
          height: 0
        },
        y: {
          width: 0
        }
      },
      type: CandleTypes[0].value,
      showVolumes: true,
      isFullScreen: false,
      dragOrigin: null,
      indicators: [],
      crossCurveInfo: null,
      touchRes: null,
      scaleOrigin: { time: 0, scale: 1 },
      isPortrait: isPortrait(),
      nearestItem: null
    };
  },

  computed: {
    volumeHeight: function volumeHeight() {
      var _ref = this.size || {},
          _ref$height = _ref.height,
          height = _ref$height === undefined ? Infinity : _ref$height;

      return Math.min(Sizes.volumeChartHeight, Math.floor(height * 1.5 / 10));
    },
    indicatorHeight: function indicatorHeight() {
      var _ref2 = this.size || {},
          _ref2$height = _ref2.height,
          height = _ref2$height === undefined ? Infinity : _ref2$height;

      return Math.min(Sizes.indicatorChartHeight, Math.floor(height * 1.5 / 10));
    },
    viewBox: function viewBox() {
      if (!this.size) return '0 0 0 0';
      return '0 0 ' + this.size.width + ' ' + this.size.height;
    },
    chartSize: function chartSize() {
      if (!this.size) return null;
      return {
        width: Math.round(this.size.width - this.axis.y.width),
        height: Math.round(this.size.height - this.axis.x.height)
      };
    },
    baseIndicator: function baseIndicator() {
      return this.indicators.filter(function (ind) {
        return ind.type === 'base';
      })[0];
    },
    techIndicator: function techIndicator() {
      return this.indicators.filter(function (ind) {
        return ind.type === 'technical';
      })[0];
    },
    candlesSize: function candlesSize() {
      if (!this.size) return null;
      return {
        width: this.chartSize.width,
        height: Math.round(this.chartSize.height - (this.showVolumes ? this.volumeHeight : 0) - (this.techIndicator ? this.indicatorHeight : 0))
      };
    },
    volumesSize: function volumesSize() {
      if (!this.size) return null;
      return { width: this.chartSize.width, height: this.volumeHeight };
    },
    indicatorSize: function indicatorSize() {
      if (!this.size) return null;
      return { width: this.chartSize.width, height: this.indicatorHeight };
    },
    textSize: function textSize() {
      return {
        width: this.markerWidth,
        height: Math.round(this.axis.x.height - this.textDelta / 2)
      };
    },
    crossCurveRangeY: function crossCurveRangeY() {
      return {
        candle: [0, this.candlesSize.height],
        volume: [this.candlesSize.height, Math.round(this.candlesSize.height + this.volumeHeight)],
        indicator: [Math.round(this.candlesSize.height + this.volumeHeight), this.chartSize.height]
      };
    },
    maxDeltaX: function maxDeltaX() {
      return Math.max(Math.ceil((this.cCandleWidth + this.candleInterval) * this.myData.length - this.candlesSize.width), 0);
    },
    legendsOffset: function legendsOffset() {
      return {
        width: this.chartSize.width,
        children: this.crossCurveRangeY
      };
    }
  },
  watch: {
    showIndicators: {
      handler: function handler(val) {
        if (val) {
          this.indicators = [].concat(toConsumableArray(Indicators.base), toConsumableArray(Indicators.technical)).filter(function (ind) {
            return val.includes(ind.value);
          });
        }
      },

      immediate: true
    },
    isFullScreen: function isFullScreen() {
      this.resize();
    },
    size: function size(val) {
      if (val) {
        this.bindTouch();
      }
    }
  },
  methods: {
    /**
     * @description reset
     * */
    reset: function reset() {
      var changeSymbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this.axis.y.width = 0;
      this.dragDeltaX = 0;

      if (changeSymbol) {
        this.originRange = null;
        CNum.pPrecision = 0;
        CNum.volPrecision = 0;
      }
    },
    getSvgOffset: function getSvgOffset() {
      return posRelativeToClient$1(this.$refs.kline);
    },
    getSize: function getSize() {
      var _this = this;

      this.$nextTick(function () {
        var _getRect = getRect$1(_this.$refs.wrap),
            _getRect$width = _getRect.width,
            width = _getRect$width === undefined ? 0 : _getRect$width,
            _getRect$height = _getRect.height,
            height = _getRect$height === undefined ? 0 : _getRect$height;

        _this.toolbarSize = getRect$1(_this.$refs.toolbar.$el);
        var tHeight = _this.toolbarSize.height || 0;
        _this.size = {
          width: +Math.floor(width),
          height: +Math.floor(height - tHeight)
        };
      });
    },
    setXAxisHeight: function setXAxisHeight(height) {
      this.axis.x.height = height;
    },
    setYAxisWidth: function setYAxisWidth(width) {
      this.axis.y.width = Math.max(this.axis.y.width, width);
    },
    resize: function resize() {
      this.isPortrait = isPortrait();
      if (!(this.isMobile && this.isFullScreen && this.isPortrait)) this.getSize();
    },
    startDrag: function startDrag(ev) {
      this.dragOrigin = {
        x: ev.offsetX,
        y: ev.offsetY,
        dragDeltaX: this.dragDeltaX,
        time: ev.timeStamp
      };
      this.$refs.toolbar.hideOption();
    },
    mouseMove: function mouseMove(ev) {
      this.markerMove(ev);
      if (!this.isMobile) this.klineMove(ev);
    },
    endDrag: function endDrag() {
      this.dragOrigin = null;
    },
    klineMove: function klineMove(ev) {
      if (this.dragOrigin) {
        var deltaTime = ev.timeStamp - this.dragOrigin.time;
        if (deltaTime < MsPFrame) return;
        this.dragOrigin.time = ev.timeStamp;
        var deltaX = ev.deltaX !== undefined ? ev.deltaX : ev.offsetX - this.dragOrigin.x;
        if (this.dragOrigin.dragDeltaX === this.maxDeltaX && deltaX > 0) {
          this.$emit('getMorePreData');
          this.dragOrigin = null;
        } else {
          this.dragDeltaX = Math.round(deltaX + this.dragOrigin.dragDeltaX);
          this.dragDeltaX = Math.min(Math.max(0, this.dragDeltaX), this.maxDeltaX);
        }
      }
    },
    markerMove: function markerMove(ev) {
      if (this.cData && this.cData.length > 0) {
        var pos = { x: ev.offsetX, y: ev.offsetY };
        if (pos.x >= 0 && pos.x <= this.chartSize.width && pos.y >= 0 && pos.y <= this.chartSize.height) {
          var y = this.crossCurveRangeY;
          var where = Object.keys(y).find(function (k) {
            var _y$k = slicedToArray(y[k], 2),
                start = _y$k[0],
                end = _y$k[1];

            return start <= pos.y && pos.y <= end;
          });
          var nearest = this.findNearest(this.cData, pos.x);

          var _y$where = slicedToArray(y[where], 1),
              start = _y$where[0];

          var key = where === 'candle' ? 'price' : where;
          var value = this.heightRate[key];
          var rangeY = this.computedRange[key];
          this.nearestItem = _extends({}, this.cData[nearest.index], {
            prices: this.type === CandleTypes[0].value ? this.cData[nearest.index].prices : this.cData[nearest.index].cPrices
          });
          this.crossCurveInfo = {
            origin: {
              x: nearest.x,
              y: Math.floor(+pos.y)
            },
            time: nearest.time,
            value: value !== undefined ? CNum.cVal(rangeY.max - (pos.y - start) / value, rangeY.precision) : start
          };
        } else {
          this.resetCrossCurveInfo();
        }
      }
    },
    resetCrossCurveInfo: function resetCrossCurveInfo() {
      this.crossCurveInfo = null;
      this.nearestItem = null;
    },
    findNearest: function findNearest(dataArr, x) {
      var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      if (dataArr.length < 1) return { index: index, x: 0, time: 0 };
      var middle = Math.floor((dataArr.length - 1) / 2);
      var middleX = this.calcX(dataArr[middle].originX);
      if (dataArr.length < 2) return { index: index, x: middleX, time: dataArr[0].prices[0] };
      if (dataArr.length === 2) {
        var middleX1 = this.calcX(dataArr[1].originX);
        return Math.abs(middleX1 - x) - Math.abs(middleX - x) > 0 ? { index: index, x: middleX, time: dataArr[0].prices[0] } : { index: index + 1, x: middleX1, time: dataArr[1].prices[0] };
      }
      if (middleX - x > 0) {
        return this.findNearest(dataArr.slice(0, middle + 1), x, index);
      }
      if (middleX - x < 0) {
        return this.findNearest(dataArr.slice(middle), x, index + middle);
      }
      return { index: index + middle, x: middleX, time: dataArr[middle].prices[0] };
    },
    calcX: function calcX(originX) {
      return Math.floor(originX + this.cCandleWidth / 2);
    },
    mouseScale: function mouseScale(ev) {
      this.scale(ev.deltaY > 0 ? -1 : 1, ev.timeStamp);
    },
    scale: function scale(flag, timeStamp) {
      var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var deltaTime = timeStamp - this.scaleOrigin.time;
      if (deltaTime < MsPFrame) return;
      this.scaleOrigin = { time: timeStamp, scale: scale };
      var candleWidth = this.candleWidth + 2 * flag;
      var oldWidth = this.candleOffsetWidth;
      if (candleWidth < Sizes.candleMinWidth) this.candleWidth = Sizes.candleMinWidth;else if (candleWidth > Sizes.candleMaxWidth) this.candleWidth = Sizes.candleMaxWidth;else this.candleWidth = candleWidth;

      var scaleFactor = this.candleOffsetWidth / oldWidth;
      if (scaleFactor !== 1) {
        this.dragOrigin = { timeStamp: 0, dragDeltaX: this.dragDeltaX };
        this.klineMove({ deltaX: this.dragDeltaX * (scaleFactor - 1), timeStamp: 100 });
        this.dragOrigin = null;
      }
    },
    bindTouch: function bindTouch() {
      var _this2 = this;

      if (this.isMobile) {
        this.$nextTick(function () {
          if (!_this2.touchRes) {
            _this2.touchRes = [tap(_this2.$refs.cursor, function (_ref3) {
              var _ref3$center = _ref3.center,
                  clientX = _ref3$center.clientX,
                  clientY = _ref3$center.clientY;

              var _getSvgOffset = _this2.getSvgOffset(),
                  clientLeft = _getSvgOffset.clientLeft,
                  clientTop = _getSvgOffset.clientTop;

              _this2.markerMove({ offsetX: clientX - clientLeft, offsetY: clientY - clientTop });
            }), pan(_this2.$refs.cursor, function (eventObject) {
              var type = eventObject.type,
                  timeStamp = eventObject.timeStamp;

              if (type === 'panMove') {
                _this2.resetCrossCurveInfo();
                var deltaX = eventObject.centerDelta.deltaX;

                _this2.klineMove({ deltaX: deltaX, timeStamp: timeStamp });
              } else if (type === 'panStart') {
                _this2.dragOrigin = { dragDeltaX: _this2.dragDeltaX, timeStamp: timeStamp };
              } else if (type === 'panEnd') {
                _this2.dragOrigin = null;
              }
            }), pinch(_this2.$refs.cursor, function (_ref4) {
              var pinchScale = _ref4.pinchScale,
                  timeStamp = _ref4.timeStamp;

              if (pinchScale !== 1) {
                _this2.resetCrossCurveInfo();
                _this2.scale(pinchScale > _this2.scaleOrigin.scale ? 1 : -1, timeStamp, pinchScale);
              }
            }, function (_ref5) {
              var event = _ref5.event;

              _this2.$refs.toolbar.hideOption();
              event.preventDefault();
            })];
          }
        });
      }
    }
  },
  beforeMount: function beforeMount() {
    window.addEventListener('mousemove', this.resetCrossCurveInfo);
    window.addEventListener('resize', this.resize);
  },
  mounted: function mounted() {
    this.getSize();
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('mousemove', this.resetCrossCurveInfo);
    window.removeEventListener('resize', this.resize);
    if (this.touchRes) {
      this.touchRes.forEach(function (res) {
        return res.unsubscribe();
      });
    }
  }
};

/* script */
var __vue_script__$b = script$b;

/* template */
var __vue_render__$b = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "wrap", staticClass: "kline-wrap", class: { 'full-screen': _vm.isFullScreen && !(_vm.isMobile && _vm.isPortrait), 'mobile': _vm.isMobile } }, [_c('tool-bar', { ref: "toolbar", attrs: { "isMobile": _vm.isMobile, "isFull": _vm.isFullScreen, "periodVal": _vm.period, "showIndicators": _vm.indicators }, on: { "update:showIndicators": function updateShowIndicators($event) {
        _vm.indicators = $event;
      }, "period": function period($event) {
        _vm.$emit('update:period', $event);
      }, "candleType": function candleType($event) {
        _vm.type = $event;
      }, "isFullScreen": function isFullScreen($event) {
        _vm.isFullScreen = $event;
      } } }), _vm._v(" "), _c('div', { staticClass: "content-wrap" }, [_c('svg', { ref: "kline", staticClass: "kline", attrs: { "width": _vm.size && _vm.size.width, "height": _vm.size && _vm.size.height, "viewBox": _vm.viewBox } }, [_vm.chartSize ? [_c('defs', [_c('clipPath', { attrs: { "id": "chart-content-clip" } }, [_c('rect', { attrs: { "x": "0", "y": "0", "width": _vm.chartSize.width, "height": _vm.size.height } })])]), _vm._v(" "), _vm.period ? _c('x-axis', { attrs: { "data": _vm.cData, "showLength": _vm.sliceLength, "candleWidth": _vm.cCandleWidth, "candleInterval": _vm.candleInterval, "y": _vm.chartSize.height, "width": _vm.candlesSize.width, "period": _vm.period.value, "fontSize": _vm.fontSize }, on: { "xHeight": _vm.setXAxisHeight } }) : _vm._e(), _vm._v(" "), _vm.candlesSize && _vm.computedRange ? _c('candles', { attrs: { "size": _vm.candlesSize, "indicator": _vm.baseIndicator, "paths": _vm.candlePaths, "range": _vm.computedRange.price, "heightRate": _vm.heightRate.price, "showHLine": true, "svgWidth": _vm.size.width, "fontSize": _vm.fontSize }, on: { "yWidth": _vm.setYAxisWidth } }) : _vm._e(), _vm._v(" "), _vm.showVolumes && _vm.volumesSize && _vm.computedRange ? _c('volumes', { attrs: { "paths": _vm.volumePaths, "range": _vm.computedRange.volume, "heightRate": _vm.heightRate.volume, "y": _vm.crossCurveRangeY.volume[0], "size": _vm.volumesSize, "svgWidth": _vm.size.width, "showHLine": !!_vm.techIndicator, "fontSize": _vm.fontSize }, on: { "yWidth": _vm.setYAxisWidth } }) : _vm._e(), _vm._v(" "), _vm.techIndicator && _vm.computedRange ? _c('tech-indicator', { attrs: { "indicator": _vm.techIndicator, "paths": _vm.techIndPaths, "range": _vm.computedRange.indicator, "heightRate": _vm.heightRate.indicator, "y": _vm.crossCurveRangeY.indicator[0], "size": _vm.indicatorSize, "fontSize": _vm.fontSize }, on: { "yWidth": _vm.setYAxisWidth } }) : _vm._e(), _vm._v(" "), _vm.currPrice ? _c('curr-price', { attrs: { "y": _vm.currPrice.y, "width": _vm.candlesSize.width, "price": _vm.currPrice.value, "fontSize": _vm.fontSize, "textWidth": _vm.markerWidth, "isUp": _vm.currPrice.isUp } }) : _vm._e(), _vm._v(" "), _vm.axis.x.height && _vm.crossCurveInfo ? _c('cross-curve', { attrs: { "origin": _vm.crossCurveInfo.origin, "time": _vm.crossCurveInfo.time, "value": _vm.crossCurveInfo.value, "fontSize": _vm.fontSize, "textSize": _vm.textSize, "chartSize": _vm.chartSize } }) : _vm._e(), _vm._v(" "), _c('rect', { ref: "cursor", staticClass: "cursor", attrs: { "x": "0", "y": "0", "width": _vm.chartSize.width, "height": _vm.chartSize.height }, on: { "mousedown": _vm.startDrag, "mousemove": function mousemove($event) {
        $event.stopPropagation();return _vm.mouseMove($event);
      }, "mouseup": _vm.endDrag, "wheel": function wheel($event) {
        $event.stopPropagation();$event.preventDefault();return _vm.mouseScale($event);
      } } })] : _vm._e()], 2), _vm._v(" "), _vm.size ? _c('legends', { attrs: { "lastPrices": _vm.currPrices, "nearestItem": _vm.nearestItem, "offset": _vm.legendsOffset, "baseIndicator": _vm.baseIndicator, "techIndicator": _vm.techIndicator } }) : _vm._e(), _vm._v(" "), _vm.loading ? _c('div', { staticClass: "loading-wrap" }, [_c('loading', { attrs: { "width": _vm.loadingSize, "height": _vm.loadingSize } })], 1) : _vm.myData.length < 1 ? _c('div', { staticClass: "no-data" }, [_c('div', { staticClass: "text" }, [_vm._v(_vm._s(_vm.$tr('data.no')))])]) : _vm.isMobile && _vm.isFullScreen && _vm.isPortrait ? _c('div', { staticClass: "see-landscape" }, [_c('div', { staticClass: "text" }, [_vm._v("\n        " + _vm._s(_vm.$tr('see.landscape'))), _c('br'), _vm._v(" "), _c('button', { staticClass: "back-to-portrait", on: { "click": function click($event) {
        _vm.isFullScreen = false;
      } } }, [_vm._v(_vm._s(_vm.$tr('back-to-portrait')) + "\n        ")])])]) : _vm._e()], 1)], 1);
};
var __vue_staticRenderFns__$b = [];

/* style */
var __vue_inject_styles__$b = undefined;
/* scoped */
var __vue_scope_id__$b = undefined;
/* module identifier */
var __vue_module_identifier__$b = undefined;
/* functional template */
var __vue_is_functional_template__$b = false;
/* component normalizer */
function __vue_normalize__$b(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {};

  // For security concerns, we use only base name in production mode.
  component.__file = "Index.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;

    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */

var Index = __vue_normalize__$b({ render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b }, __vue_inject_styles__$b, __vue_script__$b, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, undefined, undefined);

export default Index;
//# sourceMappingURL=index.js.map
