// Usage data for the "form in context" panel.
//
// TENSE_USAGE: when each tense is used, trigger words, a one-line "use when".
// CONTRASTS: hand-written notes for the pairs learners mix up.
// CUES: a person-neutral time cue per tense (Spanish / English).
// VERB_CTX: per verb: a person-neutral complement (es/en) and the English
//                verb forms, so one natural sentence can be generated for every
//                verb × tense × person without hand-writing 2,000 sentences.
//
// English verb forms: enV = [base, thirdPersonSingular, past]. Verbs whose
// English present or past varies by person (be, have) use the object form.

export const TENSE_USAGE = {
  presente: {
    short: 'habits, facts, and what is happening now',
    use: 'Things that are generally true, routines and habits, and actions happening right now. Spanish also uses it for the near future in speech ("mañana voy al médico").',
    cues: ['siempre', 'todos los días', 'normalmente', 'ahora', 'hoy', 'a veces'],
  },
  preterito: {
    short: 'a completed action at a specific point in the past',
    use: 'An action that happened and finished: a single event, a sequence of events, or something with a clear start or end. It moves the story forward.',
    cues: ['ayer', 'anoche', 'la semana pasada', 'el año pasado', 'de repente', 'una vez', 'en 2019'],
  },
  imperfecto: {
    short: 'ongoing, habitual, or background past; no clear end point',
    use: 'What used to happen, what was going on in the background, descriptions in the past (age, weather, time, feelings, appearance). It sets the scene rather than moving the story forward.',
    cues: ['siempre', 'todos los veranos', 'mientras', 'cuando era niño', 'antes', 'a menudo', 'en aquella época'],
  },
  futuro: {
    short: 'what will happen; also guesses about the present',
    use: 'A prediction or promise about the future. Spanish also uses it to speculate about now ("¿Dónde estará?" / "Estará en casa" = he is probably at home).',
    cues: ['mañana', 'el año que viene', 'la próxima semana', 'pronto', 'algún día'],
  },
  condicional: {
    short: 'what would happen; hypotheticals, politeness, advice',
    use: 'Hypothetical results ("si tuviera tiempo, viajaría"), polite requests ("¿podrías ayudarme?"), advice ("yo no lo haría"), and the future seen from the past ("dijo que vendría").',
    cues: ['si pudiera…', 'en tu lugar', 'me gustaría', 'con más tiempo'],
  },
};

export const CONTRASTS = {
  'preterito|imperfecto': {
    title: 'Pretérito vs imperfecto',
    body: 'Ask: did it happen once and finish (pretérito), or was it ongoing, repeated, or background (imperfecto)? "Fuimos al mercado" = we went (one trip, done). "Íbamos al mercado" = we used to go / we were going. In one story they often sit together: the imperfecto paints the scene, the pretérito is what happened in it: "Llovía (imp.) cuando llegamos (pret.)".',
  },
  'futuro|condicional': {
    title: 'Futuro vs condicional',
    body: 'Futuro is what WILL happen; condicional is what WOULD happen under some condition, or a softer, more polite version of a statement. "Iré mañana" = I will go. "Iría, pero no puedo" = I would go, but I can\'t. Both share the same stem, so an irregular future stem is also the irregular conditional stem.',
  },
  'presente|futuro': {
    title: 'Presente vs futuro',
    body: 'In conversation the presente often replaces the futuro for planned, near-term things ("Mañana trabajo desde casa"). The futuro tense itself sounds more like a prediction or a promise, and is also used to guess about the present ("Será la una" = it must be about one o\'clock).',
  },
  'presente|preterito': {
    title: 'Presente vs pretérito',
    body: 'Presente = a habit or something true now; pretérito = one finished event. "Como en casa" (I eat at home, generally) vs "Comí en casa" (I ate at home, that time).',
  },
  'presente|imperfecto': {
    title: 'Presente vs imperfecto',
    body: 'Same idea of habit or state, shifted into the past. "Vivo en Toronto" = I live in Toronto. "Vivía en Toronto" = I used to live / was living in Toronto.',
  },
  'imperfecto|condicional': {
    title: 'Imperfecto vs condicional',
    body: 'Both share -ía endings on -er/-ir verbs, so they look alike. Imperfecto attaches to the stem (comía = I used to eat); condicional attaches to the whole infinitive (comería = I would eat).',
  },
};

export const CUES = {
  presente: { es: 'todos los días', en: 'every day' },
  preterito: { es: 'ayer', en: 'yesterday' },
  imperfecto: { es: 'todos los veranos', en: 'every summer' },
  futuro: { es: 'mañana', en: 'tomorrow' },
  condicional: { es: 'con más tiempo', en: 'with more time' },
};

export const EN_SUBJECT = ['I', 'you', 'he', 'we', 'you all', 'they'];

const BE = { pres: ['am', 'are', 'is', 'are', 'are', 'are'], past: ['was', 'were', 'was', 'were', 'were', 'were'], base: 'be' };
const HAVE = { pres: ['have', 'have', 'has', 'have', 'have', 'have'], past: 'had', base: 'have' };

export const VERB_CTX = {
  ser: { es: 'parte del equipo', en: 'part of the team', enV: BE },
  estar: { es: 'en casa', en: 'at home', enV: BE },
  haber: { es: 'terminado el trabajo', en: 'finished the work', enV: HAVE, enImp: 'had', enFut: 'will have', enCond: 'would have', note: 'Haber is almost always an auxiliary: its forms combine with a participle (he comido, había salido). On its own it only appears as "hay / había / hubo" (there is / there was).' },
  tener: { es: 'mucho trabajo', en: 'a lot of work', enV: HAVE },
  hacer: { es: 'la tarea', en: 'the homework', enV: ['do', 'does', 'did'] },
  poder: { es: 'ayudar', en: 'help', enV: { pres: ['can', 'can', 'can', 'can', 'can', 'can'], past: 'could', base: 'be able to' }, enImp: 'could', enFut: 'will be able to', enCond: 'could' },
  decir: { es: 'la verdad', en: 'the truth', enV: ['tell', 'tells', 'told'] },
  ir: { es: 'al mercado', en: 'to the market', enV: ['go', 'goes', 'went'] },
  ver: { es: 'la tele', en: 'TV', enV: ['watch', 'watches', 'watched'] },
  dar: { es: 'las gracias', en: 'thanks', enV: ['give', 'gives', 'gave'] },
  saber: { es: 'la respuesta', en: 'the answer', enV: ['know', 'knows', 'knew'] },
  querer: { es: 'más café', en: 'more coffee', enV: ['want', 'wants', 'wanted'] },
  llegar: { es: 'tarde', en: 'late', enV: ['arrive', 'arrives', 'arrived'] },
  pasar: { es: 'tiempo en casa', en: 'time at home', enV: ['spend', 'spends', 'spent'] },
  deber: { es: 'dinero al banco', en: 'money to the bank', enV: ['owe', 'owes', 'owed'] },
  poner: { es: 'la mesa', en: 'the table', enV: ['set', 'sets', 'set'] },
  quedar: { es: 'en casa', en: 'at home', enV: ['stay', 'stays', 'stayed'] },
  creer: { es: 'en la suerte', en: 'in luck', enV: ['believe', 'believes', 'believed'] },
  hablar: { es: 'español con la familia', en: 'Spanish with the family', enV: ['speak', 'speaks', 'spoke'] },
  llevar: { es: 'una mochila', en: 'a backpack', enV: ['carry', 'carries', 'carried'] },
  dejar: { es: 'las llaves en la mesa', en: 'the keys on the table', enV: ['leave', 'leaves', 'left'] },
  seguir: { es: 'las instrucciones', en: 'the instructions', enV: ['follow', 'follows', 'followed'] },
  encontrar: { es: 'buenas ofertas', en: 'good deals', enV: ['find', 'finds', 'found'] },
  llamar: { es: 'a la abuela', en: 'grandma', enV: ['call', 'calls', 'called'] },
  venir: { es: 'a la oficina', en: 'to the office', enV: ['come', 'comes', 'came'] },
  pensar: { es: 'en el futuro', en: 'about the future', enV: ['think', 'thinks', 'thought'] },
  salir: { es: 'con los amigos', en: 'with friends', enV: ['go out', 'goes out', 'went out'] },
  volver: { es: 'a casa temprano', en: 'home early', enV: ['return', 'returns', 'returned'] },
  tomar: { es: 'café por la mañana', en: 'coffee in the morning', enV: ['drink', 'drinks', 'drank'] },
  conocer: { es: 'a mucha gente', en: 'a lot of people', enV: ['know', 'knows', 'knew'] },
  vivir: { es: 'en Toronto', en: 'in Toronto', enV: ['live', 'lives', 'lived'] },
  sentir: { es: 'mucha energía', en: 'a lot of energy', enV: ['feel', 'feels', 'felt'] },
  mirar: { es: 'las estrellas', en: 'the stars', enV: ['look at', 'looks at', 'looked at'] },
  contar: { es: 'los días', en: 'the days', enV: ['count', 'counts', 'counted'] },
  empezar: { es: 'el trabajo a las nueve', en: 'work at nine', enV: ['start', 'starts', 'started'] },
  esperar: { es: 'el autobús', en: 'the bus', enV: ['wait for', 'waits for', 'waited for'] },
  buscar: { es: 'las gafas', en: 'the glasses', enV: ['look for', 'looks for', 'looked for'] },
  entrar: { es: 'por la puerta principal', en: 'through the main door', enV: ['go in', 'goes in', 'went in'] },
  trabajar: { es: 'desde casa', en: 'from home', enV: ['work', 'works', 'worked'] },
  escribir: { es: 'correos por la tarde', en: 'emails in the afternoon', enV: ['write', 'writes', 'wrote'] },
  perder: { es: 'las llaves', en: 'the keys', enV: ['lose', 'loses', 'lost'] },
  entender: { es: 'la lección', en: 'the lesson', enV: ['understand', 'understands', 'understood'] },
  pedir: { es: 'una paella', en: 'a paella', enV: ['order', 'orders', 'ordered'] },
  recibir: { es: 'muchos mensajes', en: 'many messages', enV: ['receive', 'receives', 'received'] },
  recordar: { es: 'el nombre', en: 'the name', enV: ['remember', 'remembers', 'remembered'] },
  terminar: { es: 'el informe', en: 'the report', enV: ['finish', 'finishes', 'finished'] },
  comenzar: { es: 'la clase', en: 'the class', enV: ['begin', 'begins', 'began'] },
  servir: { es: 'la cena', en: 'dinner', enV: ['serve', 'serves', 'served'] },
  sacar: { es: 'la basura', en: 'the trash', enV: ['take out', 'takes out', 'took out'] },
  necesitar: { es: 'más tiempo', en: 'more time', enV: ['need', 'needs', 'needed'] },
  leer: { es: 'el periódico', en: 'the newspaper', enV: ['read', 'reads', 'read'] },
  abrir: { es: 'las ventanas', en: 'the windows', enV: ['open', 'opens', 'opened'] },
  oír: { es: 'música en la calle', en: 'music in the street', enV: ['hear', 'hears', 'heard'] },
  traer: { es: 'el postre', en: 'dessert', enV: ['bring', 'brings', 'brought'] },
  morir: { es: 'de risa', en: 'laughing', enV: ['die', 'dies', 'died'] },
  tocar: { es: 'la guitarra', en: 'the guitar', enV: ['play', 'plays', 'played'] },
  estudiar: { es: 'por la noche', en: 'at night', enV: ['study', 'studies', 'studied'] },
  correr: { es: 'por el parque', en: 'in the park', enV: ['run', 'runs', 'ran'] },
  pagar: { es: 'la cuenta', en: 'the bill', enV: ['pay', 'pays', 'paid'] },
  jugar: { es: 'al fútbol', en: 'soccer', enV: ['play', 'plays', 'played'] },
  repetir: { es: 'la frase', en: 'the sentence', enV: ['repeat', 'repeats', 'repeated'] },
  comer: { es: 'en el restaurante', en: 'at the restaurant', enV: ['eat', 'eats', 'ate'] },
  dormir: { es: 'ocho horas', en: 'eight hours', enV: ['sleep', 'sleeps', 'slept'] },
  preferir: { es: 'el té', en: 'tea', enV: ['prefer', 'prefers', 'preferred'] },
  conducir: { es: 'al trabajo', en: 'to work', enV: ['drive', 'drives', 'drove'] },
  cerrar: { es: 'la tienda a las ocho', en: 'the shop at eight', enV: ['close', 'closes', 'closed'] },
  subir: { es: 'las escaleras', en: 'the stairs', enV: ['go up', 'goes up', 'went up'] },
  aprender: { es: 'algo nuevo', en: 'something new', enV: ['learn', 'learns', 'learned'] },
  beber: { es: 'agua', en: 'water', enV: ['drink', 'drinks', 'drank'] },
  vender: { es: 'fruta en el mercado', en: 'fruit at the market', enV: ['sell', 'sells', 'sold'] },
  comprar: { es: 'pan', en: 'bread', enV: ['buy', 'buys', 'bought'] },
};

/** Extra notes that only apply to one verb × tense. */
export const SPECIAL_NOTES = {
  'ser|preterito': 'Ser and ir share the same pretérito (fui, fuiste, fue…). Context decides: "fuimos al mercado" = we went; "fuimos los primeros" = we were.',
  'ir|preterito': 'Ir and ser share the same pretérito (fui, fuiste, fue…). Context decides: "fuimos al mercado" = we went; "fuimos los primeros" = we were.',
  'saber|preterito': 'In the pretérito, saber usually means "found out" rather than "knew": "supe la respuesta" = I found out the answer.',
  'conocer|preterito': 'In the pretérito, conocer means "met (for the first time)": "conocí a mucha gente" = I met a lot of people.',
  'querer|preterito': 'In the pretérito, querer often means "tried to", and "no quise" means "refused to".',
  'poder|preterito': 'In the pretérito, poder means "managed to" (pude = I managed to); "no pude" = I failed to / couldn\'t (that time).',
  'tener|preterito': 'In the pretérito, tener can mean "got / received": "tuve una idea" = I had (got) an idea.',
  'haber|presente': 'Used as the auxiliary of the pretérito perfecto: "he terminado" = I have finished. "Hay" (there is / there are) is the impersonal form.',
};
