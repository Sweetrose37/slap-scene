const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const dataSource = fs.readFileSync('js/data.js', 'utf8');
const appSource = fs.readFileSync('js/app.js', 'utf8').replace(
  /\n  init\(\);\n\}\)\(\);\s*$/,
  '\n  globalThis.__slapTest={state,buildPrompt,packPrompt,recipes,getCompatibleOptions,applyMaterialZones,applyIPGuard,stickerConstruction,rememberCreative,avoidRecentRepetition,recentCreativeHistory};\n})();'
);
const context = {window:{},globalThis:null,console};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(dataSource, context);
vm.runInContext(appSource, context);

const T = context.__slapTest;
const D = context.window.SLAP_DATA;
const base = JSON.parse(JSON.stringify(T.state));
const prompt = overrides => T.buildPrompt({...base,...overrides});

assert.ok(T.recipes.length >= 6, 'compatibility recipes are available');
assert.ok(D.styles.length >= 50, 'expanded art-language library is available');
assert.ok(D.materials.length >= 50, 'expanded material library is available');
assert.ok(D.subjectCategories.People.includes('Best Friends') && D.subjectCategories.Automotive.includes('Lowrider-Inspired Cars'), 'subject architecture is categorized');
assert.ok(D.hairstyles.includes('Knotless Braids') && D.hairstyles.includes('Curls + Fade'), 'expanded hair intelligence is available');
assert.ok(!D.styles.some(x=>/chibi/i.test(x)) && !D.subjects.some(x=>/pet|house|animal/i.test(x)), 'locked exclusions remain absent');

const exact = prompt({exactText:'Faith > Fear!'});
assert.ok(exact.includes('“Faith > Fear!”'), 'exact wording is preserved');
assert.ok(exact.includes('do not rewrite, correct, shorten'), 'exact-text guard is included');
assert.ok(exact.includes('clean') && exact.includes('contour spacing'), 'sticker production guidance is included');

const fused = prompt({fusion:{a:'Editorial',b:'Watercolor',c:'None',material:'Chrome',mood:'Bold',strength:70}});
assert.ok(fused.toLowerCase().includes('watercolor') && fused.includes('background, graphic framing, and transitions'), 'fusion is described coherently with assigned roles');
assert.ok(!fused.includes('Editorial + Watercolor'), 'fusion is not a raw ingredient list');

// Test A: Adult Fashion + Editorial + Graffiti + Contemporary + Vinyl + Neon + Layered Collage
const testA = prompt({subject:'Adult Fashion',age:'Adult',presentation:'Editorial',style:'Graffiti',era:'Contemporary',material:'Vinyl',color:'Neon',composition:'Layered Collage'});
for(const term of ['adult fashion','graffiti','vinyl','neon','layered collage'])assert.ok(testA.toLowerCase().includes(term),`Test A includes ${term}`);
assert.ok(testA.includes('garment construction'), 'Test A activates fashion intelligence');

// Test B: Middle-Aged Woman + Semi-Realistic + 1970s + Embroidery + Warm Jewel Tone + Editorial Layout
const testB = prompt({subject:'Middle-Aged Woman',age:'Middle-Aged Adult',style:'Semi-Realistic',era:'1970s',material:'Embroidered',color:'Warm Jewel Tone',composition:'Editorial Layout'});
for(const term of ['middle-aged woman','semi-realistic','1970s','embroidered','editorial layout'])assert.ok(testB.toLowerCase().includes(term),`Test B includes ${term}`);
assert.ok(testB.includes('warm ruby, amber, garnet'), 'Test B uses behavioral warm-jewel color direction');
assert.ok(testB.includes('natural hands with correct finger counts'), 'Test B activates people deformation guard');

// Test C: Automotive IP guard
const testC = prompt({subject:'Automotive',style:'Retro Advertising',era:'1980s',material:'Chrome',color:'High Contrast',composition:'Poster Inspired'});
assert.ok(testC.includes('original fictional vehicle design'), 'Test C activates Automotive IP Guard');
assert.ok(testC.includes('signature grilles') && testC.includes('manufacturer-specific wheels'), 'Test C blocks identifiable vehicle trade dress');

// Test D: Footwear IP guard
const testD = prompt({subject:'Sneaker/Fashion',style:'Mixed Media',era:'Y2K',material:'Holographic',color:'Bright Pop'});
assert.ok(testD.includes('original fictional footwear'), 'Test D activates Footwear IP Guard');
assert.ok(testD.includes('invented silhouette') && testD.includes('original sole architecture'), 'Test D requires an original fictional shoe design');

// Test E: Entertainment/franchise guard
const testE = prompt({subject:'Creatives',style:'Anime-Inspired Original',era:'Futuristic',material:'Crystal',color:'Electric',mood:'Cyberpunk'});
assert.ok(testE.includes('wholly original characters'), 'Test E requires original anime-inspired characters');
assert.ok(testE.includes('named franchises') && testE.includes('recognizable copyrighted characters'), 'Test E blocks franchise imitation');

const zoned = prompt({subject:'Fashion',material:'Chrome',secondaryMaterial:'Embroidered',exactText:'CREATE'});
assert.ok(zoned.includes('headline typography') && zoned.includes('embroidered onto'), 'material zoning assigns materials selectively');

const graffitiOptions = T.getCompatibleOptions({...base,style:'Graffiti',era:'Underground'});
assert.ok(graffitiOptions.materials.includes('Chrome') && graffitiOptions.effects.includes('Drips'), 'graffiti compatibility is art-directed');

T.rememberCreative({...base,style:'Graffiti'});
assert.notStrictEqual(T.avoidRecentRepetition(['Graffiti','Watercolor'],'style'),'Graffiti','anti-repetition avoids the recent style when possible');

const pack = Array.from({length:6},(_,i)=>T.packPrompt({...base,subject:'Women'},i,'Test Collection'));
assert.strictEqual(new Set(pack).size,6,'pack prompts are distinct');
assert.ok(pack.every(x=>x.includes('Test Collection')),'pack identity is shared');

console.log('SLAP SCENE Phase 3 creative-intelligence tests passed (A–E + guards + compatibility + anti-repetition)');
