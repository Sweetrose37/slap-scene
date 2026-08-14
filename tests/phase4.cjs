const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const dataSource = fs.readFileSync('js/data.js','utf8');
const appSource = fs.readFileSync('js/app.js','utf8').replace(
  /\n  init\(\);\n\}\)\(\);\s*$/,
  '\n  globalThis.__phase4={state,buildPrompt,shakeConcept,shakeSignature,signatureDifference,translateFusion,mixLabConcept,surpriseLabIngredients,creativeTension,resolveFusionConflict,applyIPGuard,applyMaterialZones,shakeHistory};\n})();'
);
const memory = new Map();
const localStorage = {getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
const context = {window:{},globalThis:null,console,localStorage};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(dataSource,context);
vm.runInContext(appSource,context);

const T=context.__phase4;
const base=JSON.parse(JSON.stringify(T.state));

// SHAKE A — no locks, FRESH.
const fresh=T.shakeConcept(base,new Set(),[],'FRESH');
const freshPrompt=T.buildPrompt(fresh);
assert.strictEqual(fresh.surpriseLevel,'FRESH');
assert.ok(freshPrompt.includes('sticker')&&freshPrompt.includes('focal hierarchy'),'Shake A produces a complete coherent prompt');
assert.ok(fresh.promptContext.bridge,'Shake A includes art-direction bridge logic');

// SHAKE B — lock subject, style, and color through repeated shakes.
let lockedBase={...base,subject:'Adult Woman',style:'Editorial',color:'Neon'};
const locks=new Set(['subject','style','color']);
const lockedHistory=[];
const unlockedSignatures=[];
for(let i=0;i<5;i++){
  lockedBase=T.shakeConcept(lockedBase,locks,lockedHistory,'FRESH');
  assert.strictEqual(lockedBase.subject,'Adult Woman');
  assert.strictEqual(lockedBase.style,'Editorial');
  assert.strictEqual(lockedBase.color,'Neon');
  const sig=T.shakeSignature(lockedBase);lockedHistory.push(sig);unlockedSignatures.push(JSON.stringify(sig));
}
assert.ok(new Set(unlockedSignatures).size>=4,'Shake B meaningfully varies unlocked ingredients');

// Character smart lock keeps the full character architecture.
const characterKeys=['age','presentation','skinTone','faceShape','hairstyle','bodyBuild','pose','expression','cameraAngle'];
const characterLocked={...base,subject:'Women',skinTone:'Deep Brown',faceShape:'Heart',hairstyle:'Locs',bodyBuild:'Curvy',pose:'Editorial lean',expression:'Confident',cameraAngle:'Low Angle'};
const characterResult=T.shakeConcept(characterLocked,new Set(['subject','character']),[],'FRESH');
for(const key of characterKeys)assert.strictEqual(characterResult[key],characterLocked[key],`character lock preserves ${key}`);

// SHAKE C — automotive WILD with an originality guard and mediated surprise.
let wild, wildPrompt;
for(let i=0;i<12;i++){
  wild=T.shakeConcept({...base,subject:'Automotive'},new Set(['subject']),[],'WILD');
  wildPrompt=T.buildPrompt(wild);
  if(/Treat the creative tension/.test(wildPrompt))break;
}
assert.ok(wildPrompt.includes('original fictional vehicle design'),'Shake C keeps Automotive IP Guard active');
assert.ok(wildPrompt.includes('manufacturer-specific wheels'),'Shake C blocks manufacturer-specific design');
assert.ok(/creative tension|established affinities/.test(wildPrompt),'Shake C explains the unusual combination coherently');

// SHAKE D — five consecutive results differ across multiple dimensions.
let sequence={...base};const history=[];
for(let i=0;i<5;i++){
  const next=T.shakeConcept(sequence,new Set(),history,'FRESH'),sig=T.shakeSignature(next);
  if(history.length)assert.ok(T.signatureDifference(sig,history.at(-1))>=5,'Shake Again changes at least five signature fields');
  history.push(sig);sequence=next;
}

const lab=(overrides={})=>({a:'Editorial',b:'Graffiti',c:'None',material:'Chrome',secondaryMaterial:'None',rendering:'Mixed-Media Rendering',era:'Contemporary',mood:'Bold',composition:'Layered Collage',strength:'BALANCED',...overrides});

// LAB A — Editorial + Graffiti + Chrome.
const labA=T.translateFusion(lab());
assert.ok(labA.roles.primary.includes('focal subject')&&labA.roles.secondary.includes('environment'),'Lab A assigns distinct roles');
assert.ok(labA.translated.includes('polished')&&labA.translated.includes('street-layered'),'Lab A translates instead of dumping ingredients');

// LAB B — Watercolor + Cyberpunk + Embroidery.
const labB=T.translateFusion(lab({a:'Watercolor',b:'Cyberpunk',material:'Embroidered'}));
assert.strictEqual(labB.tension,'HIGH');
assert.ok(labB.translated.includes('translucent watercolor')&&labB.translated.includes('cyberpunk light'),'Lab B explains interaction');

// LAB C — Minimal + Maximalist Graffiti + Crystal.
const labC=T.translateFusion(lab({a:'Minimal',b:'Maximalist Graffiti',material:'Crystal',strength:'HEAVY'}));
assert.ok(labC.mediation.includes('generous negative-space')&&labC.mediation.includes('one asymmetric edge'),'Lab C mediates the conflict');

// LAB D — Retro Advertising + Futuristic + Holographic.
const labD=T.translateFusion(lab({a:'Retro Advertising',b:'Futuristic',material:'Holographic',era:'1980s',composition:'Poster Inspired'}));
assert.ok(labD.mediation.includes('headline architecture')&&labD.translated.includes('focal surfaces'),'Lab D preserves layout and material roles');

// LAB E — Semi-Realistic Fashion + Street Art + Faux Leather + Rhinestone.
const labState=T.mixLabConcept({...base,subject:'Fashion',exactText:'OWN IT'},lab({a:'Semi-Realistic Fashion',b:'Street Art',material:'Faux Leather',secondaryMaterial:'Rhinestone',composition:'Asymmetrical Editorial'}));
const labE=T.buildPrompt(labState);
assert.ok(labE.includes('faux leather')&&labE.includes('rhinestone onto'),'Lab E zones both materials');
assert.ok(labE.includes('wholly original fictional person')&&labE.includes('fashion-house monograms'),'Lab E keeps Fashion originality/likeness guard active');
assert.ok(labE.includes('“OWN IT”'),'Lab preserves exact wording');

// Prompt voice variation keeps accuracy while changing sentence openings.
const voices=[0,1,2].map(voiceIndex=>T.buildPrompt({...base,promptContext:{mode:'build',voiceIndex}}).split('.')[0]);
assert.strictEqual(new Set(voices).size,3,'prompt composer varies creative-director phrasing');

console.log('SLAP SCENE Phase 4 tests passed (Shake A–D + Lab A–E + locks + voice variation)');
