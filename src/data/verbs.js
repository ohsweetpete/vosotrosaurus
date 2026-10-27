// Verb data for the conjugation engine (src/lib/conjugate.js).
//
// Each verb:
//   inf    infinitive
//   rank   approximate position in a corpus frequency list (1 = most common)
//   en     English gloss
//   group  'ar' | 'er' | 'ir'
//   tags   any of: 'stem' | 'spell' | 'irregular' | 'reflexive'  (empty = fully regular)
//   stem   presente stem change: 'e>ie' | 'o>ue' | 'e>i' | 'u>ue'   (applied to yo, tú, él, ellos)
//   yo     presente 1st-person override (tengo, hago, …)
//   pres   full presente override, 6 forms
//   pret     full pretérito override, 6 forms (suppletive: fui, di, vi, oí…)
//   pretStem strong pretérito stem (tuv, hic, dij…) — engine adds -e -iste -o -imos -isteis -ieron (-eron after j)
//   pretFix  per-person exceptions on top of pretStem, e.g. { 2: 'hizo' }
//   whole    tenses whose forms are suppletive — highlight the whole word
//   imp    full imperfecto override, 6 forms
//   fut    irregular futuro/condicional stem (tendr, har, …)
//
// Person order everywhere: yo, tú, él/ella/usted, nosotros, vosotros, ellos/ustedes.
// The engine handles: regular endings, stem changes (incl. 3rd-person pretérito
// changes for -ir verbs), -car/-gar/-zar spelling in the pretérito yo form.
// Anything else is an explicit override here so it is easy to audit.

export const PERSONS = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ustedes'];

export const TENSES = [
  { id: 'presente', label: 'Presente', mood: 'Indicativo' },
  { id: 'preterito', label: 'Pretérito', mood: 'Indicativo' },
  { id: 'imperfecto', label: 'Imperfecto', mood: 'Indicativo' },
  { id: 'futuro', label: 'Futuro', mood: 'Indicativo' },
  { id: 'condicional', label: 'Condicional', mood: 'Indicativo' },
];

export const GROUPS = [
  { id: 'regular-ar', label: 'Regular -ar' },
  { id: 'regular-er', label: 'Regular -er' },
  { id: 'regular-ir', label: 'Regular -ir' },
  { id: 'stem', label: 'Stem-changers' },
  { id: 'spell', label: 'Spelling-changers' },
  { id: 'irregular', label: 'Irregulars' },
];

const RAW_VERBS = [
  // ---- regular -ar ----
  { inf: 'hablar', rank: 19, en: 'to speak', group: 'ar', tags: [] },
  { inf: 'trabajar', rank: 39, en: 'to work', group: 'ar', tags: [] },
  { inf: 'estudiar', rank: 57, en: 'to study', group: 'ar', tags: [] },
  { inf: 'comprar', rank: 71, en: 'to buy', group: 'ar', tags: [] },
  { inf: 'necesitar', rank: 50, en: 'to need', group: 'ar', tags: [] },
  { inf: 'pasar', rank: 14, en: 'to pass, to spend (time)', group: 'ar', tags: [] },
  { inf: 'dejar', rank: 21, en: 'to leave, to let', group: 'ar', tags: [] },
  { inf: 'llamar', rank: 24, en: 'to call', group: 'ar', tags: [] },
  { inf: 'llevar', rank: 20, en: 'to carry, to wear', group: 'ar', tags: [] },
  { inf: 'tomar', rank: 29, en: 'to take, to drink', group: 'ar', tags: [] },
  { inf: 'mirar', rank: 33, en: 'to look at', group: 'ar', tags: [] },
  { inf: 'esperar', rank: 36, en: 'to wait, to hope', group: 'ar', tags: [] },
  { inf: 'entrar', rank: 38, en: 'to enter', group: 'ar', tags: [] },
  { inf: 'terminar', rank: 46, en: 'to finish', group: 'ar', tags: [] },
  { inf: 'quedar', rank: 17, en: 'to stay, to remain', group: 'ar', tags: [] },

  // ---- regular -er ----
  { inf: 'comer', rank: 62, en: 'to eat', group: 'er', tags: [] },
  { inf: 'beber', rank: 69, en: 'to drink', group: 'er', tags: [] },
  { inf: 'aprender', rank: 68, en: 'to learn', group: 'er', tags: [] },
  { inf: 'vender', rank: 70, en: 'to sell', group: 'er', tags: [] },
  { inf: 'deber', rank: 15, en: 'to owe, must', group: 'er', tags: [] },
  { inf: 'correr', rank: 58, en: 'to run', group: 'er', tags: [] },

  // ---- regular -ir ----
  { inf: 'vivir', rank: 31, en: 'to live', group: 'ir', tags: [] },
  { inf: 'escribir', rank: 40, en: 'to write', group: 'ir', tags: [] },
  { inf: 'abrir', rank: 52, en: 'to open', group: 'ir', tags: [] },
  { inf: 'recibir', rank: 44, en: 'to receive', group: 'ir', tags: [] },
  { inf: 'subir', rank: 67, en: 'to go up, to climb', group: 'ir', tags: [] },

  // ---- spelling-changers (pretérito yo: -car → -qué, -gar → -gué, -zar → -cé) ----
  { inf: 'buscar', rank: 37, en: 'to look for', group: 'ar', tags: ['spell'] },
  { inf: 'tocar', rank: 56, en: 'to touch, to play (instrument)', group: 'ar', tags: ['spell'] },
  { inf: 'sacar', rank: 49, en: 'to take out', group: 'ar', tags: ['spell'] },
  { inf: 'llegar', rank: 13, en: 'to arrive', group: 'ar', tags: ['spell'] },
  { inf: 'pagar', rank: 59, en: 'to pay', group: 'ar', tags: ['spell'] },
  { inf: 'jugar', rank: 60, en: 'to play (game, sport)', group: 'ar', tags: ['stem', 'spell'], stem: 'u>ue' },
  { inf: 'empezar', rank: 35, en: 'to begin', group: 'ar', tags: ['stem', 'spell'], stem: 'e>ie' },
  { inf: 'comenzar', rank: 47, en: 'to begin, to start', group: 'ar', tags: ['stem', 'spell'], stem: 'e>ie' },

  // ---- stem-changers ----
  { inf: 'pensar', rank: 26, en: 'to think', group: 'ar', tags: ['stem'], stem: 'e>ie' },
  { inf: 'cerrar', rank: 66, en: 'to close', group: 'ar', tags: ['stem'], stem: 'e>ie' },
  { inf: 'entender', rank: 42, en: 'to understand', group: 'er', tags: ['stem'], stem: 'e>ie' },
  { inf: 'perder', rank: 41, en: 'to lose', group: 'er', tags: ['stem'], stem: 'e>ie' },
  { inf: 'volver', rank: 28, en: 'to return', group: 'er', tags: ['stem'], stem: 'o>ue' },
  { inf: 'encontrar', rank: 23, en: 'to find', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'contar', rank: 34, en: 'to count, to tell', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'recordar', rank: 45, en: 'to remember', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'dormir', rank: 63, en: 'to sleep', group: 'ir', tags: ['stem'], stem: 'o>ue' },
  { inf: 'morir', rank: 55, en: 'to die', group: 'ir', tags: ['stem'], stem: 'o>ue' },
  { inf: 'sentir', rank: 32, en: 'to feel', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'preferir', rank: 64, en: 'to prefer', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'pedir', rank: 43, en: 'to ask for, to order', group: 'ir', tags: ['stem'], stem: 'e>i' },
  { inf: 'servir', rank: 48, en: 'to serve', group: 'ir', tags: ['stem'], stem: 'e>i' },
  { inf: 'repetir', rank: 61, en: 'to repeat', group: 'ir', tags: ['stem'], stem: 'e>i' },
  { inf: 'seguir', rank: 22, en: 'to follow, to continue', group: 'ir', tags: ['stem', 'irregular'], stem: 'e>i', yo: 'sigo' },

  // ---- irregulars ----
  { inf: 'ser', rank: 1, en: 'to be (essence)', group: 'er', tags: ['irregular'], whole: ['presente', 'preterito', 'imperfecto'],
    pres: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
    pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imp: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'] },
  { inf: 'estar', rank: 2, en: 'to be (state, location)', group: 'ar', tags: ['irregular'],
    pres: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
    pretStem: 'estuv' },
  { inf: 'ir', rank: 8, en: 'to go', group: 'ir', tags: ['irregular'], whole: ['presente', 'preterito', 'imperfecto'],
    pres: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
    pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imp: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'] },
  { inf: 'haber', rank: 3, en: 'to have (auxiliary)', group: 'er', tags: ['irregular'], whole: ['presente'],
    pres: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
    pretStem: 'hub', fut: 'habr' },
  { inf: 'tener', rank: 4, en: 'to have', group: 'er', tags: ['irregular', 'stem'], stem: 'e>ie', yo: 'tengo',
    pretStem: 'tuv', fut: 'tendr' },
  { inf: 'hacer', rank: 5, en: 'to do, to make', group: 'er', tags: ['irregular'], yo: 'hago',
    pretStem: 'hic', pretFix: { 2: 'hizo' }, fut: 'har' },
  { inf: 'poder', rank: 6, en: 'to be able to', group: 'er', tags: ['irregular', 'stem'], stem: 'o>ue',
    pretStem: 'pud', fut: 'podr' },
  { inf: 'poner', rank: 16, en: 'to put', group: 'er', tags: ['irregular'], yo: 'pongo',
    pretStem: 'pus', fut: 'pondr' },
  { inf: 'salir', rank: 27, en: 'to go out, to leave', group: 'ir', tags: ['irregular'], yo: 'salgo', fut: 'saldr' },
  { inf: 'venir', rank: 25, en: 'to come', group: 'ir', tags: ['irregular', 'stem'], stem: 'e>ie', yo: 'vengo',
    pretStem: 'vin', fut: 'vendr' },
  { inf: 'decir', rank: 7, en: 'to say, to tell', group: 'ir', tags: ['irregular', 'stem'], stem: 'e>i', yo: 'digo',
    pretStem: 'dij', fut: 'dir' },
  { inf: 'querer', rank: 12, en: 'to want, to love', group: 'er', tags: ['irregular', 'stem'], stem: 'e>ie',
    pretStem: 'quis', fut: 'querr' },
  { inf: 'saber', rank: 11, en: 'to know (facts)', group: 'er', tags: ['irregular'], yo: 'sé',
    pretStem: 'sup', fut: 'sabr' },
  { inf: 'conocer', rank: 30, en: 'to know (people, places)', group: 'er', tags: ['irregular'], yo: 'conozco' },
  { inf: 'conducir', rank: 65, en: 'to drive', group: 'ir', tags: ['irregular'], yo: 'conduzco',
    pretStem: 'conduj' },
  { inf: 'traer', rank: 54, en: 'to bring', group: 'er', tags: ['irregular'], yo: 'traigo',
    pretStem: 'traj' },
  { inf: 'dar', rank: 10, en: 'to give', group: 'ar', tags: ['irregular'],
    pres: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
    pret: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'] },
  { inf: 'ver', rank: 9, en: 'to see', group: 'er', tags: ['irregular'],
    pres: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
    pret: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
    imp: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'] },
  { inf: 'oír', rank: 53, en: 'to hear', group: 'ir', tags: ['irregular'],
    pres: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'],
    pret: ['oí', 'oíste', 'oyó', 'oímos', 'oísteis', 'oyeron'] },
  { inf: 'leer', rank: 51, en: 'to read', group: 'er', tags: ['irregular'],
    pret: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'] },
  { inf: 'creer', rank: 18, en: 'to believe', group: 'er', tags: ['irregular'],
    pret: ['creí', 'creíste', 'creyó', 'creímos', 'creísteis', 'creyeron'] },

  // ---- ranks 72-200 ----
  { inf: 'parecer', rank: 72, en: 'to seem', group: 'er', tags: ['irregular'], yo: 'parezco' },
  { inf: 'gustar', rank: 73, en: 'to please, to like', group: 'ar', tags: [] },
  { inf: 'existir', rank: 74, en: 'to exist', group: 'ir', tags: [] },
  { inf: 'considerar', rank: 75, en: 'to consider', group: 'ar', tags: [] },
  { inf: 'ocurrir', rank: 76, en: 'to happen', group: 'ir', tags: [] },
  { inf: 'permitir', rank: 77, en: 'to allow', group: 'ir', tags: [] },
  { inf: 'ganar', rank: 78, en: 'to win, to earn', group: 'ar', tags: [] },
  { inf: 'explicar', rank: 79, en: 'to explain', group: 'ar', tags: ['spell'] },
  { inf: 'preguntar', rank: 80, en: 'to ask', group: 'ar', tags: [] },
  { inf: 'tratar', rank: 81, en: 'to try, to treat', group: 'ar', tags: [] },
  { inf: 'cambiar', rank: 82, en: 'to change', group: 'ar', tags: [] },
  { inf: 'crear', rank: 83, en: 'to create', group: 'ar', tags: [] },
  { inf: 'presentar', rank: 84, en: 'to present, to introduce', group: 'ar', tags: [] },
  { inf: 'cumplir', rank: 85, en: 'to fulfill, to turn (age)', group: 'ir', tags: [] },
  { inf: 'intentar', rank: 86, en: 'to try', group: 'ar', tags: [] },
  { inf: 'usar', rank: 87, en: 'to use', group: 'ar', tags: [] },
  { inf: 'decidir', rank: 88, en: 'to decide', group: 'ir', tags: [] },
  { inf: 'acabar', rank: 89, en: 'to finish, to end up', group: 'ar', tags: [] },
  { inf: 'caer', rank: 90, en: 'to fall', group: 'er', tags: ['irregular'], yo: 'caigo' },
  { inf: 'mantener', rank: 91, en: 'to keep, to maintain', group: 'er', tags: ['irregular', 'stem'], stem: 'e>ie', yo: 'mantengo', pretStem: 'mantuv', fut: 'mantendr' },
  { inf: 'producir', rank: 92, en: 'to produce', group: 'ir', tags: ['irregular'], yo: 'produzco', pretStem: 'produj' },
  { inf: 'aparecer', rank: 93, en: 'to appear', group: 'er', tags: ['irregular'], yo: 'aparezco' },
  { inf: 'conseguir', rank: 94, en: 'to get, to manage to', group: 'ir', tags: ['stem', 'irregular'], stem: 'e>i', yo: 'consigo' },
  { inf: 'ofrecer', rank: 95, en: 'to offer', group: 'er', tags: ['irregular'], yo: 'ofrezco' },
  { inf: 'suponer', rank: 96, en: 'to suppose', group: 'er', tags: ['irregular'], yo: 'supongo', pretStem: 'supus', fut: 'supondr' },
  { inf: 'reconocer', rank: 97, en: 'to recognize', group: 'er', tags: ['irregular'], yo: 'reconozco' },
  { inf: 'mostrar', rank: 98, en: 'to show', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'nacer', rank: 99, en: 'to be born', group: 'er', tags: ['irregular'], yo: 'nazco' },
  { inf: 'faltar', rank: 100, en: 'to be missing, to lack', group: 'ar', tags: [] },
  { inf: 'utilizar', rank: 101, en: 'to use', group: 'ar', tags: ['spell'] },
  { inf: 'aceptar', rank: 102, en: 'to accept', group: 'ar', tags: [] },
  { inf: 'responder', rank: 103, en: 'to answer', group: 'er', tags: [] },
  { inf: 'olvidar', rank: 104, en: 'to forget', group: 'ar', tags: [] },
  { inf: 'ayudar', rank: 105, en: 'to help', group: 'ar', tags: [] },
  { inf: 'escuchar', rank: 106, en: 'to listen', group: 'ar', tags: [] },
  { inf: 'enseñar', rank: 107, en: 'to teach, to show', group: 'ar', tags: [] },
  { inf: 'elegir', rank: 108, en: 'to choose', group: 'ir', tags: ['stem', 'irregular'], stem: 'e>i', yo: 'elijo' },
  { inf: 'construir', rank: 109, en: 'to build', group: 'ir', tags: ['irregular'] },
  { inf: 'convertir', rank: 110, en: 'to convert, to turn into', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'obtener', rank: 111, en: 'to obtain', group: 'er', tags: ['irregular', 'stem'], stem: 'e>ie', yo: 'obtengo', pretStem: 'obtuv', fut: 'obtendr' },
  { inf: 'proponer', rank: 112, en: 'to propose', group: 'er', tags: ['irregular'], yo: 'propongo', pretStem: 'propus', fut: 'propondr' },
  { inf: 'andar', rank: 113, en: 'to walk', group: 'ar', tags: ['irregular'], pretStem: 'anduv' },
  { inf: 'realizar', rank: 114, en: 'to carry out', group: 'ar', tags: ['spell'] },
  { inf: 'resolver', rank: 115, en: 'to solve', group: 'er', tags: ['stem'], stem: 'o>ue' },
  { inf: 'mover', rank: 116, en: 'to move', group: 'er', tags: ['stem'], stem: 'o>ue' },
  { inf: 'crecer', rank: 117, en: 'to grow', group: 'er', tags: ['irregular'], yo: 'crezco' },
  { inf: 'bajar', rank: 118, en: 'to go down, to lower', group: 'ar', tags: [] },
  { inf: 'preparar', rank: 119, en: 'to prepare', group: 'ar', tags: [] },
  { inf: 'cantar', rank: 120, en: 'to sing', group: 'ar', tags: [] },
  { inf: 'cocinar', rank: 121, en: 'to cook', group: 'ar', tags: [] },
  { inf: 'limpiar', rank: 122, en: 'to clean', group: 'ar', tags: [] },
  { inf: 'viajar', rank: 123, en: 'to travel', group: 'ar', tags: [] },
  { inf: 'caminar', rank: 124, en: 'to walk', group: 'ar', tags: [] },
  { inf: 'romper', rank: 125, en: 'to break', group: 'er', tags: [] },
  { inf: 'mentir', rank: 126, en: 'to lie', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'enviar', rank: 127, en: 'to send', group: 'ar', tags: ['stem'], stem: 'i>í' },
  { inf: 'continuar', rank: 128, en: 'to continue', group: 'ar', tags: ['stem'], stem: 'u>ú' },
  { inf: 'sugerir', rank: 129, en: 'to suggest', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'requerir', rank: 130, en: 'to require', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'regresar', rank: 131, en: 'to return, to go back', group: 'ar', tags: [] },
  { inf: 'costar', rank: 132, en: 'to cost', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'devolver', rank: 133, en: 'to return (something)', group: 'er', tags: ['stem'], stem: 'o>ue' },
  { inf: 'doler', rank: 134, en: 'to hurt', group: 'er', tags: ['stem'], stem: 'o>ue' },
  { inf: 'probar', rank: 135, en: 'to try, to taste', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'descansar', rank: 136, en: 'to rest', group: 'ar', tags: [] },
  { inf: 'desayunar', rank: 137, en: 'to have breakfast', group: 'ar', tags: [] },
  { inf: 'cenar', rank: 138, en: 'to have dinner', group: 'ar', tags: [] },
  { inf: 'almorzar', rank: 139, en: 'to have lunch', group: 'ar', tags: ['stem', 'spell'], stem: 'o>ue' },
  { inf: 'despertar', rank: 140, en: 'to wake (up)', group: 'ar', tags: ['stem'], stem: 'e>ie' },
  { inf: 'sentar', rank: 141, en: 'to seat, to sit', group: 'ar', tags: ['stem'], stem: 'e>ie' },
  { inf: 'acostar', rank: 142, en: 'to put to bed', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'reír', rank: 143, en: 'to laugh', group: 'ir', tags: ['stem', 'irregular'], stem: 'e>i', whole: ['presente', 'preterito'], pres: ['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen'], pret: ['reí', 'reíste', 'rio', 'reímos', 'reísteis', 'rieron'], fut: 'reir' },
  { inf: 'sonreír', rank: 144, en: 'to smile', group: 'ir', tags: ['stem', 'irregular'], stem: 'e>i', whole: ['presente', 'preterito'], pres: ['sonrío', 'sonríes', 'sonríe', 'sonreímos', 'sonreís', 'sonríen'], pret: ['sonreí', 'sonreíste', 'sonrió', 'sonreímos', 'sonreísteis', 'sonrieron'], fut: 'sonreir' },
  { inf: 'coger', rank: 145, en: 'to take, to catch', group: 'er', tags: ['irregular'], yo: 'cojo' },
  { inf: 'escoger', rank: 146, en: 'to choose', group: 'er', tags: ['irregular'], yo: 'escojo' },
  { inf: 'recoger', rank: 147, en: 'to pick up', group: 'er', tags: ['irregular'], yo: 'recojo' },
  { inf: 'proteger', rank: 148, en: 'to protect', group: 'er', tags: ['irregular'], yo: 'protejo' },
  { inf: 'dirigir', rank: 149, en: 'to direct, to manage', group: 'ir', tags: ['irregular'], yo: 'dirijo' },
  { inf: 'cuidar', rank: 150, en: 'to look after', group: 'ar', tags: [] },
  { inf: 'visitar', rank: 151, en: 'to visit', group: 'ar', tags: [] },
  { inf: 'invitar', rank: 152, en: 'to invite', group: 'ar', tags: [] },
  { inf: 'contestar', rank: 153, en: 'to answer', group: 'ar', tags: [] },
  { inf: 'desear', rank: 154, en: 'to wish', group: 'ar', tags: [] },
  { inf: 'mandar', rank: 155, en: 'to send, to order', group: 'ar', tags: [] },
  { inf: 'prestar', rank: 156, en: 'to lend', group: 'ar', tags: [] },
  { inf: 'compartir', rank: 157, en: 'to share', group: 'ir', tags: [] },
  { inf: 'discutir', rank: 158, en: 'to argue, to discuss', group: 'ir', tags: [] },
  { inf: 'sufrir', rank: 159, en: 'to suffer', group: 'ir', tags: [] },
  { inf: 'prometer', rank: 160, en: 'to promise', group: 'er', tags: [] },
  { inf: 'practicar', rank: 161, en: 'to practice', group: 'ar', tags: ['spell'] },
  { inf: 'entregar', rank: 162, en: 'to hand in, to deliver', group: 'ar', tags: ['spell'] },
  { inf: 'apagar', rank: 163, en: 'to turn off', group: 'ar', tags: ['spell'] },
  { inf: 'encender', rank: 164, en: 'to turn on, to light', group: 'er', tags: ['stem'], stem: 'e>ie' },
  { inf: 'organizar', rank: 165, en: 'to organize', group: 'ar', tags: ['spell'] },
  { inf: 'cruzar', rank: 166, en: 'to cross', group: 'ar', tags: ['spell'] },
  { inf: 'abrazar', rank: 167, en: 'to hug', group: 'ar', tags: ['spell'] },
  { inf: 'soñar', rank: 168, en: 'to dream', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'volar', rank: 169, en: 'to fly', group: 'ar', tags: ['stem'], stem: 'o>ue' },
  { inf: 'defender', rank: 170, en: 'to defend', group: 'er', tags: ['stem'], stem: 'e>ie' },
  { inf: 'vestir', rank: 171, en: 'to dress', group: 'ir', tags: ['stem'], stem: 'e>i' },
  { inf: 'competir', rank: 172, en: 'to compete', group: 'ir', tags: ['stem'], stem: 'e>i' },
  { inf: 'medir', rank: 173, en: 'to measure', group: 'ir', tags: ['stem'], stem: 'e>i' },
  { inf: 'despedir', rank: 174, en: 'to say goodbye, to fire', group: 'ir', tags: ['stem'], stem: 'e>i' },
  { inf: 'corregir', rank: 175, en: 'to correct', group: 'ir', tags: ['stem', 'irregular'], stem: 'e>i', yo: 'corrijo' },
  { inf: 'incluir', rank: 176, en: 'to include', group: 'ir', tags: ['irregular'] },
  { inf: 'destruir', rank: 177, en: 'to destroy', group: 'ir', tags: ['irregular'] },
  { inf: 'huir', rank: 178, en: 'to flee', group: 'ir', tags: ['irregular'], pres: ['huyo', 'huyes', 'huye', 'huimos', 'huis', 'huyen'], pret: ['hui', 'huiste', 'huyó', 'huimos', 'huisteis', 'huyeron'] },
  { inf: 'desaparecer', rank: 179, en: 'to disappear', group: 'er', tags: ['irregular'], yo: 'desaparezco' },
  { inf: 'merecer', rank: 180, en: 'to deserve', group: 'er', tags: ['irregular'], yo: 'merezco' },
  { inf: 'agradecer', rank: 181, en: 'to thank', group: 'er', tags: ['irregular'], yo: 'agradezco' },
  { inf: 'traducir', rank: 182, en: 'to translate', group: 'ir', tags: ['irregular'], yo: 'traduzco', pretStem: 'traduj' },
  { inf: 'reducir', rank: 183, en: 'to reduce', group: 'ir', tags: ['irregular'], yo: 'reduzco', pretStem: 'reduj' },
  { inf: 'caber', rank: 184, en: 'to fit', group: 'er', tags: ['irregular'], yo: 'quepo', pretStem: 'cup', fut: 'cabr' },
  { inf: 'valer', rank: 185, en: 'to be worth', group: 'er', tags: ['irregular'], yo: 'valgo', fut: 'valdr' },
  { inf: 'contener', rank: 186, en: 'to contain', group: 'er', tags: ['irregular', 'stem'], stem: 'e>ie', yo: 'contengo', pretStem: 'contuv', fut: 'contendr' },
  { inf: 'detener', rank: 187, en: 'to stop, to arrest', group: 'er', tags: ['irregular', 'stem'], stem: 'e>ie', yo: 'detengo', pretStem: 'detuv', fut: 'detendr' },
  { inf: 'confiar', rank: 188, en: 'to trust', group: 'ar', tags: ['stem'], stem: 'i>í' },
  { inf: 'actuar', rank: 189, en: 'to act', group: 'ar', tags: ['stem'], stem: 'u>ú' },
  { inf: 'bailar', rank: 190, en: 'to dance', group: 'ar', tags: [] },
  { inf: 'nadar', rank: 191, en: 'to swim', group: 'ar', tags: [] },
  { inf: 'llorar', rank: 192, en: 'to cry', group: 'ar', tags: [] },
  { inf: 'aprovechar', rank: 193, en: 'to make the most of', group: 'ar', tags: [] },
  { inf: 'advertir', rank: 194, en: 'to warn', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'divertir', rank: 195, en: 'to amuse', group: 'ir', tags: ['stem'], stem: 'e>ie' },
  { inf: 'colgar', rank: 196, en: 'to hang (up)', group: 'ar', tags: ['stem', 'spell'], stem: 'o>ue' },
  { inf: 'negar', rank: 197, en: 'to deny', group: 'ar', tags: ['stem', 'spell'], stem: 'e>ie' },
  { inf: 'alcanzar', rank: 198, en: 'to reach', group: 'ar', tags: ['spell'] },
  { inf: 'oler', rank: 199, en: 'to smell', group: 'er', tags: ['stem', 'irregular'], pres: ['huelo', 'hueles', 'huele', 'olemos', 'oléis', 'huelen'] },
  { inf: 'poseer', rank: 200, en: 'to possess', group: 'er', tags: ['irregular'] },
];

/** All verbs, most frequent first. */
export const VERBS = [...RAW_VERBS].sort((a, b) => a.rank - b.rank);
export const VERB_BY_INF = Object.fromEntries(VERBS.map((v) => [v.inf, v]));

/** Frequency tiers for the Setup screen. id = max rank, 0 = everything. */
export const TIERS = [
  { id: 25, label: 'Top 25' },
  { id: 50, label: 'Top 50' },
  { id: 100, label: 'Top 100' },
  { id: 0, label: `All ${VERBS.length}` },
];

/** Which filter groups a verb belongs to. */
export function verbGroups(v) {
  const g = [];
  if (v.tags.length === 0) g.push(`regular-${v.group}`);
  if (v.tags.includes('stem')) g.push('stem');
  if (v.tags.includes('spell')) g.push('spell');
  if (v.tags.includes('irregular')) g.push('irregular');
  return g;
}

/** Short human label for the verb's type, used as the on-screen hint. */
/** Short tags for chips: ['e→ie', 'Irregular'] / ['Spelling change'] / ['Regular']. */
export function verbTypeTags(v) {
  const parts = [];
  if (v.stem) parts.push(v.stem.replace('>', '→'));
  if (v.tags.includes('spell')) parts.push('Spelling change');
  if (v.tags.includes('irregular')) parts.push('Irregular');
  if (parts.length === 0) parts.push('Regular');
  return parts;
}

export function verbTypeLabel(v) {
  const parts = [];
  if (v.stem) parts.push(`Stem-changer ${v.stem.replace('>', '→')}`);
  if (v.tags.includes('spell')) parts.push('Spelling change');
  if (v.tags.includes('irregular')) parts.push('Irregular');
  if (parts.length === 0) parts.push(`Regular -${v.group}`);
  return parts.join(' · ');
}
