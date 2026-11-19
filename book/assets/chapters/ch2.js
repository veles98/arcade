// Chapter 2: how ChatGPT understands you. Plain everyday Arabic, one idea per spread.
// Layer units: page width = 1.0, page height = 1.36; x>0 = right page, z<0 = far edge of the book.
// beat = the interactive scene of the spread (built in book.js); hit = what a tap on that card triggers.
export default {
  id: 'ch2',
  spreads: [
    {
      year: '١', title: 'يكمّل الجملة', beat: 'nextword', motif: 'lines',
      lines: [
        'ChatGPT في الأساس يسوّي شي واحد: <b>يخمّن الكلمة الجاية</b>.',
        'مثل لما أقول لك: «طلعت الشمس من…» وأنت تكمّل على طول: <b>الشرق</b>.',
      ],
      tryText: 'جرّب: اضغط على الآلة الكاتبة',
      cam: { a: { focus: [0.0, 0.55, -0.2], az: -6, el: 40, df: 0.95 }, b: { focus: [0.0, 0.4, -0.06], az: 6, el: 20, df: 0.72 } },
      layers: [
        { img: 'c2_s1_back', x: 0, z: -0.6, w: 1.92 },
        { img: 'c2_s1_mid', x: 0.02, z: -0.26, w: 0.98, hit: 'type' },
        { proc: 'nextword', z: 0.12 },
        { img: 's4_front', x: 0, z: 0.44, w: 1.96, sway: 1 },
      ],
    },
    {
      year: '٢', title: 'قرأ كلام ما ينقرأ في عمر', beat: 'books', motif: 'grid', needs: ['c2_s2_book'],
      lines: [
        'عشان يتعلّم يخمّن، قرأ <b>كمية ضخمة من الكلام</b>: كتب ومقالات ومواقع.',
        'لو تقرأ ليل ونهار بدون نوم، تحتاج <b>آلاف السنين</b> عشان تخلّص اللي قرأه.',
      ],
      tryText: 'جرّب: اضغط على كومة الكتب',
      cam: { a: { focus: [0.0, 0.62, -0.25], az: 8, el: 44, df: 1.0 }, b: { focus: [-0.06, 0.46, -0.12], az: -8, el: 18, df: 0.74 } },
      layers: [
        { img: 'c2_s2_back', x: 0, z: -0.6, w: 1.92 },
        { img: 'c2_s2_mid', x: -0.46, z: -0.3, h: 0.98, hit: 'books', id: 'pile' },
        { proc: 'books', z: 0.1 },
      ],
    },
    {
      year: '٣', title: 'تعلّم بالتجربة والغلط', beat: 'archery', motif: 'ripples',
      lines: [
        'تدرّب كذا: نغطّي الكلمة الجاية في جملة، <b>يخمّنها</b>، يشوف الصح، ويعدّل نفسه شوي.',
        'ويعيدها <b>مليارات المرات</b>… مثل الرامي، كل ما رمى قرّب من الوسط.',
      ],
      tryText: 'جرّب: اضغط على الهدف',
      cam: { a: { focus: [0.0, 0.5, -0.15], az: -10, el: 32, df: 0.94 }, b: { focus: [-0.04, 0.38, -0.04], az: 12, el: 16, df: 0.72 } },
      aim: { x: -0.5, y: 0.35, z: -0.2 },
      layers: [
        { img: 'c2_s3_back', x: 0, z: -0.6, w: 1.92 },
        { img: 'c2_s3_target', x: -0.5, z: -0.2, h: 0.62, id: 'target', hit: 'archery' },
        { img: 'c2_s3_fg', x: 0.55, z: 0.16, h: 0.6, id: 'archer', hit: 'archery' },
        { proc: 'archery', z: 0.0 },
      ],
    },
    {
      year: '٤', title: 'ليش أحياناً يألّف؟', beat: 'story', motif: 'chess',
      lines: [
        'شغلته يطلّع كلام <b>يبان صحيح</b>… مو إنه يتأكد إنه صحيح.',
        'فإذا ما يعرف، ممكن <b>يألّف جواب بثقة كاملة</b>، مثل حكواتي ما يحب يقول «ما أدري».',
      ],
      tryText: 'جرّب: اضغط على الحكواتي',
      cam: { a: { focus: [0.0, 0.42, 0.0], az: -30, el: 24, df: 0.86 }, b: { focus: [0.02, 0.44, 0.0], az: 14, el: 18, df: 0.74 } },
      layers: [
        { img: 'c2_s4_back', x: 0, z: -0.6, w: 1.92 },
        { img: 'c2_s4_fg', x: 0.36, z: -0.08, h: 0.78, id: 'teller', hit: 'story' },
        { proc: 'story', z: 0.12 },
        { img: 's2_front', x: 0, z: 0.44, w: 1.96, sway: 1 },
      ],
    },
    {
      year: '٥', title: 'وش تسوّي أنت؟', beat: 'verify', motif: 'gears',
      lines: [
        'استعمله وأنت مرتاح… بس <b>الأشياء المهمة</b> مثل الصحة والفلوس والأخبار، تأكّد منها من مصدر موثوق.',
        'وإذا عطاك مصدر، <b>افتحه وتأكّد بنفسك</b>.',
      ],
      tryText: 'جرّب: اضغط على العدسة',
      cam: { a: { focus: [0.0, 0.5, -0.2], az: 4, el: 44, df: 0.96 }, b: { focus: [0.0, 0.32, 0.04], az: -6, el: 24, df: 0.7 } },
      layers: [
        { img: 'c2_s5_back', x: 0, z: -0.6, w: 1.92 },
        { img: 'c2_s5_mid', x: 0.0, z: -0.24, w: 1.2 },
        { proc: 'verify', z: 0.16 },
        { img: 'c2_s5_glass', x: 0.66, z: 0.3, h: 0.5, id: 'glass', hit: 'verify' },
      ],
    },
  ],
  // interactive data
  nextword: [
    { s: 'طلعت الشمس من', c: [['الشرق', 0.9], ['البحر', 0.06], ['الغرب', 0.04]] },
    { s: 'أهلاً', c: [['وسهلاً', 0.86], ['بك', 0.11], ['يا', 0.03]] },
    { s: 'صباح', c: [['الخير', 0.84], ['النور', 0.13], ['السبت', 0.03]] },
  ],
  books: { counter: '١٠٠٠', caption: 'سنة قراءة… وأكثر بكثير' },
  archery: ['المحاولة ١', 'المحاولة ٢', 'المحاولة ٣… في الوسط!'],
  story: { q: 'لخّص لي كتاب «جمل على القمر»', a: 'أكيد! الكتاب يحكي عن جمل سافر للقمر…', stamp: 'والكتاب أصلاً ما له وجود!' },
  verify: { cards: ['الصحة', 'الفلوس', 'الأخبار'], stamp: 'تأكّد' },
};
