import * as R from 'ramda';
import { fromPairs, map, prop, compose, filter, mergeWith, ifElse, apply, view } from 'ramda';
import { mergeDeep, filterWithKeys, mapPropValueAsIndex } from 'rescape-ramda';

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
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
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var _module$exports;

function _defineProperty(obj, key, value) {
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
} //----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------


var Result = require('./result');

var _require = require('../adt/union/union'),
    typeSymbol = _require.typeSymbol;
/*~
 * stability: stable
 * name: module folktale/result
 */


module.exports = (_module$exports = {
  Error: Result.Error,
  Ok: Result.Ok,
  hasInstance: Result.hasInstance,
  of: Result.of,
  fromJSON: Result.fromJSON
}, _defineProperty(_module$exports, typeSymbol, Result[typeSymbol]), _defineProperty(_module$exports, 'try', require('./try')), _defineProperty(_module$exports, 'fromNullable', function fromNullable(aNullable, fallbackValue) {
  var nullableToResult = require('../conversions/nullable-to-result');

  if (arguments.length > 1) {
    // eslint-disable-line prefer-rest-params 
    return nullableToResult(aNullable, fallbackValue);
  } else {
    return nullableToResult(aNullable);
  }
}), _defineProperty(_module$exports, 'fromValidation', function fromValidation(aValidation) {
  return require('../conversions/validation-to-result')(aValidation);
}), _defineProperty(_module$exports, 'fromMaybe', function fromMaybe(aMaybe, failureValue) {
  return require('../conversions/maybe-to-result')(aMaybe, failureValue);
}), _module$exports);

var Result$1 = /*#__PURE__*/Object.freeze({

});

/**
 * Object statuses
 * @type {{IS_SELECTED: string, IS_ACTIVE: string}}
 */

var STATUS = {
  IS_SELECTED: 'isSelected',
  IS_ACTIVE: 'isActive'
};
/**
 * Object to lookup a particular status
 * @type {{}}
 * @returns {Object} Object keyed by status key and valued a function that resolves the value of that
 * status property for whatever object is passed to it
 */

var status = fromPairs(map(function (theStatus) {
  return [theStatus, prop(theStatus)];
}, [STATUS.IS_SELECTED, STATUS.IS_ACTIVE]));
var mergeStateAndProps = function mergeStateAndProps(state, props) {
  return mergeDeep(state, props);
};
/**
 * Makes a selector that merges a props object with a state object at a certain matching lens location,
 * and then filters the result of the merge based on the given predicate. This is used for example:
 * If there are Region objects in the state and User object as the props that contains Regions,
 * the lens is R.lensProp('regions') and checks to see which regions of the user are active and
 * returns the regions of the state that match.
 *
 * The predicate checks properties appended to the userSettings version of the data, such as
 * checking for keys like 'isSelected' or 'willDelete' or 'willAdd'
 * @param {Function} innerJoinPredicate Predicate to determine whether each item targeted by stateLens and propLens
 * @param {Function} predicate Predicate that expects each merged value of the container of the lens
 * @param {Function} stateLens Ramda lens to winnow in on the property of the state to be merged with props and then filtered
 * @param {Function} propsLens Ramda lens to winnow in on the props to merge with the target of the state lens
 * for the state and userSettings. It's possible for a value to only exist in the state and not
 * in the userSettings (and possibly visa-versa if the user is creating something new). These will
 * be included in the merge and run through the predicate
 * @returns {Function} A selector expecting a state and props that returns the filtered merged value pointed to by the lens
 *
 * Example:
 * lens R.lensPath(['foos', 'bars'])
 * predicate value => value.isSelected
 * state: {foos: {bars: [{id: 'bar1', name: 'Bar 1'}, {id: 'bar2', name: 'Bar 2'}]}}
 * props: {foos: {bars: {bar1: {id: 'bar1', isSelected: true}, bar2: {id: 'bar2'}}}}
 * returns: {bar1: {id: 'bar1', name: 'Bar 1' isSelected: true}}
 */

var makeInnerJoinByLensThenFilterSelector = function makeInnerJoinByLensThenFilterSelector(innerJoinPredicate, predicate, stateLens, propsLens) {
  return function (state, props) {
    return compose( // Combine the lens focused userValue and state value if they pass the innerJoinPredicate
    filterWithKeys(function (value, key) {
      return predicate(value);
    }), map( // Finally extract the result value
    function (result) {
      return result.unsafeGet();
    }), filter( // Filter for Result.Ok
    function (result) {
      return undefined(result);
    }), function (args) {
      return mergeWith.apply(R, [function (l, r) {
        return ifElse( // Do they pass the inner predicate? (use .value since Left.get() isn't allowed)
        function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              ll = _ref2[0],
              rr = _ref2[1];

          return apply(innerJoinPredicate, [ll.value, rr.value]);
        }, // Yes pass, convert to Result.Ok
        function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              ll = _ref4[0],
              rr = _ref4[1];

          return undefined(apply(mergeDeep, [ll.value, rr.value]));
        }, // Fail, empty Left
        function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              ll = _ref6[0],
              rr = _ref6[1];

          return undefined();
        })([l, r]);
      }].concat(_toConsumableArray(args)));
    }, map( // Make sure each is keyed by id before merging
    // Mark everything as Result.Error initially. Only things that match and pass the innerJoin predicate
    // will get converted to Result.Ok
    function (items) {
      return map(undefined, mapPropValueAsIndex('id', items));
    }))([view(stateLens, state), view(propsLens, props)]);
  };
};

export { STATUS, makeInnerJoinByLensThenFilterSelector, mergeStateAndProps, status };
//# sourceMappingURL=selectorHelpers.js.map
