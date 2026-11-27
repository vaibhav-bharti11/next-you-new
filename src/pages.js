import { mountProduct } from './product.js';
import './navigation-pages.css';

const articles = [
  {
    slug: 'the-evening-transition', category: 'Rituals', minutes: '4 min read',
    title: 'Making space for the evening.',
    intro: 'An evening routine can be a personal transition from a full day to a quieter night. It does not need to be elaborate to feel like your own.',
    image: '/assets/editorial-evening-lamp.jpg', imageAlt: 'Warm bedside light beside a quiet bedroom',
    sections: [
      ['Start with a cue, not a checklist', 'A familiar song, a book by the bed, or lowering the lights can mark a gentle change of pace. Pick a cue that fits your home and your day.'],
      ['Keep the routine yours', 'There is no single ideal evening. Some nights allow for a longer wind-down; some do not. A small, repeatable pause can be more useful than a perfect routine that feels difficult to maintain.'],
      ['Make room for rest', 'Give yourself a little distance from the day where you can. If sleep concerns continue or affect your wellbeing, speak with a qualified health professional.']
    ]
  },
  {
    slug: 'inside-circaden', category: 'Formulation', minutes: '5 min read',
    title: 'Three ingredients. One thoughtful formula.',
    intro: 'CIRCADEN brings together magnesium bisglycinate, L-theanine, and melatonin. Here is what the supplied product brief says about each ingredient.',
    image: '/assets/editorial-leaf-veins.jpg', imageAlt: 'Close view of the branching veins in a green leaf',
    sections: [
      ['01 — Magnesium bisglycinate', 'The brief describes magnesium bisglycinate as supporting normal muscle and nervous system function. It also describes the chelated form as generally considered gentle on the digestive system compared with some other forms of magnesium.'],
      ['02 — L-theanine', 'The brief describes L-theanine as an amino acid selected for its role in relaxation and a calm state of mind as part of an evening routine.'],
      ['03 — Melatonin', 'The brief describes melatonin as helping regulate the body’s natural sleep-wake cycle and supporting natural sleep timing.'],
      ['Read the final label', 'Ingredient amounts, directions, warnings, and the final regulatory category must be taken from the finished product label. Those details have not been supplied to this site yet.']
    ]
  },
  {
    slug: 'understanding-transparency', category: 'Quality', minutes: '4 min read',
    title: 'What product transparency means.',
    intro: 'Clear ingredient information is one part of transparency. Supporting documents should also make clear what was tested, by whom, and for which batch.',
    image: '/assets/editorial-lab-glassware.jpg', imageAlt: 'Glassware and a pipette on a laboratory bench',
    imageNote: 'Illustrative laboratory photography. This is not a NextYou laboratory or a product test result.',
    sections: [
      ['Ingredients and evidence answer different questions', 'A product label identifies what is in the formula and gives the required directions and warnings. A supplier specification describes a raw material. A finished-product report describes a sample of the final product. These records should not be presented as interchangeable.'],
      ['What NextYou plans to show', 'The supplied transparency brief lists independent laboratory testing, heavy-metal testing, microbiological testing, certificates of analysis, and relevant quality certifications as documentation categories.'],
      ['What is available today', 'Batch-specific certificates, finished-product reports, and supporting certifications have not been supplied for publication. This site does not claim that these tests or certifications have been completed.'],
      ['How to read a report', 'A useful report identifies the product or material, the batch or sample, the laboratory, the test method, the date, and the result. NextYou will link authentic documents here when they are approved for publication.']
    ]
  }
];

const productLink = '<a class="pill" href="/products/circaden">Explore CIRCADEN</a>';
const qualityBlocks = [
  ['Independent third-party laboratory testing', 'Finished-product laboratory reports have not been supplied for this site.', 'A published report should identify the product or sample, issuing laboratory, method, date, and result.'],
  ['Heavy-metal testing', 'No batch-specific results are currently available to publish.', 'Results should be tied to the finished-product batch and show which metals, methods, and limits were assessed.'],
  ['Microbiological testing', 'No finished-product report is currently available to publish.', 'A useful report identifies the sample, test panel, laboratory, and the criteria used to interpret the result.'],
  ['Certificate of Analysis', 'A batch-specific COA has not been supplied.', 'A COA should identify the product and batch and be traceable to the organisation that issued it.'],
  ['Quality certifications', 'No certification claim is made here without a verifiable document.', 'Any certification should name its issuer, scope, location, validity, and the organisation it covers.']
];

function articleCard(article) {
  return `<a class="journal-card journal-card-image" href="/journal/${article.slug}">
    <img src="${article.image}" alt="${article.imageAlt}" loading="lazy">
    <div><span>${article.category} · ${article.minutes}</span><h2>${article.title}</h2><p>${article.intro}</p><b>Read the story</b></div>
  </a>`;
}

function renderJournal(main) {
  main.innerHTML = `<section class="journal-page editorial-index">
    <div class="editorial-intro"><span class="eyebrow">NEXTYOU / JOURNAL</span><h1>Stories for a more considered everyday.</h1><p>Notes on evening rituals, the CIRCADEN formulation, and how to read product information with care.</p></div>
    <div class="journal-tools"><label><span class="sr-only">Search the journal</span><input id="journal-search" type="search" placeholder="Search stories" aria-label="Search the journal"></label><label><span class="sr-only">Filter stories by topic</span><select id="journal-category" aria-label="Filter by topic"><option>All topics</option><option>Rituals</option><option>Formulation</option><option>Quality</option></select></label></div>
    <div id="journal-results" class="journal-grid"></div>
  </section>`;
  const search = main.querySelector('#journal-search');
  const category = main.querySelector('#journal-category');
  const results = main.querySelector('#journal-results');
  const update = () => {
    const query = search.value.trim().toLowerCase();
    const selectedCategory = category.value;
    const found = articles.filter(article => (selectedCategory === 'All topics' || article.category === selectedCategory) && `${article.title} ${article.intro} ${article.category} ${article.sections.map(section => section.join(' ')).join(' ')}`.toLowerCase().includes(query));
    results.innerHTML = found.map(articleCard).join('') || '<p class="journal-empty">No stories match that search. Try another phrase or topic.</p>';
  };
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  update();
}

function renderArticle(main, path) {
  const article = articles.find(item => path === `/journal/${item.slug}`);
  if (!article) {
    main.innerHTML = '<section class="article-page"><h1>We could not find that story.</h1><p>Browse the journal to find another place to begin.</p><a class="pill" href="/journal">Return to the journal</a></section>';
    return;
  }
  main.innerHTML = `<article class="article-page">
    <a class="article-back" href="/journal">← All stories</a>
    <div class="article-hero"><img src="${article.image}" alt="${article.imageAlt}"><div><span class="eyebrow">${article.category} / NEXTYOU JOURNAL</span><h1>${article.title}</h1><p class="article-intro">${article.intro}</p><span class="article-meta">${article.minutes} · NextYou Editorial</span></div></div>
    ${article.imageNote ? `<p class="image-disclosure">${article.imageNote}</p>` : ''}
    <div class="article-body">${article.sections.map(([heading, copy], index) => `<section><span class="article-section-index">${String(index + 1).padStart(2, '0')}</span><div><h2>${heading}</h2><p>${copy}</p></div></section>`).join('')}</div>
    <div class="article-end"><span class="eyebrow">CONTINUE EXPLORING</span><p>Go deeper into the product, its ingredients, and the supporting documentation status.</p>${productLink}<a class="text-link" href="/quality">Read about quality and testing</a></div>
  </article>`;
}

function renderScience(main, scienceSection) {
  main.innerHTML = `<article class="science-page">
    <header class="science-page-lead"><span class="eyebrow">NEXTYOU / FORMULATION</span><h1>A thoughtful formula begins with what goes in.</h1><p>Move through the CIRCADEN capsule, then open each ingredient to see how it is described in the supplied product brief.</p><a class="science-scroll-cue" href="#capsule-journey">Scroll to explore <span aria-hidden="true">↓</span></a></header>
    ${scienceSection ? `<div class="science-stage" id="capsule-journey"><div class="science-stage-sticky">${scienceSection.outerHTML}</div><div class="science-stage-caption"><span>FORMULATION / CIRCADEN</span><span>Scroll to move through the capsule</span></div></div>` : ''}
    <section class="ingredient-explorer" aria-labelledby="ingredient-explorer-title"><div class="ingredient-explorer-intro"><span class="eyebrow">THE THREE INGREDIENTS</span><h2 id="ingredient-explorer-title">One formula, considered piece by piece.</h2><p>These descriptions reflect the supplied product brief. Amounts, directions, and cautions must come from the approved label.</p></div><div class="ingredient-accordions"><details><summary><span>Magnesium bisglycinate</span><span class="ingredient-number">01</span></summary><p>The brief describes this ingredient as supporting normal muscle and nervous system function. A finished-product claim needs to match the final formulation and substantiation.</p></details><details><summary><span>L-theanine</span><span class="ingredient-number">02</span></summary><p>The brief describes L-theanine as an amino acid selected for its role in relaxation and a calm state of mind as part of an evening routine.</p></details><details><summary><span>Melatonin</span><span class="ingredient-number">03</span></summary><p>The brief describes melatonin as helping regulate the natural sleep-wake cycle. Refer to the final label for product-specific directions and warnings.</p></details></div></section>
    <section class="science-close"><h2>Know what is in the formula.<br>Know what evidence is available.</h2><p>Ingredient information, supplier materials, and finished-product tests are different kinds of information. NextYou will identify each source clearly as authentic documentation is made available.</p><a class="pill" href="/quality">Explore quality and testing</a></section>
  </article>`;
}

function renderQuality(main) {
  main.innerHTML = `<article class="quality-page">
    <header class="quality-lead"><div><span class="eyebrow">NEXTYOU / QUALITY & TRANSPARENCY</span><h1>Evidence should be easy to understand.</h1><p>We believe product information should help you see what is known, what was tested, and which documents support a claim.</p></div><figure><img src="/assets/editorial-lab-glassware.jpg" alt="Glass laboratory vessels on a bench" loading="lazy"><figcaption>Illustrative laboratory photography. This is not a NextYou lab, certificate, or product test result.</figcaption></figure></header>
    <section class="quality-status"><div class="quality-status-heading"><span class="eyebrow">DOCUMENT STATUS</span><h2>What is available for CIRCADEN today.</h2><p>The supplied transparency brief describes the documentation NextYou intends to publish. The actual product certificates and finished-product reports have not yet been supplied to this site.</p><span class="quality-hint">Open a record to see what it should tell you <span aria-hidden="true">↓</span></span></div><div class="quality-records">${qualityBlocks.map(([title, copy, detail], index) => `<details class="quality-record"><summary><span class="quality-record-index">${String(index + 1).padStart(2, '0')}</span><span class="quality-record-copy"><strong>${title}</strong><span>${copy}</span></span><span class="record-status">Not supplied</span><span class="quality-record-toggle" aria-hidden="true">+</span></summary><div class="quality-record-detail"><p>${detail}</p></div></details>`).join('')}</div></section>
    <section class="quality-notes"><h2>Supplier information is not a finished-product report.</h2><div><p>Supplier specifications and raw-material photos can explain an ingredient source. They do not establish results for a finished CIRCADEN batch.</p><p>When genuine documents are approved for publication, each link should identify the document type, product or material, batch where relevant, and issuing organisation.</p></div><a class="text-link" href="/journal/understanding-transparency">Read how to interpret a product document</a><div class="policy-source-links"><h2>Regulatory references</h2><p>These official Indian sources informed the transparency and claims language on this page:</p><a href="https://fssai.gov.in/standards/health-supplements" target="_blank" rel="noreferrer">FSSAI — Health Supplements, Nutraceuticals, Food for Special Dietary Use, and related standards</a><a href="https://fssai.gov.in/upload/uploadfiles/files/Compendium_Advertising_Claims_Regulations_14_12_2022.pdf" target="_blank" rel="noreferrer">FSSAI — Advertising and Claims Regulations compendium</a></div></section>
  </article>`;
}

function renderQuestions(main) {
  const questions = [
    ['What is CIRCADEN?', 'CIRCADEN is NextYou’s sleep and recovery formulation. The supplied brief lists magnesium bisglycinate, L-theanine, and melatonin.'],
    ['What is in one pack?', 'The supplied packaging shows 60 vegan capsules. A capsule count does not tell you the amount of each ingredient or the serving duration.'],
    ['What are the ingredient amounts?', 'A verified Supplement Facts or equivalent final label panel has not been supplied to this site. We will publish ingredient amounts only from the approved product label.'],
    ['How should I take it?', 'Follow the directions on the final product label. Do not use this preview to determine a dose. Ask a doctor or pharmacist whether the product is suitable for you, especially if you take medicines or have a health condition.'],
    ['Is CIRCADEN a medicine or a treatment?', 'This website does not present CIRCADEN as a medicine or as a treatment for a disease. The final regulatory classification and all permitted claims must match the approved packaging and applicable regulations.'],
    ['Can I use it during pregnancy, while nursing, or for a child?', 'The site does not have verified product-specific safety guidance for these groups. Please ask a qualified healthcare professional before considering any supplement.'],
    ['Where are the test reports and certificates?', 'Batch-specific COAs, finished-product laboratory reports, and quality certification documents have not been supplied for publication. See the quality page for the current document status.'],
    ['Is the online store taking orders?', 'No. This website preview has no checkout, payment, order confirmation, or fulfilment system. Adding CIRCADEN to the local bag does not create an order.'],
    ['Where can I find shipping, returns, and refunds?', 'Those services are not active in this preview. The shipping and returns pages explain which information will be shown before a store opens.'],
    ['How do I contact customer support?', 'A verified support email address and grievance contact have not been provided for the preview. The Contact page shows the current support status.']
  ];
  main.innerHTML = `<section class="faq-page"><header class="faq-lead"><span class="eyebrow">NEXTYOU / QUESTIONS</span><h1>Good questions deserve clear answers.</h1><p>What we can confirm about CIRCADEN, what is still being prepared, and where to find the relevant information.</p><a class="pill" href="/products/circaden">Explore CIRCADEN</a></header><div class="faq-image"><img src="/assets/editorial-evening-room.jpg" alt="A warmly lit bedroom at night" loading="lazy"><div><span class="eyebrow">A NOTE ON PRODUCT INFORMATION</span><p>Amounts, instructions, warnings, and product-specific claims should come from the final approved label, not from a product photograph or this preview.</p></div></div><div class="faq-list">${questions.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}</div><footer class="faq-contact"><h2>Still have a question?</h2><p>The customer support inbox is not connected in this preview.</p><a class="text-link" href="/contact">See contact information</a></footer></section>`;
}

function renderContact(main) {
  main.innerHTML = `<section class="contact-page"><div class="contact-heading"><span class="eyebrow">NEXTYOU / CONTACT</span><h1>Here when you need us.</h1><p>We want questions about products and orders to reach a real person. Customer support and grievance contact details have not been supplied for this website preview.</p><div class="contact-status"><span>Support status</span><strong>Not connected yet</strong><p>No contact form or email is receiving messages from this page. Nothing entered here would be sent.</p></div></div><aside class="contact-next"><span class="eyebrow">BEFORE THE STORE OPENS</span><p>NextYou will add a monitored customer-care channel, the legal seller details, and the designated grievance contact before taking orders.</p></aside><section class="contact-links"><a href="/questions"><span>01 / PRODUCT</span><h2>Questions about CIRCADEN</h2><p>Read ingredient, label, and document-status answers.</p></a><a href="/shipping"><span>02 / DELIVERY</span><h2>Shipping and returns</h2><p>See which fulfilment details are currently available.</p></a><a href="/privacy"><span>03 / DATA</span><h2>Privacy questions</h2><p>Read what this preview stores in your browser.</p></a></section></section>`;
}

function policyReadingSections(items, prefix) {
  const links = items.map(([heading], index) => {
    const label = heading.replace(/^\d+\.\s*/, '');
    return `<a href="#${prefix}-${index + 1}">${label}</a>`;
  }).join('');
  const sections = items.map(([heading, body], index) => `<section id="${prefix}-${index + 1}"><h2>${heading}</h2><p>${body}</p></section>`).join('');
  return `<div class="policy-reading"><nav class="policy-index" aria-label="On this page"><span>ON THIS PAGE</span>${links}</nav><div class="policy-sections">${sections}</div></div>`;
}

function renderTerms(main) {
  const terms = [
    ['1. About this website', 'This website presents NextYou and the CIRCADEN product concept. It is currently a shopping preview. The product gallery and local bag are for browsing only; the site does not accept payment, create an order, or arrange delivery.'],
    ['2. Seller identity and launch status', 'The brand name shown here is NextYou. The legal seller name, registered or principal address, customer-care details, and grievance officer have not been supplied for this preview. This page does not replace those disclosures. The store must display the verified seller and grievance information before it begins online sales.'],
    ['3. Product descriptions and images', 'The product page describes CIRCADEN as a 60-vegan-capsule formulation and names magnesium bisglycinate, L-theanine, and melatonin, based on the supplied product materials. Final ingredient quantities, directions, warnings, regulatory category, availability, price, taxes, and packaging details must be taken from the approved final label and checkout display. Editorial and generated imagery is illustrative; it is not a certificate, test result, or substitute for the actual label.'],
    ['4. Health and supplement information', 'Website content is general product information, not personal medical advice, diagnosis, or treatment. A supplement is not a substitute for a varied diet, appropriate medical care, or advice from a qualified healthcare professional. Read the final label and consult a healthcare professional if you have a health condition, take medicines, are pregnant or nursing, or are considering use for a child.'],
    ['5. Orders and payments', 'No sale is completed through this preview. Adding an item to the browser-local bag is not an offer, order, payment authorisation, or dispatch request. Before any future checkout, the seller must show the final price, applicable taxes and charges, delivery terms, accepted payment methods, and order cancellation and refund information, then obtain an affirmative order action.'],
    ['6. Delivery, cancellations, returns, and refunds', 'The preview has no fulfilment, cancellation, return, or refund operation. The Shipping and Returns pages describe this status. If a live store is launched, its order-specific policy must be displayed before purchase and must not remove rights that consumers have under applicable law.'],
    ['7. Intellectual property and permitted use', 'The NextYou name, logo, product presentation, original site copy, and site design are owned by or used with permission by their respective rights holders. You may browse the site for personal, lawful use. You may not copy site material for commercial redistribution or use the brand in a way that suggests affiliation or endorsement without permission.'],
    ['8. Third-party services and links', 'The site may link to external information sources. Their sites and privacy practices are controlled by their operators. The Google Fonts stylesheet is requested from Google Fonts by the current site code. Third-party links do not mean that NextYou endorses every statement on those sites.'],
    ['9. Availability and changes', 'The preview is provided for product and brand information while the store is being prepared. Pages, descriptions, media, and features may change. Nothing on this preview guarantees that a product will be available for sale at a particular time.'],
    ['10. Consumer rights and governing law', 'Nothing in these terms excludes a consumer right or remedy that cannot lawfully be excluded. These preview terms are governed by the laws of India, subject to any mandatory consumer protections and jurisdiction rules that apply to you.'],
    ['11. Contact and grievances', 'A customer-care email, legal entity, registered address, and grievance officer have not been provided for this preview. Those details must be verified and displayed before online sales begin.']
  ];
  main.innerHTML = `<article class="policy-page"><header class="policy-lead"><span class="eyebrow">NEXTYOU / TERMS</span><h1>Terms and conditions.</h1><p>These terms describe the current NextYou website preview. They do not form checkout terms for a product purchase.</p><div class="policy-meta"><span>India</span><span>Updated 27 November 2026</span><span>Preview terms</span></div></header><aside class="policy-notice"><strong>Store preview</strong><p>This website is not accepting orders. Seller identity, business address, contact information, product price, shipping terms, and refund rules must be published before a live sale.</p></aside>${policyReadingSections(terms, 'terms')}<section class="policy-source-links"><h2>Official reference</h2><p>The seller should check the current requirements for its business model before accepting orders.</p><a href="https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules.pdf" target="_blank" rel="noreferrer">Consumer Protection (E-Commerce) Rules, 2020 — Department of Consumer Affairs</a></section><nav class="policy-related"><a href="/privacy">Privacy notice</a><a href="/shipping">Shipping information</a><a href="/returns">Returns information</a></nav></article>`;
}

function renderPrivacy(main) {
  const privacySections = [
    ['1. Who this notice is about', 'NextYou is the brand shown on this website. The legal entity responsible for the brand, its business address, and a privacy contact have not been provided for this preview. They must be added and verified before the site collects customer information or accepts orders.'],
    ['2. What this preview currently handles', 'The site runs a product and editorial experience in your browser. When you add CIRCADEN to the bag, it stores a single yes/no selection in browser local storage under the key nextyou-preview-selection. It does not store your name, email, address, payment details, or order history. Clearing your browser storage removes the selection.'],
    ['3. Information sent when a page loads', 'Your browser necessarily sends technical request data to the service hosting the site, such as an IP address, browser details, requested page, and time of request. The hosting provider may keep server logs for security and operations under its own configuration. The hosting account and retention settings have not been confirmed here.'],
    ['4. Third-party services visible in the code', 'The current stylesheet requests typefaces from Google Fonts. A request to that service can expose technical connection data such as your IP address and browser information to Google. No analytics tool, advertising pixel, payment processor, account provider, or email-marketing service is installed in this preview. Locally hosted editorial photos do not send image requests to Unsplash when you view the site.'],
    ['5. Why information is used', 'The local bag selection is used only to remember the preview selection in your browser and display the bag count. Technical request information is processed by the hosting service to deliver and protect the pages. The site has no live checkout, account, support form, or order-tracking feature.'],
    ['6. Cookies and similar storage', 'This preview uses browser local storage for the bag selection. The current source does not set advertising or analytics cookies. The browser and hosting provider may have separate technical storage or logging, which depends on their services and settings. Google Fonts is a third-party network request; it is not a cookie-based analytics feature in this code.'],
    ['7. Sharing, processors, and transfers', 'The preview itself does not submit the local bag selection to NextYou. Hosting and font delivery are provided by third parties that may process connection data to supply their services. No customer-data sale, marketing list, or payment-data sharing occurs through the preview because those functions are not active. Final hosting, processor, and any cross-border transfer details must be checked against the production configuration before launch.'],
    ['8. Retention and deletion', 'The local bag value remains in your browser until you remove the item or clear site storage. Hosting log retention is controlled by the hosting provider and has not been verified in this project. Because the preview has no account or customer database, it has no site-side customer profile or order record to delete.'],
    ['9. Your choices and requests', 'You can remove the bag item in the site or clear this site’s local storage in your browser. For any personal-data request once a real support contact is provided, use the published privacy contact. The Digital Personal Data Protection Act, 2023 and Digital Personal Data Protection Rules, 2025 have phased commencement dates; the production notice and request process must be reviewed against the provisions in force at the time of launch.'],
    ['10. Children', 'This preview is intended for adults considering general product information. Do not submit a child’s personal information through this site. Product-specific use by children should only be considered with appropriate professional guidance and the final label.'],
    ['11. Security and changes', 'The project has no customer database or payment system. Security controls for hosting, access, backups, and operational logs depend on the production host and must be verified before a live service is launched. This notice will be updated if the site begins processing accounts, orders, support requests, analytics, or marketing preferences.'],
    ['12. Privacy contact', 'A verified privacy email address, legal entity, and business address have not been supplied for this preview. They must be published before the site collects customer information or launches online sales.']
  ];
  main.innerHTML = `<article class="policy-page privacy-page"><header class="policy-lead"><span class="eyebrow">NEXTYOU / PRIVACY</span><h1>Your privacy, explained plainly.</h1><p>This notice describes what the current NextYou preview does in your browser and what it does not do.</p><div class="policy-meta"><span>India</span><span>Updated 27 November 2026</span><span>Preview notice</span></div></header><aside class="policy-notice"><strong>Short version</strong><p>The preview saves only the bag selection in your browser. It has no checkout, user account, customer-support form, analytics pixel, or payment processor. Your browser makes a request to Google Fonts for typography and to the site host for each page.</p></aside>${policyReadingSections(privacySections, 'privacy')}<section class="policy-source-links"><h2>Official references</h2><p>For current statutory texts, consult the official sources directly:</p><a href="https://www.indiacode.nic.in/handle/123456789/22037" target="_blank" rel="noreferrer">Digital Personal Data Protection Act, 2023</a><a href="https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa" target="_blank" rel="noreferrer">Digital Personal Data Protection Rules, 2025</a></section><nav class="policy-related"><a href="/terms">Terms and conditions</a><a href="/contact">Contact</a><a href="/questions">Questions</a></nav></article>`;
}

function renderServiceStatus(main, path) {
  const pages = {
    '/account': {
      eyebrow: 'NEXTYOU / ACCOUNT', title: 'Your account, when the store is ready.',
      intro: 'Sign-in and customer accounts are not connected in this preview. No profile, saved address, or purchase history is being created.',
      cards: [['Your bag', 'The CIRCADEN bag is stored in this browser only. It does not create an order.', '<button class="pill" data-open-bag>Open the bag</button>'], ['Order history', 'There are no NextYou orders in this preview because checkout is not active.', '<a class="text-link" href="/track-order">Order tracking status</a>'], ['Privacy', 'See the exact browser storage behavior and current third-party requests.', '<a class="text-link" href="/privacy">Read the privacy notice</a>']]
    },
    '/track-order': {
      eyebrow: 'NEXTYOU / ORDER STATUS', title: 'Order tracking starts after dispatch.',
      intro: 'This preview cannot look up an order: checkout, order confirmation, and dispatch are not connected. No tracking number or shipment exists here.',
      cards: [['No order lookup yet', 'When fulfilment is enabled, the tracking link and carrier details will be provided with the order dispatch notice.', '<a class="text-link" href="/shipping">Read the shipping status</a>'], ['Need product information?', 'The product and ingredient pages contain the details currently supplied to NextYou.', '<a class="text-link" href="/products/circaden">Explore CIRCADEN</a>'], ['Need help?', 'A customer-care channel has not been connected to this preview.', '<a class="text-link" href="/contact">See contact status</a>']]
    }
  };
  const page = pages[path];
  main.innerHTML = `<section class="service-page"><header><span class="eyebrow">${page.eyebrow}</span><h1>${page.title}</h1><p>${page.intro}</p></header><div class="service-cards">${page.cards.map(([title, copy, action]) => `<article><span class="eyebrow">NEXTYOU / PREVIEW</span><h2>${title}</h2><p>${copy}</p>${action}</article>`).join('')}</div><div class="service-footer"><span>Shopping preview · No account, order, or payment is processed.</span><a href="/">Return to NextYou</a></div></section>`;
  main.querySelector('[data-open-bag]')?.addEventListener('click', () => document.querySelector('#bag')?.showModal());
}

function renderShipping(main, isReturns) {
  const heading = isReturns ? 'A clear returns policy comes before a sale.' : 'Delivery details come before checkout.';
  const intro = isReturns
    ? 'The NextYou preview is not accepting orders, so it cannot offer a return, exchange, cancellation, or refund service today.'
    : 'The NextYou preview is not accepting orders. There are no delivery zones, courier partners, fees, dispatch windows, or tracking numbers configured.';
  const firstTitle = isReturns ? 'Before a store opens' : 'Before you place an order';
  const firstCopy = isReturns
    ? 'A live returns page will explain how to request help, which order information is needed, how return shipping is handled, what happens when a product is damaged or incorrect, and when an accepted refund is processed. These terms will be visible before an order is placed.'
    : 'A live checkout will show whether your PIN code can be served, the delivery charge and any tax, the estimated timing, available carrier or tracking information, and how delivery exceptions are handled.';
  const blocks = isReturns ? [
    ['Damaged, defective, or incorrect items', 'The future order process must provide a way to report a product that is damaged, defective, spurious, or materially different from its description.'],
    ['Cancellation and refund details', 'The preview has no confirmed order to cancel and no payment to refund. A live store must display the applicable cancellation and refund process before purchase.'],
    ['Consumer rights', 'A store policy cannot take away consumer rights or remedies that apply under Indian law.']
  ] : [
    ['Serviceable locations', 'No serviceable PIN-code list has been supplied. The site cannot confirm that an address can be served.'],
    ['Charges and timing', 'Shipping fees, dispatch windows, estimated delivery dates, and any delivery surcharges have not been supplied. No delivery date is promised here.'],
    ['Tracking', 'Order tracking is unavailable because no checkout or dispatch system is connected.']
  ];
  main.innerHTML = `<article class="service-policy"><header class="service-policy-lead"><span class="eyebrow">NEXTYOU / ${isReturns ? 'RETURNS' : 'DELIVERY'}</span><h1>${heading}</h1><p>${intro}</p><div class="service-preview-banner"><strong>Current status</strong><span>No orders are being accepted or fulfilled by this preview.</span></div></header><div class="service-policy-grid">${blocks.map(([title, body], index) => `<section><span>${String(index + 1).padStart(2, '0')} / ${isReturns ? 'RETURNS' : 'DELIVERY'}</span><h2>${title}</h2><p>${body}</p></section>`).join('')}</div><section class="service-policy-detail"><span class="eyebrow">WHAT CUSTOMERS WILL SEE</span><h2>${firstTitle}</h2><p>${firstCopy}</p><p>The legal seller identity and a working customer-care and grievance contact must also be shown before the store begins online sales.</p><a class="text-link" href="/terms">Read the current site terms</a></section></article>`;
}

function renderStory(main) {
  main.innerHTML = `<article class="story-page story-page-complete"><div class="story-lead"><img src="/assets/editorial-evening-books.jpg" alt="A book and bedside light in a quiet evening setting"><div><span class="eyebrow">NEXTYOU / OUR STORY</span><h1>Everyday wellness, with intent.</h1><p>NextYou starts with a simple idea: make room for considered choices that can fit into real life. CIRCADEN is our first chapter, focused on an evening routine and sleep rhythm.</p><a class="pill" href="/products/circaden">Meet CIRCADEN</a></div></div><section class="story-principles"><span class="eyebrow">HOW WE WANT TO SHOW UP</span><h2>Thoughtful in the details.<br>Clear about what we know.</h2><div class="story-principle-grid"><article><span>01 / FORMULATION</span><h3>Explain the ingredients</h3><p>We name the three ingredients in CIRCADEN and explain their intended roles using the information provided for the product.</p></article><article><span>02 / TRANSPARENCY</span><h3>Show the evidence honestly</h3><p>Supplier information, finished-product testing, and quality certification are distinct. We will label each authentic document clearly when it is available.</p></article><article><span>03 / EVERYDAY LIFE</span><h3>Leave room for your own rhythm</h3><p>A wellness routine should make sense for the person living it. Our editorial content is an invitation to explore, not a prescription for how to sleep.</p></article></div></section><section class="story-close"><img src="/assets/editorial-evening-room.jpg" alt="A softly illuminated bedroom at night" loading="lazy"><div><span class="eyebrow">A PLACE TO BEGIN</span><h2>One thoughtful evening at a time.</h2><p>Explore the formulation, read the current documentation status, or find an idea for your own wind-down.</p><div><a href="/science">Explore the formulation</a><a href="/journal">Read the journal</a><a href="/quality">See quality information</a></div></div></section></article>`;
}

export function mountPages() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const main = document.querySelector('main');
  const science = document.querySelector('#science');
  document.querySelectorAll('a[aria-label="NextYou home"]').forEach(link => link.href = '/');
  document.querySelector('footer').id = 'footer';

  if (path === '/') return;
  document.body.classList.add('inner-page');

  if (path === '/products') {
    main.innerHTML = `<section class="catalog-page"><div class="catalog-lead"><span class="eyebrow">NEXTYOU / THE COLLECTION</span><h1>Whole-body wellness begins with a thoughtful evening.</h1><p>Meet the first NextYou formulation, created around sleep and circadian rhythm.</p></div><article class="catalog-card"><img src="/assets/circaden-hero-still.png" alt="CIRCADEN bottle and presentation box"><div><span class="eyebrow">CIRCADEN™ / SLEEP + RECOVERY</span><h2>A more considered evening.</h2><p>Three named ingredients in one 60-capsule pack, as shown in the supplied product materials. Explore the product gallery, formula, frequently asked questions, and current quality-document status.</p>${productLink}<a class="text-link" href="/science">Understand the formulation</a></div></article><section class="catalog-editorial"><img src="/assets/editorial-evening-room.jpg" alt="A warm bedside light beside a quiet bedroom" loading="lazy"><div><span class="eyebrow">A PERSONAL ROUTINE</span><h2>Make room for a slower transition.</h2><p>Explore a few ideas for shaping an evening that works for you.</p><a class="text-link" href="/journal/the-evening-transition">Read the evening story</a></div></section></section>`;
  } else if (path === '/products/circaden') {
    mountProduct(main);
  } else if (path === '/journal') {
    renderJournal(main);
  } else if (path.startsWith('/journal/')) {
    renderArticle(main, path);
  } else if (path === '/science') {
    renderScience(main, science);
  } else if (path === '/quality') {
    renderQuality(main);
  } else if (path === '/story') {
    renderStory(main);
  } else if (path === '/questions') {
    renderQuestions(main);
  } else if (path === '/contact') {
    renderContact(main);
  } else if (path === '/terms') {
    renderTerms(main);
  } else if (path === '/privacy') {
    renderPrivacy(main);
  } else if (path === '/account' || path === '/track-order') {
    renderServiceStatus(main, path);
  } else if (path === '/shipping' || path === '/returns') {
    renderShipping(main, path === '/returns');
  } else {
    main.innerHTML = '<section class="article-page"><h1>We could not find that page.</h1><p>Return to NextYou and choose where you would like to go next.</p><a class="pill" href="/">Return home</a></section>';
  }

  const titles = {
    '/products': 'Shop the collection — NextYou', '/products/circaden': 'CIRCADEN — NextYou',
    '/journal': 'The NextYou Journal', '/science': 'The CIRCADEN formulation — NextYou',
    '/quality': 'Quality + transparency — NextYou', '/story': 'Our story — NextYou',
    '/questions': 'Questions about CIRCADEN — NextYou', '/contact': 'Contact — NextYou',
    '/account': 'Your account — NextYou', '/track-order': 'Order tracking — NextYou',
    '/shipping': 'Shipping information — NextYou', '/returns': 'Returns information — NextYou',
    '/terms': 'Terms and conditions — NextYou', '/privacy': 'Privacy notice — NextYou'
  };
  document.title = titles[path] || 'NextYou — Everyday wellness';
}
