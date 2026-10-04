import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'java',
      q: { en: 'What does b hold after this code?', hi: 'Is code ke baad b mein kya hoga?' },
      code: 'int a = 123456789;\nlong b = a * a;',
      options: ['-1757895751', '15241578750190521', { en: 'Compile error', hi: 'Compile error' }, 'ArithmeticException'],
      answer: 0,
      explain: {
        en: 'a * a is computed in int (both operands are int), overflows silently, and only then is widened to long. Write (long) a * a.',
        hi: 'a * a int mein calculate hota hai (dono operands int hain), chupchaap overflow hota hai, phir long banta hai. (long) a * a likho.',
      },
    },
    {
      kind: 'java',
      q: { en: 'In Java, what are -7 % 3 and Math.floorMod(-7, 3)?', hi: 'Java mein -7 % 3 aur Math.floorMod(-7, 3) kya hain?' },
      options: ['-1 and 2', '2 and 2', '-1 and -1', '1 and 2'],
      answer: 0,
      explain: {
        en: '% keeps the sign of the left operand (-1). floorMod always returns a value in 0..m−1 (2), which is what “x mod m” means.',
        hi: '% left operand ka sign rakhta hai (-1). floorMod hamesha 0..m−1 mein deta hai (2) — maths wala “x mod m”.',
      },
    },
    {
      kind: 'concept',
      q: { en: 'Why write output to a PrintWriter and flush once?', hi: 'Output PrintWriter mein likh ke ek baar flush kyun karte hain?' },
      options: [
        { en: 'It buffers output; printing line by line with System.out can flush on every line and be very slow', hi: 'Yeh output buffer karta hai; System.out se line-by-line print har line pe flush kar sakta hai aur bahut slow hai' },
        { en: 'System.out cannot print long values', hi: 'System.out long values print nahi kar sakta' },
        { en: 'Judges only read PrintWriter output', hi: 'Judge sirf PrintWriter ka output padhte hain' },
        { en: 'It formats numbers with commas', hi: 'Yeh numbers ko commas ke saath format karta hai' },
      ],
      answer: 0,
      explain: {
        en: 'Buffered output is written in big chunks. Forgetting the final flush() means nothing gets printed at all.',
        hi: 'Buffered output bade chunks mein likha jaata hai. Aakhri flush() bhool gaye toh kuch print hi nahi hoga.',
      },
    },
    {
      kind: 'java',
      q: { en: 'What does 0.3 * 3 + 0.1 == 1.0 evaluate to in Java?', hi: 'Java mein 0.3 * 3 + 0.1 == 1.0 kya dega?' },
      options: ['false', 'true', { en: 'It depends on the JVM', hi: 'JVM pe depend karta hai' }, { en: 'Compile error', hi: 'Compile error' }],
      answer: 0,
      explain: {
        en: 'The left side is 0.9999999999999999 because of rounding. Compare doubles with Math.abs(a - b) < 1e-9.',
        hi: 'Rounding ki wajah se left side 0.9999999999999999 hai. Doubles ko Math.abs(a - b) < 1e-9 se compare karo.',
      },
    },
    {
      kind: 'trace',
      q: { en: 'Using the geometric progression formula, what is 3 + 6 + 12 + 24?', hi: 'Geometric progression formula se 3 + 6 + 12 + 24 kitna hai?' },
      options: ['45', '48', '42', '36'],
      answer: 0,
      explain: { en: '(b·k − a)/(k − 1) = (24·2 − 3)/1 = 45.', hi: '(b·k − a)/(k − 1) = (24·2 − 3)/1 = 45.' },
    },
    {
      kind: 'java',
      q: { en: 'For positive ints a and b, which expression is ⌈a / b⌉?', hi: 'Positive ints a aur b ke liye ⌈a / b⌉ kaunsa expression hai?' },
      options: ['(a + b - 1) / b', 'a / b + 1', '(int) Math.ceil(a / b)', 'a / (b - 1)'],
      answer: 0,
      explain: {
        en: 'Adding b − 1 pushes any remainder over the next multiple. Math.ceil(a / b) is wrong because a / b is already an integer division.',
        hi: 'b − 1 jodne se koi bhi remainder agle multiple tak pahunch jaata hai. Math.ceil(a / b) galat hai — a / b pehle hi integer division ho chuka hai.',
      },
    },
    {
      kind: 'concept',
      q: { en: 'How many binary digits does 123 have?', hi: '123 mein kitne binary digits hain?' },
      options: ['7', '6', '8', '123'],
      answer: 0,
      explain: { en: '⌊log₂ 123⌋ + 1 = 6 + 1 = 7, and indeed 123 = 1111011₂.', hi: '⌊log₂ 123⌋ + 1 = 6 + 1 = 7, aur sach mein 123 = 1111011₂.' },
    },
  ],

  practice: [
    { id: 1068, name: 'Weird Algorithm', level: 'easy', section: '1.3', note: { en: 'The values grow past 2³¹: use long.', hi: 'Values 2³¹ se upar jaati hain: long use karo.' } },
    { id: 1083, name: 'Missing Number', level: 'easy', section: '1.5', note: { en: 'n(n+1)/2 minus the sum of the input (in long).', hi: 'n(n+1)/2 mein se input ka sum ghatao (long mein).' } },
    { id: 1069, name: 'Repetitions', level: 'easy', section: '1.2', note: { en: 'Read one string token and scan it.', hi: 'Ek string token padho aur scan karo.' } },
    { id: 1094, name: 'Increasing Array', level: 'easy', section: '1.3', note: { en: 'The total number of moves can exceed int.', hi: 'Total moves int se zyada ho sakte hain.' } },
    { id: 1617, name: 'Bit Strings', level: 'easy', section: '1.3', note: { en: '2ⁿ modulo 10⁹ + 7, multiplying step by step.', hi: '2ⁿ modulo 10⁹ + 7, step by step multiply karke.' } },
    { id: 1071, name: 'Number Spiral', level: 'medium', section: '1.5', note: { en: 'Find a formula for each diagonal; values reach about 10¹⁸.', hi: 'Har diagonal ka formula nikaalo; values ~10¹⁸ tak jaati hain.' } },
    { id: 1618, name: 'Trailing Zeros', level: 'medium', section: '1.5', note: { en: 'Count factors of 5 in n!: n/5 + n/25 + …', hi: 'n! mein 5 ke factors gino: n/5 + n/25 + …' } },
  ],

  cheatsheet: [
    { title: 'Template', body: { en: 'FastReader (BufferedReader + StringTokenizer) for input, PrintWriter for output, `out.flush()` at the end. Rename the class to `Main`.', hi: 'Input ke liye FastReader (BufferedReader + StringTokenizer), output ke liye PrintWriter, end mein `out.flush()`. Class ka naam `Main` karo.' } },
    { title: 'int vs long', body: { en: '`int` ≈ ±2.1·10⁹, `long` ≈ ±9.2·10¹⁸. Widen before multiplying: `(long) a * b`. `Math.multiplyExact` catches overflow.', hi: '`int` ≈ ±2.1·10⁹, `long` ≈ ±9.2·10¹⁸. Multiply se pehle widen karo: `(long) a * b`. `Math.multiplyExact` overflow pakadta hai.' } },
    { title: 'Modulo', body: { en: 'Reduce after every + − ×. `-7 % 3 == -1` in Java, so use `Math.floorMod`. The product of two values below 10⁹+7 needs a long.', hi: 'Har + − × ke baad reduce karo. Java mein `-7 % 3 == -1`, toh `Math.floorMod`. 10⁹+7 se chhoti do values ka product long mein.' } },
    { title: 'Doubles', body: { en: 'Compare with `Math.abs(a - b) < 1e-9`. Print with `String.format(Locale.US, "%.9f", x)`. Integers are exact only up to 2⁵³.', hi: '`Math.abs(a - b) < 1e-9` se compare karo. `String.format(Locale.US, "%.9f", x)` se print karo. Integers sirf 2⁵³ tak exact.' } },
    { title: 'Formulas', body: { en: 'Σx = n(n+1)/2, Σx² = n(n+1)(2n+1)/6, geometric `(bk − a)/(k − 1)`, harmonic ≤ log₂ n + 1.', hi: 'Σx = n(n+1)/2, Σx² = n(n+1)(2n+1)/6, geometric `(bk − a)/(k − 1)`, harmonic ≤ log₂ n + 1.' } },
    { title: 'Floor / ceil', body: { en: 'Java `/` truncates toward 0, so use `Math.floorDiv` for negatives. ⌈a/b⌉ = `(a + b - 1) / b` for positive numbers.', hi: 'Java `/` zero ki taraf truncate karta hai — negatives ke liye `Math.floorDiv`. Positive ke liye ⌈a/b⌉ = `(a + b - 1) / b`.' } },
  ],

  flashcards: [
    { front: { en: 'Why is `long b = a * a;` wrong when a is an int?', hi: '`long b = a * a;` galat kyun hai jab a int hai?' }, back: { en: 'The multiplication happens in int and overflows before being widened. Write `(long) a * a`.', hi: 'Multiplication int mein hota hai aur widen hone se pehle overflow ho jaata hai. `(long) a * a` likho.' } },
    { front: { en: 'Make x mod m non-negative in Java?', hi: 'Java mein x mod m non-negative kaise?' }, back: { en: '`Math.floorMod(x, m)`, which always returns 0..m−1.', hi: '`Math.floorMod(x, m)` — hamesha 0..m−1.' } },
    { front: { en: 'Fast input in Java?', hi: 'Java mein fast input?' }, back: { en: 'BufferedReader + StringTokenizer (the FastReader). Never Scanner for big input.', hi: 'BufferedReader + StringTokenizer (FastReader). Bade input pe kabhi Scanner nahi.' } },
    { front: { en: 'Print a double with 9 decimals safely?', hi: 'Double ko 9 decimals ke saath safely print?' }, back: { en: '`String.format(Locale.US, "%.9f", x)`, otherwise some locales print a comma.', hi: '`String.format(Locale.US, "%.9f", x)` — warna kuch locales comma print karte hain.' } },
    { front: { en: '1 + 2 + 4 + … + 2ⁿ⁻¹ = ?', hi: '1 + 2 + 4 + … + 2ⁿ⁻¹ = ?' }, back: { en: '2ⁿ − 1', hi: '2ⁿ − 1' } },
  ],
};

export default extras;
