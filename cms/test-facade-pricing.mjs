import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {calculateFacade, PRICE_FACTOR} from '../static-site/assets/js/facade-pricing.js';
const base = {building:'renovation',finish:'crepi',thickness:14,gross:201,net:201,height:11,plinth:'stone',plinthLength:21,aluminium:1,stone:1};
assert.equal(PRICE_FACTOR,1);
const r=calculateFacade(base);
assert.equal(r.facade,31356); assert.equal(r.extras,2690);
assert.equal(r.referencePremium,2250); assert.equal(r.referenceTotal,31796);
assert.equal(r.referenceBeforePremium,34046); assert.equal(r.arcadianBeforePremium,34046);
assert.equal(r.arcadianFacade + r.arcadianExtras,r.arcadianBeforePremium);
for(const patch of [{net:202},{gross:NaN},{height:0},{height:26},{thickness:5},{finish:'__proto__'},{plinthLength:-1},{gross:1.5}]) assert.throws(()=>calculateFacade({...base,...patch}),RangeError);
const direct=calculateFacade({...base,finish:'cork_direct'});
assert.equal(direct.project.thickness,0); assert.equal(direct.project.aluminium,0);assert.equal(direct.referencePremium,0);
const newer=calculateFacade({...base,building:'new'});assert.equal(newer.project.aluminium,0);assert.equal(newer.project.stone,0);
assert.equal(calculateFacade({...base,gross:1,net:1,plinth:'none',plinthLength:0,aluminium:0,stone:0,thickness:0}).arcadianBeforePremium,10000);
let compared=0;
if (process.argv[2]) {
  // Execute ONLY the reviewed, pure arithmetic function in an isolated VM.
  // No page execution, requests, credentials or jQuery runtime.
  const source=readFileSync(process.argv[2],'utf8');
  const start=source.indexOf('function getPrice() {');
  const finish=source.lastIndexOf('\n});');
  assert(start>0&&finish>start);
  let values={}, outputs={};
  const dollar=selector=>({
    val(value){if(value!==undefined){outputs[selector]=value;return this;} const key=selector.match(/name="([^"]+)"/)?.[1];return values[key];},
    text(value){outputs[selector]=value;return this;},hide(){return this;},show(){return this;},
  });
  const run=vm.runInNewContext(`(function(){const minTotalCost=10000; ${source.slice(start,finish)}; return getPrice;})()`,{$:dollar},{timeout:1000});
  const mapping={crepi:['plaster',null,null],cork_direct:['spray cork','surface',null],cork_layer:['spray cork','layer',null],brick_ungrouted:['steenstrips',null,'ungrouted'],brick_grouted:['steenstrips',null,'grouted'],lime:['lime wash',null,null]};
  const areas=[[1,1],[49,40],[50,40],[51,40],[74,74],[75,75],[76,76],[99,99],[100,100],[101,101],[150,150],[151,151],[250,200],[251,200],[1000,1000]];
  for(const building of ['new','renovation']) for(const variant of Object.keys(mapping)) for(const thickness of [0,...Array.from({length:14},(_,i)=>4+i*2)]) {
    if(['lime','cork_direct'].includes(variant)&&thickness!==0)continue;
    for(const [gross,net] of areas) for(const height of [1,10,11,25]) for(const extras of [{plinth:'none',plinthLength:0,aluminium:0,stone:0},{plinth:'stone',plinthLength:21,aluminium:1,stone:1},{plinth:'finish',plinthLength:100,aluminium:50,stone:50}]) {
      if(variant.startsWith('brick_')&&extras.plinth==='finish')continue;
      const actual=calculateFacade({...base,building,finish:variant,thickness,gross,net,height,...extras});
      const p=actual.project;const [finishValue,spray,stoneType]=mapping[variant];
      values={building,finish:finishValue,spray_cork_application:spray,steenstrips_application:stoneType,isolate:p.thickness?'True':'False',isolation_thickness:p.thickness||4,surface_incl_windows:gross,surface_excl_windows:net,plinth:p.plinth==='none'?'False':'True',plinth_length:p.plinthLength,plinth_type:p.plinth,windowsill:p.aluminium||p.stone?'True':'False',windowsill_aluminium:p.aluminium,windowsill_stone:p.stone,height};
      outputs={};run();
      assert(Math.abs(outputs['input[name="total_price"]']-actual.referenceTotal)<1e-7,JSON.stringify({values,actual,expected:outputs}));
      assert(Math.abs(actual.arcadianBeforePremium-Math.round((actual.referenceTotal+actual.referencePremium)*100)/100)<0.001);
      compared++;
    }
  }
}
console.log(JSON.stringify({status:'PASS',independent_reference_cases:compared,control:31796,arcadian_before_premium:34046,invalid_inputs:'PASS',conditional_extras:'PASS'}));
