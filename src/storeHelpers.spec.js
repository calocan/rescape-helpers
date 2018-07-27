/**
 * Created by Andy Likuski on 2017.06.22
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import * as R from 'ramda';
import {createReduxStore} from './storeHelpers';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import {applyMiddleware, compose} from 'redux';

const loggerMiddleware = createLogger();
const middlewares = [thunk, loggerMiddleware];
const enhancers = compose(applyMiddleware(...middlewares));

describe('store', () => {
  test('storeCreator', () => {
    const initialState = {browser: {}, regions: {}, styles: {}, users: {}, settings: {}};
    const store = createReduxStore((state, action) => state, initialState, enhancers);
    const state = store.getState();
    expect(
      R.map(R.always({}), state)
    ).toEqual(
      {browser: {}, regions: {}, styles: {}, users: {}, settings: {}}
    );
  });
});