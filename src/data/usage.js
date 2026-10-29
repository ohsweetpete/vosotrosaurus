// Usage data for the "form in context" panel.
//
// TENSE_USAGE: when each tense is used, trigger words, a one-line "use when".
// CONTRASTS: hand-written notes for the pairs learners mix up.
// CUES: a person-neutral time cue per tense (Spanish / English).
// VERB_CTX: per verb: a person-neutral complement (es/en) and the English
//                verb forms, so one natural sentence can be generated for every
//                verb × tense × person without hand-writing 2,000 sentences.
//
// esPl: complement for plural persons when it has to agree (muy feliz / muy felices).
// {poss} in en: replaced by the subject's possessive (my / your / his…).
// enPret: English for the pretérito when the meaning shifts (supe = found out, conocí = met).
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
  poder: { es: 'ayudar', en: 'help', enV: { pres: ['can', 'can', 'can', 'can', 'can', 'can'], past: 'could', base: 'be able to' }, enPret: 'managed to', enImp: 'could', enFut: 'will be able to', enCond: 'could' },
  decir: { es: 'la verdad', en: 'the truth', enV: ['tell', 'tells', 'told'] },
  ir: { es: 'al mercado', en: 'to the market', enV: ['go', 'goes', 'went'] },
  ver: { es: 'la tele', en: 'TV', enV: ['watch', 'watches', 'watched'] },
  dar: { es: 'las gracias', en: 'thanks', enV: ['give', 'gives', 'gave'] },
  saber: { es: 'la respuesta', en: 'the answer', enV: ['know', 'knows', 'knew'], enPret: 'found out' },
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
  conocer: { es: 'a mucha gente', en: 'a lot of people', enV: ['know', 'knows', 'knew'], enPret: 'met' },
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
  cerrar: { es: 'la tienda a las ocho', en: 'the store at eight', enV: ['close', 'closes', 'closed'] },
  subir: { es: 'las escaleras', en: 'the stairs', enV: ['go up', 'goes up', 'went up'] },
  aprender: { es: 'algo nuevo', en: 'something new', enV: ['learn', 'learns', 'learned'] },
  beber: { es: 'agua', en: 'water', enV: ['drink', 'drinks', 'drank'] },
  vender: { es: 'fruta en el mercado', en: 'fruit at the market', enV: ['sell', 'sells', 'sold'] },
  comprar: { es: 'pan', en: 'bread', enV: ['buy', 'buys', 'bought'] },
  // ---- ranks 72-200 ----
  parecer: { es: 'muy feliz', esPl: 'muy felices', en: 'very happy', enV: ['seem','seems','seemed'] },
  gustar: { es: 'a todos', en: 'everyone', enV: ['please','pleases','pleased'] },
  existir: { es: 'de verdad', en: 'for real', enV: ['exist','exists','existed'] },
  considerar: { es: 'otras opciones', en: 'other options', enV: ['consider','considers','considered'] },
  ocurrir: { es: 'sin aviso', en: 'without warning', enV: ['happen','happens','happened'] },
  permitir: { es: 'el paso', en: 'entry', enV: ['allow','allows','allowed'] },
  ganar: { es: 'el partido', en: 'the match', enV: ['win','wins','won'] },
  explicar: { es: 'la regla', en: 'the rule', enV: ['explain','explains','explained'] },
  preguntar: { es: 'por el precio', en: 'about the price', enV: ['ask','asks','asked'] },
  tratar: { es: 'de ayudar', en: 'to help', enV: ['try','tries','tried'] },
  cambiar: { es: 'de opinión', en: '{poss} mind', enV: ['change','changes','changed'] },
  crear: { es: 'algo nuevo', en: 'something new', enV: ['create','creates','created'] },
  presentar: { es: 'el proyecto', en: 'the project', enV: ['present','presents','presented'] },
  cumplir: { es: 'la promesa', en: 'the promise', enV: ['keep','keeps','kept'] },
  intentar: { es: 'otra vez', en: 'again', enV: ['try','tries','tried'] },
  usar: { es: 'el ordenador', en: 'the computer', enV: ['use','uses','used'] },
  decidir: { es: 'rápido', en: 'quickly', enV: ['decide','decides','decided'] },
  acabar: { es: 'el libro', en: 'the book', enV: ['finish','finishes','finished'] },
  caer: { es: 'al suelo', en: 'to the floor', enV: ['fall','falls','fell'] },
  mantener: { es: 'la calma', en: 'calm', enV: ['keep','keeps','kept'] },
  producir: { es: 'aceite', en: 'oil', enV: ['produce','produces','produced'] },
  aparecer: { es: 'de repente', en: 'suddenly', enV: ['appear','appears','appeared'] },
  conseguir: { es: 'entradas', en: 'tickets', enV: ['get','gets','got'] },
  ofrecer: { es: 'ayuda', en: 'help', enV: ['offer','offers','offered'] },
  suponer: { es: 'lo peor', en: 'the worst', enV: ['assume','assumes','assumed'] },
  reconocer: { es: 'la voz', en: 'the voice', enV: ['recognize','recognizes','recognized'] },
  mostrar: { es: 'las fotos', en: 'the photos', enV: ['show','shows','showed'] },
  nacer: { es: 'en primavera', en: 'in spring', enV: { pres: ['am born', 'are born', 'is born', 'are born', 'are born', 'are born'], past: ['was born', 'were born', 'was born', 'were born', 'were born', 'were born'], base: 'be born' } },
  faltar: { es: 'a clase', en: 'class', enV: ['miss','misses','missed'] },
  utilizar: { es: 'la aplicación', en: 'the app', enV: ['use','uses','used'] },
  aceptar: { es: 'la oferta', en: 'the offer', enV: ['accept','accepts','accepted'] },
  responder: { es: 'al correo', en: 'the email', enV: ['answer','answers','answered'] },
  olvidar: { es: 'la contraseña', en: 'the password', enV: ['forget','forgets','forgot'] },
  ayudar: { es: 'a los vecinos', en: 'the neighbors', enV: ['help','helps','helped'] },
  escuchar: { es: 'la radio', en: 'the radio', enV: ['listen to','listens to','listened to'] },
  'enseñar': { es: 'matemáticas', en: 'math', enV: ['teach','teaches','taught'] },
  elegir: { es: 'el color', en: 'the color', enV: ['choose','chooses','chose'] },
  construir: { es: 'una casa', en: 'a house', enV: ['build','builds','built'] },
  convertir: { es: 'la idea en un plan', en: 'the idea into a plan', enV: ['turn','turns','turned'] },
  obtener: { es: 'el permiso', en: 'the permit', enV: ['obtain','obtains','obtained'] },
  proponer: { es: 'un cambio', en: 'a change', enV: ['propose','proposes','proposed'] },
  andar: { es: 'por el centro', en: 'around downtown', enV: ['walk','walks','walked'] },
  realizar: { es: 'el plan', en: 'the plan', enV: ['carry out','carries out','carried out'] },
  resolver: { es: 'el problema', en: 'the problem', enV: ['solve','solves','solved'] },
  mover: { es: 'los muebles', en: 'the furniture', enV: ['move','moves','moved'] },
  crecer: { es: 'muy rápido', en: 'very fast', enV: ['grow','grows','grew'] },
  bajar: { es: 'las escaleras', en: 'the stairs', enV: ['go down','goes down','went down'] },
  preparar: { es: 'el desayuno', en: 'breakfast', enV: ['prepare','prepares','prepared'] },
  cantar: { es: 'en la ducha', en: 'in the shower', enV: ['sing','sings','sang'] },
  cocinar: { es: 'la cena', en: 'dinner', enV: ['cook','cooks','cooked'] },
  limpiar: { es: 'la cocina', en: 'the kitchen', enV: ['clean','cleans','cleaned'] },
  viajar: { es: 'a España', en: 'to Spain', enV: ['travel','travels','traveled'] },
  caminar: { es: 'por la playa', en: 'along the beach', enV: ['walk','walks','walked'] },
  romper: { es: 'el vaso', en: 'the glass', enV: ['break','breaks','broke'] },
  mentir: { es: 'sobre la edad', en: 'about {poss} age', enV: ['lie','lies','lied'] },
  enviar: { es: 'la carta', en: 'the letter', enV: ['send','sends','sent'] },
  continuar: { es: 'con el curso', en: 'with the course', enV: ['continue','continues','continued'] },
  sugerir: { es: 'otra ruta', en: 'another route', enV: ['suggest','suggests','suggested'] },
  requerir: { es: 'paciencia', en: 'patience', enV: ['require','requires','required'] },
  regresar: { es: 'a casa tarde', en: 'home late', enV: ['return', 'returns', 'returned'] },
  costar: { es: 'mucho esfuerzo', en: 'a lot of effort', enV: ['cost','costs','cost'] },
  devolver: { es: 'el libro', en: 'the book', enV: ['give back','gives back','gave back'] },
  doler: { es: 'mucho', en: 'a lot', enV: ['hurt','hurts','hurt'] },
  probar: { es: 'la sopa', en: 'the soup', enV: ['taste','tastes','tasted'] },
  descansar: { es: 'después del trabajo', en: 'after work', enV: ['rest','rests','rested'] },
  desayunar: { es: 'tostadas', en: 'toast for breakfast', enV: ['have','has','had'] },
  cenar: { es: 'con la familia', en: 'with the family', enV: ['have dinner','has dinner','had dinner'] },
  almorzar: { es: 'a las dos', en: 'at two', enV: ['have lunch','has lunch','had lunch'] },
  despertar: { es: 'a las siete', en: 'at seven', enV: ['wake up','wakes up','woke up'] },
  sentar: { es: 'a los invitados', en: 'the guests', enV: ['seat','seats','seated'] },
  acostar: { es: 'a los niños', en: 'the kids to bed', enV: ['put','puts','put'] },
  'reír': { es: 'con los chistes', en: 'at the jokes', enV: ['laugh','laughs','laughed'] },
  'sonreír': { es: 'en la foto', en: 'in the photo', enV: ['smile','smiles','smiled'] },
  coger: { es: 'el tren', en: 'the train', enV: ['take','takes','took'] },
  escoger: { es: 'el menú', en: 'the menu', enV: ['choose','chooses','chose'] },
  recoger: { es: 'a los niños', en: 'the kids', enV: ['pick up','picks up','picked up'] },
  proteger: { es: 'a la familia', en: 'the family', enV: ['protect','protects','protected'] },
  dirigir: { es: 'la empresa', en: 'the company', enV: ['run','runs','ran'] },
  cuidar: { es: 'a los niños', en: 'the kids', enV: ['look after','looks after','looked after'] },
  visitar: { es: 'el museo', en: 'the museum', enV: ['visit','visits','visited'] },
  invitar: { es: 'a los amigos', en: 'friends over', enV: ['invite','invites','invited'] },
  contestar: { es: 'el teléfono', en: 'the phone', enV: ['answer','answers','answered'] },
  desear: { es: 'buena suerte', en: 'good luck', enV: ['wish','wishes','wished'] },
  mandar: { es: 'un paquete', en: 'a package', enV: ['send','sends','sent'] },
  prestar: { es: 'dinero', en: 'money', enV: ['lend','lends','lent'] },
  compartir: { es: 'el piso', en: 'the apartment', enV: ['share','shares','shared'] },
  discutir: { es: 'de política', en: 'about politics', enV: ['argue','argues','argued'] },
  sufrir: { es: 'por el calor', en: 'from the heat', enV: ['suffer','suffers','suffered'] },
  prometer: { es: 'volver pronto', en: 'to come back soon', enV: ['promise','promises','promised'] },
  practicar: { es: 'el piano', en: 'the piano', enV: ['practice','practices','practiced'] },
  entregar: { es: 'el trabajo', en: 'the assignment', enV: ['hand in','hands in','handed in'] },
  apagar: { es: 'la luz', en: 'the light', enV: ['turn off','turns off','turned off'] },
  encender: { es: 'la luz', en: 'the light', enV: ['turn on','turns on','turned on'] },
  organizar: { es: 'la fiesta', en: 'the party', enV: ['organize','organizes','organized'] },
  cruzar: { es: 'la calle', en: 'the street', enV: ['cross','crosses','crossed'] },
  abrazar: { es: 'a los abuelos', en: 'the grandparents', enV: ['hug','hugs','hugged'] },
  'soñar': { es: 'con el mar', en: 'about the sea', enV: ['dream','dreams','dreamed'] },
  volar: { es: 'a Madrid', en: 'to Madrid', enV: ['fly','flies','flew'] },
  defender: { es: 'la idea', en: 'the idea', enV: ['defend','defends','defended'] },
  vestir: { es: 'al bebé', en: 'the baby', enV: ['dress','dresses','dressed'] },
  competir: { es: 'en la carrera', en: 'in the race', enV: ['compete','competes','competed'] },
  medir: { es: 'la habitación', en: 'the room', enV: ['measure','measures','measured'] },
  despedir: { es: 'a los invitados', en: 'the guests', enV: ['see off','sees off','saw off'] },
  corregir: { es: 'los errores', en: 'the mistakes', enV: ['correct','corrects','corrected'] },
  incluir: { es: 'el postre', en: 'dessert', enV: ['include','includes','included'] },
  destruir: { es: 'las pruebas', en: 'the evidence', enV: ['destroy','destroys','destroyed'] },
  huir: { es: 'del ruido', en: 'from the noise', enV: ['flee','flees','fled'] },
  desaparecer: { es: 'sin decir nada', en: 'without a word', enV: ['disappear','disappears','disappeared'] },
  merecer: { es: 'un descanso', en: 'a break', enV: ['deserve','deserves','deserved'] },
  agradecer: { es: 'el regalo', en: 'the gift', enV: ['appreciate','appreciates','appreciated'] },
  traducir: { es: 'el texto', en: 'the text', enV: ['translate','translates','translated'] },
  reducir: { es: 'los gastos', en: 'expenses', enV: ['reduce','reduces','reduced'] },
  caber: { es: 'en el coche', en: 'in the car', enV: ['fit','fits','fit'] },
  valer: { es: 'la pena', en: 'it', enV: { pres: ['am worth', 'are worth', 'is worth', 'are worth', 'are worth', 'are worth'], past: ['was worth', 'were worth', 'was worth', 'were worth', 'were worth', 'were worth'], base: 'be worth' } },
  contener: { es: 'azúcar', en: 'sugar', enV: ['contain','contains','contained'] },
  detener: { es: 'el coche', en: 'the car', enV: ['stop','stops','stopped'] },
  confiar: { es: 'en el equipo', en: 'the team', enV: ['trust','trusts','trusted'] },
  actuar: { es: 'con calma', en: 'calmly', enV: ['act','acts','acted'] },
  bailar: { es: 'salsa', en: 'salsa', enV: ['dance','dances','danced'] },
  nadar: { es: 'en el mar', en: 'in the sea', enV: ['swim','swims','swam'] },
  llorar: { es: 'con esa película', en: 'at that movie', enV: ['cry','cries','cried'] },
  aprovechar: { es: 'el buen tiempo', en: 'the good weather', enV: ['make the most of','makes the most of','made the most of'] },
  advertir: { es: 'del peligro', en: 'of the danger', enV: ['warn','warns','warned'] },
  divertir: { es: 'a los niños', en: 'the kids', enV: ['amuse','amuses','amused'] },
  colgar: { es: 'el abrigo', en: 'the coat', enV: ['hang up','hangs up','hung up'] },
  negar: { es: 'la noticia', en: 'the news', enV: ['deny','denies','denied'] },
  alcanzar: { es: 'la meta', en: 'the goal', enV: ['reach','reaches','reached'] },
  oler: { es: 'a café', en: 'of coffee', enV: ['smell','smells','smelled'] },
  poseer: { es: 'una casa', en: 'a house', enV: ['own','owns','owned'] },
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

// ---------- sentence modes (Sentences, Contrast) ----------
//
// CUE_BANK: person-neutral time cues per tense for the gap sentences.
//   pos: where the cue goes. 'front' → "Ayer, nosotros ____ …"; 'back' → "Nosotros ____ … ayer.";
//        'either' → picked per question.
//   state: true on cues that read naturally with state verbs (STATE_VERBS: saber, vivir, ser…).
//        Habit cues like "cada verano" or "a veces" make "conocía a mucha gente" sound odd.
//   also: other tenses that also read naturally with this cue ("mañana voy" / "mañana iré").
//        The Sentences prompt hides the tense, so it avoids these when one of the also-tenses is in
//        the drill, and when it can't, accepts the other tense's form as right.
//   contrast: true on pretérito / imperfecto cues that clearly point to one of the pair,
//        so Contrast mode only uses those.
export const CUE_BANK = {
  presente: [
    { es: 'ahora', en: 'now', pos: 'front', state: true },
    { es: 'hoy en día', en: 'these days', pos: 'either', state: true },
    { es: 'actualmente', en: 'currently', pos: 'front', state: true },
    { es: 'todos los días', en: 'every day', pos: 'either', also: ['imperfecto'] },
    { es: 'normalmente', en: 'usually', pos: 'front', state: true, also: ['imperfecto'] },
    { es: 'a veces', en: 'sometimes', pos: 'either', also: ['imperfecto'] },
    { es: 'los fines de semana', en: 'on weekends', pos: 'either', also: ['imperfecto'] },
  ],
  preterito: [
    { es: 'ayer', en: 'yesterday', pos: 'either', contrast: true, state: true },
    { es: 'anoche', en: 'last night', pos: 'either', contrast: true, state: true },
    { es: 'la semana pasada', en: 'last week', pos: 'either', contrast: true, state: true },
    { es: 'el año pasado', en: 'last year', pos: 'either', contrast: true, state: true },
    { es: 'el lunes pasado', en: 'last Monday', pos: 'either', contrast: true, state: true },
    { es: 'una vez', en: 'once', pos: 'front', contrast: true, state: true },
    { es: 'en 2019', en: 'in 2019', pos: 'either', contrast: true, state: true },
  ],
  imperfecto: [
    { es: 'en aquella época', en: 'back then', pos: 'either', contrast: true, state: true },
    { es: 'antes', en: 'in the past', pos: 'front', contrast: true, state: true },
    { es: 'por aquel entonces', en: 'at that time', pos: 'either', contrast: true, state: true },
    { es: 'en los años noventa', en: 'in the nineties', pos: 'either', contrast: true, state: true },
    { es: 'cada verano', en: 'every summer', pos: 'either', contrast: true, also: ['presente'] },
    { es: 'a menudo', en: 'often', pos: 'back', contrast: true, also: ['presente'] },
    { es: 'de vez en cuando', en: 'every now and then', pos: 'either', contrast: true, also: ['presente'] },
  ],
  futuro: [
    { es: 'algún día', en: 'someday', pos: 'front', state: true },
    { es: 'dentro de unos años', en: 'in a few years', pos: 'either', state: true },
    { es: 'mañana', en: 'tomorrow', pos: 'either', state: true, also: ['presente'] },
    { es: 'la próxima semana', en: 'next week', pos: 'either', state: true, also: ['presente'] },
    { es: 'el año que viene', en: 'next year', pos: 'either', state: true, also: ['presente'] },
    { es: 'pronto', en: 'soon', pos: 'back', state: true, also: ['presente'] },
  ],
  condicional: [
    { es: 'si fuera posible', en: 'if it were possible', pos: 'either', state: true },
    { es: 'con más tiempo', en: 'with more time', pos: 'either' },
    { es: 'en otra situación', en: 'in another situation', pos: 'front', state: true },
    { es: 'en ese caso', en: 'in that case', pos: 'front', state: true, also: ['futuro'] },
  ],
};

// Verbs describing a state rather than an action: sentences only use state-friendly cues.
export const STATE_VERBS = [
  'ser', 'estar', 'tener', 'poder', 'saber', 'querer', 'deber', 'creer', 'conocer', 'vivir',
  'necesitar', 'preferir', 'parecer', 'existir', 'gustar', 'costar', 'valer', 'contener',
  'poseer', 'merecer', 'caber', 'pensar',
];

// Verb (or verb|tense) combos the sentence template turns into nonsense.
// Filled from a read-through of scripts/dump-sentences.mjs output.
export const SENTENCE_SKIP = {
  // Verbs whose natural subject is a thing or an event, not a person ("tú cuestas", "nosotros ocurrimos"),
  // plus haber (auxiliary). Still drilled in the other modes.
  gap: ['haber', 'ocurrir', 'existir', 'nacer', 'costar', 'doler', 'contener', 'valer'],
  contrast: ['haber', 'ocurrir', 'existir', 'nacer', 'costar', 'doler', 'contener', 'valer'],
};
