// Chapter 1 content: plain Arabic (owner's wording), one idea per page, very short sentences.
// Layer units: page width = 1.0, page height = 1.36; x>0 = right page, z<0 = far edge of the book.
export const COVER = {
  title: 'قصة الذكاء الاصطناعي',
  subtitle: 'الفصل الأول',
  intro: 'خمس محطات صغيرة… من سؤال بسيط إلى كمبيوتر يحاورك.',
  hint: 'اضغط على الكتاب لتفتحه',
};

export const FINAL = [
  'سؤال تورنغ عمره ٧٥ سنة… وللحين ما انحسم.',
  'تتوقع الكمبيوتر يقدر يفكّر مثلنا؟',
];

export const SPREADS = [
  {
    year: '1950',
    title: 'سؤال بسيط',
    lines: [
      'عالم بريطاني اسمه آلن تورنغ سأل:',
      '<b>«هل ممكن الكمبيوتر يفكّر مثلنا؟»</b>',
    ],
    tryText: 'جرّب: اضغط على الكمبيوتر',
    motif: 'gears',
    // designed camera move: crane down through the arch
    cam: { a: { focus: [0.05, 0.62, -0.2], az: 4, el: 46, df: 0.98 }, b: { focus: [0.12, 0.44, -0.12], az: 10, el: 13, df: 0.66 } },
    layers: [
      { img: 's1_back', x: 0, z: -0.6, w: 1.92 },
      { img: 's1_mid', x: -0.3, z: -0.32, w: 1.12, hit: 'machine' },
      { img: 's1_gear', x: -0.78, z: -0.14, w: 0.3, id: 'gearA', spin: 0.6, float: 0.2 },
      { img: 's1_gear', x: -0.55, z: -0.1, w: 0.2, id: 'gearB', spin: -0.9, float: 0.34 },
      { img: 's1_desk', x: 0.5, z: -0.06, w: 0.68 },
      { img: 's1_fg', x: 0.3, z: 0.2, h: 0.56, id: 'turing', hit: 'machine' },
      { img: 's1_frame', x: 0, z: 0.44, w: 1.96, sway: 1 },
    ],
  },
  {
    year: '1997',
    title: 'ديب بلو يغلب البطل',
    lines: [
      'كمبيوتر من شركة IBM اسمه <b>«ديب بلو»</b> لعب شطرنج ضد أقوى لاعب في العالم (كاسباروف)… <b>وغلبه.</b>',
      'بس كان يعرف شطرنج وبس… ما يعرف وش هي القطة.',
    ],
    tryText: 'جرّب: اضغط على قطع الشطرنج',
    motif: 'chess',
    // slow orbit around the chess stage
    cam: { a: { focus: [0.0, 0.4, 0.0], az: -34, el: 26, df: 0.84 }, b: { focus: [0.04, 0.38, 0.04], az: 16, el: 20, df: 0.72 } },
    layers: [
      { img: 's2_back', x: 0, z: -0.6, w: 1.92 },
      { img: 's2_mid', x: -0.58, z: -0.34, h: 0.8, hit: 'chess' },
      { img: 's2_fg', x: 0.36, z: -0.1, w: 0.82, hit: 'chess' },
      { img: 's2_piece', x: -0.12, z: 0.26, h: 0.34, id: 'king', hit: 'chess' },
      { img: 's2_knight', x: 0.52, z: 0.26, h: 0.3, id: 'knight', hit: 'chess' },
      { proc: 'catq', z: -0.12 },
      { img: 's2_front', x: 0, z: 0.44, w: 1.96, sway: 1 },
    ],
  },
  {
    year: '2012',
    title: 'يتعلّم بنفسه',
    lines: [
      'تغيّرت الطريقة.',
      'بدل ما نعلّم الكمبيوتر خطوة خطوة، صرنا <b>نورّيه ملايين الصور</b> ويتعلّم بنفسه… مثل الطفل.',
    ],
    tryText: 'جرّب: اضغط على القطة',
    motif: 'grid',
    // push into the network
    cam: { a: { focus: [0.02, 0.5, -0.12], az: 6, el: 32, df: 0.96 }, b: { focus: [0.0, 0.4, -0.04], az: -4, el: 15, df: 0.58 } },
    layers: [
      { img: 's3_back', x: 0, z: -0.6, w: 1.62 },
      { proc: 'net', z: -0.1 },
      { img: 's3_cat', x: 0.54, z: 0.14, h: 0.44, id: 'cat', hit: 'cat' },
      { img: 's3_fg', x: -0.56, z: 0.26, w: 0.56 },
      { img: 's3_front', x: 0, z: 0.44, w: 1.96, sway: 1 },
    ],
  },
  {
    year: '2017',
    title: 'يفهم الجملة كاملة',
    lines: [
      'باحثين في قوقل لقوا طريقة تخلّي الكمبيوتر <b>يفهم الجملة كاملة</b>، مو كلمة كلمة.',
      'مثال: «شربت القطة الحليب لأنها جائعة»… يعرف إن «لأنها» تعني <b>القطة</b>.',
    ],
    tryText: 'جرّب: المس أي كلمة',
    motif: 'lines',
    // dolly in from above onto the words
    cam: { a: { focus: [0.0, 0.5, -0.2], az: 0, el: 48, df: 0.92 }, b: { focus: [0.0, 0.34, 0.02], az: -3, el: 28, df: 0.64 } },
    layers: [
      { img: 's4_back', x: 0, z: -0.6, w: 1.92 },
      { img: 's4_mid', x: 0, z: -0.36, h: 0.88 },
      { proc: 'words', z: 0.12 },
      { img: 's4_front', x: 0, z: 0.44, w: 1.96, sway: 1 },
    ],
  },
  {
    year: '2022',
    title: 'ChatGPT في يد الجميع',
    lines: [
      'من هالطريقة طلع <b>ChatGPT</b>…',
      'ووصل لـ<b>مليون شخص في خمس أيام</b>.',
    ],
    tryText: 'جرّب: اضغط على اللابتوب',
    motif: 'ripples',
    // rise over the crowd
    cam: { a: { focus: [0.0, 0.3, 0.05], az: -6, el: 7, df: 0.7 }, b: { focus: [0.0, 0.5, -0.16], az: 4, el: 30, df: 0.82 } },
    layers: [
      { img: 's5_back', x: 0, z: -0.6, w: 1.92 },
      { img: 's5_mid', x: 0, z: -0.3, w: 1.75, id: 'crowd' },
      { img: 's5_fg', x: 0.02, z: 0.1, w: 0.56, id: 'laptop', hit: 'chat' },
      { proc: 'chat', z: 0.12 },
    ],
  },
];

// Attention example: tokens in reading order (rendered right-to-left).
export const WORDS = ['شربت', 'القطة', 'الحليب', 'لأنها', 'جائعة'];
// ATT[i][j] = how much word i looks at word j (illustrative values).
export const ATT = [
  [0, 0.45, 0.4, 0.05, 0.1],
  [0.3, 0, 0.1, 0.25, 0.35],
  [0.6, 0.2, 0, 0.1, 0.1],
  [0.08, 0.62, 0.1, 0, 0.2],
  [0.05, 0.4, 0.05, 0.45, 0],
];

export const BUBBLE_1950 = 'هل ممكن الكمبيوتر يفكّر مثلنا؟';
export const CHATS = [
  ['وش هو الذكاء الاصطناعي؟', 'كمبيوتر يتعلّم من الأمثلة.'],
  ['اشرح لي الجاذبية لطفل', 'الأرض تشدّ كل شي لها… عشان كذا تطيح التفاحة.'],
  ['لخّص لي هالكتاب', 'سؤال، شطرنج، صور، كلمات… ومحادثة.'],
];
export const COUNTER_CAPTION = 'شخص في 5 أيام';
