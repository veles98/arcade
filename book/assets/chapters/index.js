// The library: one entry per chapter. To add a chapter: write assets/chapters/chN.js (same shape as ch2.js),
// put its cards in img/cards/, then set ready: true here.
export const LIBRARY = [
  { id: 'ch1', n: '١', kicker: 'الفصل الأول', title: 'قصة الذكاء الاصطناعي', file: './ch1.js', ready: true },
  { id: 'ch2', n: '٢', kicker: 'الفصل الثاني', title: 'كيف يفهم ChatGPT كلامك؟', file: './ch2.js', ready: true },
  { id: 'ch3', n: '٣', kicker: 'الفصل الثالث', title: 'كيف تكلّم الذكاء الاصطناعي صح', ready: false },
  { id: 'ch4', n: '٤', kicker: 'الفصل الرابع', title: 'كيف تنرسم الصور بالذكاء الاصطناعي', ready: false },
  { id: 'ch5', n: '٥', kicker: 'الفصل الخامس', title: 'احمِ نفسك: الصوت والصورة المزيفة', ready: false },
  { id: 'ch6', n: '٦', kicker: 'الفصل السادس', title: 'الذكاء الاصطناعي في يومك', ready: false },
  { id: 'ch7', n: '٧', kicker: 'الفصل السابع', title: 'وش الجاي؟ مساعد يشتغل بدالك', ready: false },
];

// Reader-mode cover (the ?autoplay=1 reel keeps the chapter-1 cover from content.js).
export const BOOK_COVER = {
  lines: ['كتاب الذكاء', 'الاصطناعي'],
  subtitle: 'بالعربي البسيط',
  kicker: 'كتاب تفاعلي',
  title: 'كتاب الذكاء الاصطناعي',
  intro: 'الذكاء الاصطناعي بكلام بسيط… صفحة صفحة، وأنت تقلّب بنفسك.',
  hint: 'اضغط على الكتاب لتفتحه',
};

// Spread 0 of the reader book: the contents page.
export const TOC_SPREAD = {
  id: 'toc', ch: 'toc', toc: true, year: '', title: 'الفهرس', motif: 'ripples',
  cam: { a: { focus: [0.0, 0.5, -0.2], az: -8, el: 40, df: 0.95 }, b: { focus: [0.0, 0.42, -0.16], az: 4, el: 24, df: 0.8 } },
  layers: [
    { img: 's4_back', x: 0, z: -0.6, w: 1.92 },
    { img: 'toc_shelf', x: 0, z: -0.24, h: 0.92 },
  ],
};

export const END_CARD = {
  lines: ['خلصت الفصول الجاهزة.', 'الفصول الجاية تنزل قريباً'],
  follow: 'تابع <bdi dir="ltr">@anas.ai.ar</bdi> عشان يوصلك الفصل الجاي',
};
