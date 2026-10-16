import assert from 'node:assert/strict';
import {facadeVatScenarios} from '../static-site/assets/js/facade-vat.js';
assert.deepEqual(facadeVatScenarios(34046,'renovation'), [{rate:6,vat:2042.76,total:36088.76},{rate:21,vat:7149.66,total:41195.66}]);
assert.deepEqual(facadeVatScenarios(15100,'renovation'), [{rate:6,vat:906,total:16006},{rate:21,vat:3171,total:18271}]);
assert.deepEqual(facadeVatScenarios(34046,'new'), [{rate:21,vat:7149.66,total:41195.66}]);
for (const value of [NaN,Infinity,-1]) assert.throws(()=>facadeVatScenarios(value,'renovation'),RangeError);
assert.throws(()=>facadeVatScenarios(100,'unknown'),RangeError);
assert.deepEqual(facadeVatScenarios(100.01,'renovation'), [{rate:6,vat:6,total:106.01},{rate:21,vat:21,total:121.01}]);
console.log('PASS: 6/21 percent renovation scenarios; 21 percent new-build scenario; cents and invalid inputs.');
