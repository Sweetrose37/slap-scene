const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const dataSource=fs.readFileSync('js/data.js','utf8');
const appSource=fs.readFileSync('js/app.js','utf8').replace(
  /\n  init\(\);\n\}\)\(\);\s*$/,
  '\n  globalThis.__phase6={APP_VERSION,state,shakeHistory,libraryItems,buildPrompt,shakeConcept,shakeSignature,signatureDifference,translateFusion,buildPackPrompts,isTooSimilar,buildSheetPlan,remixPrompt,getRemixSignature,signatureDistance,applyIPGuard,boundedNumber,sheetSizeLabel,compactPromptState};\n})();'
);
const memory=new Map([
  ['slapSceneShakeHistory','{"corrupted":true}'],
  ['slapSceneLibrary','not-json'],
  ['slapSceneProjects','{"old":"shape"}']
]);
const localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,String(value))};
const context={window:{},globalThis:null,console,localStorage};context.globalThis=context;
vm.createContext(context);vm.runInContext(dataSource,context);vm.runInContext(appSource,context);
const T=context.__phase6,D=context.window.SLAP_DATA,base=JSON.parse(JSON.stringify(T.state));

assert.strictEqual(T.APP_VERSION,'1.0.0');
assert.strictEqual(T.shakeHistory.length,0,'corrupted Shake history falls back safely');
assert.strictEqual(T.libraryItems.length,0,'corrupted Library data falls back safely');
const compact=T.compactPromptState({...base,pack:[{large:true}],sheet:{large:true},remixHistory:[1],exactText:'KEEP ME'});assert.ok(!('pack' in compact)&&!('sheet' in compact)&&!('remixHistory' in compact));assert.strictEqual(compact.exactText,'KEEP ME');
assert.ok(!D.subjects.some(x=>/^(pets?|animals?|houses?)$/i.test(x)),'no banned primary-subject categories');
assert.ok(!D.styles.some(x=>/chibi/i.test(x)),'no chibi style');

// Required prompt regression scenarios.
const fashion={...base,subject:'Adult Fashion',age:'Adult',presentation:'Editorial',style:'Graffiti',era:'Contemporary',material:'Vinyl',color:'Neon',composition:'Layered Collage'};
const fashionPrompt=T.buildPrompt(fashion);
assert.ok(fashionPrompt.includes('fashion silhouette')&&fashionPrompt.includes('production-friendly'),'fashion intelligence and sticker construction remain active');

const kids={...base,subject:'Kids',age:'Child',style:'Semi-Realistic',fashionDirection:'Streetwear',color:'Sunset',material:'Velvet',border:'Colored Contour'};
const kidsPrompt=T.buildPrompt(kids);
assert.ok(kidsPrompt.includes('developmentally appropriate')&&kidsPrompt.includes('natural hands with correct finger counts'),'kids styling and anatomy guard remain active');
assert.ok(kidsPrompt.includes('independently designed'),'fashion originality guard remains active');
for(const subject of ['Babies','Toddlers','Kids','Tweens','Teens']){
  const agePrompt=T.buildPrompt({...base,subject,age:'Adult'}).toLowerCase();
  assert.ok(!agePrompt.includes(`adult ${subject.toLowerCase()}`),`${subject} never inherits the Adult prefix`);
  assert.ok(agePrompt.includes('developmentally appropriate'),`${subject} receives age-aware styling`);
}

const auto={...base,subject:'Automotive',style:'Retro Advertising',era:'1980s',material:'Chrome',composition:'Poster Inspired'};
const autoPrompt=T.buildPrompt(auto);
assert.ok(autoPrompt.includes('original fictional vehicle design')&&autoPrompt.includes('manufacturer-specific wheels'),'automotive guard remains active');

const fusionBase={a:'Watercolor',b:'Cyberpunk',c:'None',material:'Embroidered',secondaryMaterial:'None',rendering:'Mixed-Media Rendering',era:'Contemporary',mood:'Experimental',composition:'Layered Collage'};
const light=T.translateFusion({...fusionBase,strength:'LIGHT'}),balanced=T.translateFusion({...fusionBase,strength:'BALANCED'}),heavy=T.translateFusion({...fusionBase,strength:'HEAVY'});
assert.ok(light.translated.includes('unmistakably dominant')&&balanced.translated.includes('Balance')&&heavy.translated.includes('materially transform'),'fusion strengths stay meaningfully distinct');
assert.ok(balanced.translated.includes('watercolor')&&balanced.translated.includes('cyberpunk'),'high-tension fusion is mediated');
assert.strictEqual(T.translateFusion({...fusionBase,strength:'INVALID'}).strength,'BALANCED');

// Ten sequential shakes: locks, minimum difference, history, and banned-category guard.
const shakeLocks=new Set(['subject','style','exactText']),shakeBase={...fashion,exactText:'OWN IT'},history=[];
for(let i=0;i<10;i++){
  const level=['SAFE','FRESH','WILD'][i%3],candidate=T.shakeConcept(shakeBase,shakeLocks,history,level),signature=T.shakeSignature(candidate);
  assert.strictEqual(candidate.subject,shakeBase.subject);assert.strictEqual(candidate.style,shakeBase.style);assert.strictEqual(candidate.exactText,shakeBase.exactText);
  if(history.length)assert.ok(T.signatureDifference(signature,history.at(-1))>=5,'sequential shake is meaningfully different');
  assert.ok(!/pet|animal|house|chibi/i.test(candidate.subject));history.push(signature);
}
assert.ok(new Set(history.map(x=>JSON.stringify(x))).size>=9,'ten shakes avoid repeated signatures');
assert.strictEqual(T.shakeConcept(shakeBase,shakeLocks,[],'INVALID').surpriseLevel,'FRESH');

// Every pack size and mode remains valid and clone-resistant.
for(const size of [3,4,6,8,10,12])for(const mode of ['MATCHED','COORDINATED','WILD']){
  const pack=T.buildPackPrompts(fashion,size,mode,{theme:'Release Fashion',wordingMode:'NONE'});
  assert.strictEqual(pack.entries.length,size);assert.strictEqual(pack.mode,mode);
  for(let i=0;i<pack.entries.length;i++)for(let j=i+1;j<pack.entries.length;j++)assert.ok(!T.isTooSimilar(pack.entries[i],[pack.entries[j]]),`${size}-${mode} pack has no clones`);
}
const fallbackPack=T.buildPackPrompts(fashion,999,'INVALID',{});assert.strictEqual(fallbackPack.size,6);assert.strictEqual(fallbackPack.mode,'COORDINATED');

// Every sheet size and arrangement retains count, spacing, contour, and isolation rules.
const sourcePack=T.buildPackPrompts(fashion,12,'COORDINATED',{theme:'Sheet Source',wordingMode:'NONE'});
for(const size of ['US Letter — 8.5 × 11','A4','6 × 9','5 × 7','Square','Custom'])for(const arrangement of ['Clean Grid','Loose Grid','Organic Scatter','Balanced Mixed Sizes','Hero + Minis','Symmetrical','Asymmetrical','Editorial Sheet','Sticker-Bomb Sheet']){
  const sheet=T.buildSheetPlan({size,customWidth:8.5,customHeight:11,unit:'inches',count:8,arrangement,hierarchy:'Mixed Sizes',spacing:'Balanced',margins:'Standard print-safe',background:'Clean white',entries:sourcePack.entries});
  assert.strictEqual(sheet.prompts.length,8);for(const phrase of ['exactly 8','cut-safe spacing','separate unmerged contours','No stickers may touch or overlap'])assert.ok(sheet.master.includes(phrase));
}
const boundedSheet=T.buildSheetPlan({size:'Custom',customWidth:-2,customHeight:9999,unit:'inches',count:999,entries:sourcePack.entries});
assert.strictEqual(boundedSheet.count,40);assert.ok(boundedSheet.sizeLabel.includes('1 × 100 inches'));

// Remix intensities, locks, history bounds, IP guard, and exact wording.
for(const intensity of ['LIGHT','FRESH','HARD']){
  const remixed=T.remixPrompt(fashion,new Set(['subject','exactText','color']),intensity,history,{composition:'Dynamic Crop'});
  assert.strictEqual(remixed.subject,fashion.subject);assert.strictEqual(remixed.exactText,fashion.exactText);assert.strictEqual(remixed.color,fashion.color);
  assert.strictEqual(remixed.remixIntensity,intensity);assert.ok(T.buildPrompt(remixed).includes('independently designed'));
}
assert.strictEqual(T.remixPrompt(fashion,new Set(),'INVALID',[]).remixIntensity,'FRESH');

// Final category-specific originality audit.
const guards=[
  [{...base,subject:'Sneakers'},['original fictional footwear','original panel geometry','original sole architecture','colorways']],
  [{...base,subject:'Handbags'},['original silhouette','hardware','avoid monograms','trade dress']],
  [auto,['original fictional vehicle','manufacturer logos and badges','signature grilles']],
  [{...base,subject:'Technology'},['fictional electronics','non-branded interface graphics','protected device silhouettes']],
  [{...base,subject:'Sports'},['no professional team or league logos','famous athlete likenesses','trademarked uniforms']],
  [{...base,subject:'Gaming',style:'Anime-Inspired Original'},['wholly original characters','costumes','named franchises']]
];
for(const [scenario,phrases] of guards){const prompt=T.buildPrompt(scenario);for(const phrase of phrases)assert.ok(prompt.includes(phrase),`${scenario.subject} guard includes ${phrase}`)}
assert.ok(!T.buildPrompt(auto).includes('natural hands with correct finger counts'),'anatomy boilerplate stays out of non-people prompts');

// Static release, accessibility, responsive, and local-asset checks.
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('css/styles.css','utf8'),readme=fs.readFileSync('README.md','utf8'),appText=fs.readFileSync('js/app.js','utf8');
assert.ok(html.includes('Sticker Art Prompt Builder')&&!html.includes('Sticker Art Generator'));
assert.ok(html.includes('aria-label="Close dialog"')&&html.includes('aria-live="polite"'));
assert.ok(html.includes('id="manageImages"')&&html.includes('UPLOAD IMAGES'),'shared image upload is available');
assert.ok(html.includes('id="musicFiles"')&&html.includes('id="musicPlayer"')&&html.includes('CREATE MODE MUSIC'),'private music player is available');
assert.ok(appText.includes('slapSceneMusicLibrary')&&appText.includes('file.size<=30*1024*1024'),'music stays browser-local with file-size limits');
assert.ok(css.includes('button:focus-visible')&&css.includes('100dvh')&&css.includes('prefers-reduced-motion'));
assert.ok(css.includes('background-image:var(--thumb-image,none)'),'gallery, pack, and style are blank until user images exist');
assert.ok(css.includes('rgba(242,26,138,.34)')&&css.includes('rgba(17,217,244,.28)'),'holographic selectors remain intact');
assert.ok(fs.existsSync('assets/samples/slap-scene-hero.png'));
assert.ok(readme.includes('1.0.0'));

console.log('SLAP SCENE Phase 6 release QA passed (v1.0.0 + prompts + 10 shakes + Lab + all packs/sheets/remixes + guards + resilience + accessibility)');
