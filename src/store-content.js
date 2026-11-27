const url=import.meta.env.VITE_SUPABASE_URL||'https://kisewvontarimskgagnw.supabase.co';
const safeUrl=value=>{try{const u=new URL(value,location.origin);return u.protocol==='https:'||u.origin===location.origin?u.href:''}catch{return ''}};
const visible=(entry)=>entry&&entry.is_active!==false&&entry.is_published!==false;
const el=(tag,attrs,text)=>{const node=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>node.setAttribute(k,v));if(text)node.textContent=text;return node};
function renderSafeBody(container,body){String(body||'').split(/\n\s*\n/).filter(Boolean).forEach(line=>container.append(el('p',{},line.trim())));}
async function syncStoreContent(){
 if(!url)return;
 try{
  const responses=await Promise.all([fetch(url+'/functions/v1/store-api/content'),fetch(url+'/functions/v1/store-api/products')]);
  if(!responses[0].ok)return;
  const payload=await responses[0].json(),productPayload=responses[1].ok?await responses[1].json():{products:[]},content=payload.content||{},home=content.home||{},products=productPayload.products||[];
  if(location.pathname==='/'){
   const hero=document.querySelector('.hero-copy');
   if(hero){const eyebrow=hero.querySelector('.offer-tag'),title=hero.querySelector('h1'),description=hero.querySelector('p'),cta=hero.querySelector('a');
    if(eyebrow&&home.eyebrow)eyebrow.textContent=home.eyebrow;
    if(title&&home.headline)title.textContent=home.headline;
    if(description&&home.description)description.textContent=home.description;
    if(cta&&home.cta)cta.textContent=home.cta;
   }
   const media=safeUrl(home.media);
   if(media){const video=document.querySelector('.hero-video'),source=video?.querySelector('source');if(video&&(/\.mp4(?:$|\?)/i.test(media)||/\.webm(?:$|\?)/i.test(media))){if(source){source.src=media;video.load()}}else if(video)video.poster=media}
  }
  const product=products.find(p=>p.slug==='circaden')||products[0];
  if(product){
   const price='₹'+new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(Number(product.price_paise||0)/100);
   if(product.seo?.title)document.title=product.seo.title;
   if(product.seo?.description){let meta=document.querySelector('meta[name="description"]');if(!meta){meta=document.createElement('meta');meta.name='description';document.head.append(meta)}meta.content=product.seo.description}
   if(product.seo?.canonical){let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical)}canonical.href=safeUrl(product.seo.canonical)||canonical.href}
   if(location.pathname==='/'){
    const card=document.querySelector('.product-card'),highlight=document.querySelector('#highlight-image');
    if(card){const title=card.querySelector('.product-info h3'),sub=card.querySelector('.product-info p');if(title)title.textContent=product.name+' · '+(product.subtitle||'');if(sub)sub.textContent=product.description||'';const image=card.querySelector('.turntable video');if(image&&(product.images||[])[0])image.poster=safeUrl(product.images[0])||image.poster}
    if(highlight&&(product.images||[])[0])highlight.src=safeUrl(product.images[0])||highlight.src;
   }
   if(location.pathname.startsWith('/products/')){
    const title=document.querySelector('.circaden-title h1'),badge=document.querySelector('.circaden-title span'),promise=document.querySelector('.circaden-promise'),buy=document.querySelector('#pdp-add'),facts=document.querySelector('.circaden-facts');
    if(title)title.textContent=product.subtitle||product.name;
    if(badge)badge.textContent=product.name;
    if(promise)promise.textContent=product.description||product.subtitle||'';
    if(buy)buy.innerHTML='Add to bag · '+price+' <span>↗</span>';
    if(facts){facts.replaceChildren();[(product.sku||product.slug),product.category,...(product.tags||[])].forEach(value=>facts.append(el('span',{},value)))}
    const gallery=document.querySelector('.circaden-track');
    if(gallery&&Array.isArray(product.images)){const frames=[...gallery.children];product.images.slice(0,frames.length).forEach((imageUrl,index)=>{const image=safeUrl(imageUrl),frame=frames[index];if(!image||!frame)return;const still=frame.querySelector('img'),video=frame.querySelector('video');if(still){still.src=image;still.alt=(product.name||'Product')+' image '+(index+1)}if(video)video.poster=image})}
   }
   if(location.pathname==='/products'&&products.length){
    const catalog=document.querySelector('.catalog-page');
    if(catalog){catalog.querySelector('.catalog-card')?.remove();const cards=el('div',{class:'catalog-dynamic-grid'});products.forEach(p=>{const card=el('article',{class:'catalog-card'});if(p.images?.[0])card.append(el('img',{src:safeUrl(p.images[0]),alt:p.name||'',loading:'lazy'}));const copy=el('div',{});copy.append(el('span',{class:'eyebrow'},(p.category||'NEXTYOU')+' / '+(p.sku||p.slug)),el('h2',{},p.name||''),el('p',{},p.description||p.subtitle||''),el('strong',{},'₹'+new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(Number(p.price_paise||0)/100)),el('a',{class:'pill',href:'/products/'+encodeURIComponent(p.slug)},'Explore '+(p.name||'product')));card.append(copy);cards.append(card)});catalog.prepend(cards)}
   }
  }
  const articles=(content.articles||[]).filter(visible),pages=(content.pages||[]).filter(visible),faqs=(content.faqs||[]).filter(visible),main=document.querySelector('main');
  if(!main)return;
  if(location.pathname==='/journal'&&articles.length){
   main.replaceChildren();const section=el('section',{class:'journal-page'});section.append(el('span',{class:'eyebrow'},'NEXTYOU / JOURNAL'),el('h1',{},'Stories and ideas for your next chapter.'),el('p',{},'Thoughtful reads for a more considered everyday routine.'));
   const grid=el('div',{class:'journal-grid'});articles.forEach(article=>{const card=el('a',{class:'journal-card',href:'/journal/'+encodeURIComponent(article.slug||'')});if(article.image){const image=el('img',{src:safeUrl(article.image),alt:'',loading:'lazy'});card.append(image)}card.append(el('span',{class:'eyebrow'},article.category||'NEXTYOU / JOURNAL'),el('h2',{},article.title||''),el('p',{},String(article.body||'').slice(0,180)),el('b',{},'Read story ↗'));grid.append(card)});section.append(grid);main.append(section);return;
  }
  if(location.pathname.startsWith('/journal/')){
   const slug=decodeURIComponent(location.pathname.split('/').filter(Boolean).at(-1)||''),article=articles.find(a=>a.slug===slug);
   if(article){main.replaceChildren();const section=el('article',{class:'article-page'});section.append(el('span',{class:'eyebrow'},'NEXTYOU / JOURNAL'),el('h1',{},article.title||''),el('p',{class:'article-intro'},article.category||'Everyday wellness'));if(article.image){const image=el('img',{src:safeUrl(article.image),alt:article.title||'',loading:'lazy'});section.append(image)}renderSafeBody(section,article.body);section.append(el('a',{class:'pill',href:'/journal'},'Back to the journal'));main.append(section);return}
  }
  if(location.pathname==='/questions'&&faqs.length){main.replaceChildren();const section=el('section',{class:'questions-page'});section.append(el('span',{class:'eyebrow'},'NEXTYOU / QUESTIONS'),el('h1',{},'A little more clarity.'));faqs.forEach(f=>{const details=el('details',{});details.append(el('summary',{},f.question||f.title||''),el('p',{},f.answer||f.body||''));section.append(details)});main.append(section);return}
  const page=pages.find(p=>('/'+String(p.slug||'').replace(/^\//,'').replace(/\/$/,'')===location.pathname.replace(/\/$/,'')));
  if(page){main.replaceChildren();const article=el('article',{class:'article-page'});article.append(el('span',{class:'eyebrow'},'NEXTYOU / INFORMATION'),el('h1',{},page.title||''));renderSafeBody(article,page.body||page.content);main.append(article)}
 }catch(error){console.warn('Store content could not be loaded',error?.message||error)}
}
syncStoreContent();
