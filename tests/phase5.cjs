const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const dataSource=fs.readFileSync('js/data.js','utf8');
const appSource=fs.readFileSync('js/app.js','utf8').replace(
  /\n  init\(\);\n\}\)\(\);\s*$/,
  '\n  globalThis.__phase5={state,buildPrompt,buildPackPrompts,createCollectionAnchor,getPromptSignature,isTooSimilar,buildSheetPlan,remixPrompt,getRemixSignature,signatureDistance,applyIPGuard,promptMetadata};\n})();'
);
const memory=new Map();
const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
const context={window:{},globalThis:null,console,localStorage};context.globalThis=context;
vm.createContext(context);vm.runInContext(dataSource,context);vm.runInContext(appSource,context);
const T=context.__phase5,base=JSON.parse(JSON.stringify(T.state));

// PACK A — six-piece coordinated Adult Fashion collection.
const fashion={...base,subject:'Adult Fashion',age:'Adult',style:'Editorial',color:'Neon',material:'Vinyl',composition:'Layered Collage',exactText:'OWN YOUR SCENE'};
const packA=T.buildPackPrompts(fashion,6,'COORDINATED',{theme:'Adult Fashion',wordingMode:'SAME'});
assert.strictEqual(packA.entries.length,6);
assert.strictEqual(packA.anchor.theme,'Adult Fashion');
assert.strictEqual(packA.anchor.paletteFamily,'Neon');
assert.strictEqual(packA.anchor.materialFamily[0],'Vinyl');
assert.strictEqual(new Set(packA.entries.map(x=>x.prompt)).size,6,'Pack A prompts are distinct');
assert.ok(new Set(packA.entries.map(x=>x.promptState.composition)).size>=5,'Pack A rotates composition');
for(let i=0;i<packA.entries.length;i++)for(let j=i+1;j<packA.entries.length;j++)assert.ok(!T.isTooSimilar(packA.entries[i],[packA.entries[j]]),'Pack A anti-clone check passes');

// PACK B — recurring child character, varied scenes.
const child={...base,subject:'Kids Celebration',age:'Child',presentation:'Playful',skinTone:'Deep Brown',faceShape:'Round',hairTexture:'Coily',hairstyle:'Bantu Knots',bodyBuild:'Average',exactText:''};
const packB=T.buildPackPrompts(child,8,'COORDINATED',{theme:'Kids Celebration',keepSameCharacter:true,wordingMode:'NONE'});
assert.ok(packB.recurringCharacter&&packB.characterIdentity,'Pack B stores recurring identity');
for(const entry of packB.entries){for(const key of ['age','skinTone','faceShape','hairTexture','hairstyle','bodyBuild'])assert.strictEqual(entry.promptState[key],packB.entries[0].promptState[key],`Pack B preserves ${key}`)}
assert.ok(new Set(packB.entries.map(x=>x.promptState.pose)).size>=6,'Pack B varies poses');
assert.ok(new Set(packB.entries.map(x=>x.promptState.composition)).size>=6,'Pack B varies compositions');
assert.ok(new Set(packB.entries.map(x=>x.creative.support)).size>=6,'Pack B varies supporting elements');
assert.ok(packB.entries.every(x=>x.prompt.includes('developmentally appropriate')),'Pack B keeps age-aware character styling');

// PACK C — automotive guard and varied layouts.
const automotive={...base,subject:'Automotive',style:'Retro Advertising',era:'1980s',material:'Chrome'};
const packC=T.buildPackPrompts(automotive,4,'COORDINATED',{theme:'Original Automotive Collection',wordingMode:'NONE'});
assert.ok(packC.entries.every(x=>x.prompt.includes('original fictional vehicle design')),'Pack C reapplies Automotive Guard');
assert.ok(packC.entries.every(x=>x.prompt.includes('manufacturer-specific wheels')),'Pack C blocks manufacturer-specific language');
assert.strictEqual(new Set(packC.entries.map(x=>x.promptState.composition)).size,4,'Pack C varies vehicle composition');

// SHEET A — six pack prompts, US Letter, balanced mixed sizes.
const sheetA=T.buildSheetPlan({source:'CURRENT PACK',size:'US Letter — 8.5 × 11',count:6,arrangement:'Balanced Mixed Sizes',hierarchy:'Mixed Sizes',spacing:'Balanced',margins:'Standard print-safe',background:'Clean white',entries:packA.entries});
assert.strictEqual(sheetA.prompts.length,6);
for(const phrase of ['exactly 6','cut-safe spacing','No stickers may touch or overlap','separate unmerged contours'])assert.ok(sheetA.master.includes(phrase),`Sheet A includes ${phrase}`);

// SHEET B — Hero + Minis with one main focal sticker.
const sheetB=T.buildSheetPlan({source:'CURRENT PACK',size:'A4',count:8,arrangement:'Hero + Minis',hierarchy:'One Hero + Supporting',spacing:'Generous',margins:'Wide print-safe',background:'Transparent-ready',entries:packB.entries});
assert.ok(sheetB.master.includes('one dominant hero sticker'));
assert.ok(sheetB.master.includes('one sticker the main focal piece'));
assert.ok(sheetB.master.includes('separate unmerged contours'));

// REMIX A — Fresh fashion remix with Subject, Exact Wording, and Palette locked.
const remixA=T.remixPrompt(fashion,new Set(['subject','exactText','color']),'FRESH',[],{style:'Watercolor',composition:'Asymmetrical Editorial',material:'Embroidered'});
assert.strictEqual(remixA.subject,fashion.subject);assert.strictEqual(remixA.exactText,fashion.exactText);assert.strictEqual(remixA.color,fashion.color);
assert.ok(remixA.style!==fashion.style&&remixA.composition!==fashion.composition&&remixA.material!==fashion.material,'Remix A evolves unlocked properties');

// REMIX B — Hard automotive remix, Subject and Era locked.
const remixB=T.remixPrompt(automotive,new Set(['subject','era']),'HARD',[],{style:'Cyberpunk',composition:'Dynamic Crop'});
assert.strictEqual(remixB.subject,'Automotive');assert.strictEqual(remixB.era,'1980s');
assert.ok(T.signatureDistance(T.getRemixSignature(remixB),T.getRemixSignature(automotive))>=7,'Remix B evolves significantly');
const remixBPrompt=T.buildPrompt(remixB);assert.ok(remixBPrompt.includes('original fictional vehicle design')&&remixBPrompt.includes('manufacturer-specific wheels'),'Remix B reapplies Automotive Guard');

// REMIX C — Character/face/hair locked; pose/outfit/composition remain free.
const person={...base,subject:'Women',age:'Adult',skinTone:'Brown',faceShape:'Heart',facialArchitecture:'Strong angular features',hairTexture:'Coily',hairstyle:'Locs',hairLength:'Long',bodyBuild:'Curvy',pose:'Relaxed front-facing',fashionDirection:'Editorial Fashion',composition:'Portrait Bust'};
const remixC=T.remixPrompt(person,new Set(['character','face','hair']),'HARD',[],{pose:'Dynamic action',fashionDirection:'Street-Luxe',composition:'Dynamic Crop'});
for(const key of ['age','skinTone','faceShape','facialArchitecture','hairTexture','hairstyle','hairLength','bodyBuild'])assert.strictEqual(remixC[key],person[key],`Remix C preserves ${key}`);
assert.strictEqual(remixC.pose,'Dynamic action');assert.strictEqual(remixC.fashionDirection,'Street-Luxe');assert.strictEqual(remixC.composition,'Dynamic Crop');
assert.ok(T.buildPrompt(remixC).includes('natural hands with correct finger counts'),'Remix C retains anatomy safeguards');

const metadata=T.promptMetadata(remixA,'remix',T.buildPrompt(remixA));
for(const key of ['id','type','createdAt','subject','style','aesthetic','rendering','material','mood','composition','palette','typography','stickerFormat','contour','promptText'])assert.ok(key in metadata,`metadata preserves ${key}`);

console.log('SLAP SCENE Phase 5 tests passed (Pack A–C + Sheet A–B + Remix A–C + metadata)');
