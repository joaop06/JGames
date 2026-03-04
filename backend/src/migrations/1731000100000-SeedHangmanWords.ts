import type { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

type SeedWord = {
  text: string;
  category: string;
  difficulty: number;
};

const WORDS: SeedWord[] = [
  // Animais - fácil
  { text: 'gato', category: 'animals', difficulty: 1 },
  { text: 'cachorro', category: 'animals', difficulty: 1 },
  { text: 'peixe', category: 'animals', difficulty: 1 },
  { text: 'pato', category: 'animals', difficulty: 1 },
  { text: 'sapo', category: 'animals', difficulty: 1 },
  { text: 'cobra', category: 'animals', difficulty: 1 },
  { text: 'vaca', category: 'animals', difficulty: 1 },
  { text: 'bode', category: 'animals', difficulty: 1 },
  { text: 'arara', category: 'animals', difficulty: 1 },
  { text: 'foca', category: 'animals', difficulty: 1 },
  // Animais - médio
  { text: 'tartaruga', category: 'animals', difficulty: 2 },
  { text: 'elefante', category: 'animals', difficulty: 2 },
  { text: 'girafa', category: 'animals', difficulty: 2 },
  { text: 'leopardo', category: 'animals', difficulty: 2 },
  { text: 'gorila', category: 'animals', difficulty: 2 },
  { text: 'jacare', category: 'animals', difficulty: 2 },
  { text: 'camelo', category: 'animals', difficulty: 2 },
  { text: 'coruja', category: 'animals', difficulty: 2 },
  { text: 'pinguim', category: 'animals', difficulty: 2 },
  { text: 'lagosta', category: 'animals', difficulty: 2 },
  // Animais - difícil
  { text: 'ornitorrinco', category: 'animals', difficulty: 3 },
  { text: 'chinchila', category: 'animals', difficulty: 3 },
  { text: 'aguia', category: 'animals', difficulty: 3 },
  { text: 'hipopotamo', category: 'animals', difficulty: 3 },
  { text: 'camaleao', category: 'animals', difficulty: 3 },
  { text: 'barracuda', category: 'animals', difficulty: 3 },
  { text: 'rinoceronte', category: 'animals', difficulty: 3 },
  { text: 'salamandra', category: 'animals', difficulty: 3 },
  { text: 'tucano', category: 'animals', difficulty: 3 },
  { text: 'marimbondo', category: 'animals', difficulty: 3 },

  // Países - fácil
  { text: 'brasil', category: 'countries', difficulty: 1 },
  { text: 'chile', category: 'countries', difficulty: 1 },
  { text: 'peru', category: 'countries', difficulty: 1 },
  { text: 'canada', category: 'countries', difficulty: 1 },
  { text: 'mexico', category: 'countries', difficulty: 1 },
  { text: 'japao', category: 'countries', difficulty: 1 },
  { text: 'china', category: 'countries', difficulty: 1 },
  { text: 'italia', category: 'countries', difficulty: 1 },
  { text: 'espanha', category: 'countries', difficulty: 1 },
  { text: 'franca', category: 'countries', difficulty: 1 },
  // Países - médio
  { text: 'argentina', category: 'countries', difficulty: 2 },
  { text: 'portugal', category: 'countries', difficulty: 2 },
  { text: 'alemanha', category: 'countries', difficulty: 2 },
  { text: 'inglaterra', category: 'countries', difficulty: 2 },
  { text: 'australia', category: 'countries', difficulty: 2 },
  { text: 'noruega', category: 'countries', difficulty: 2 },
  { text: 'suecia', category: 'countries', difficulty: 2 },
  { text: 'finlandia', category: 'countries', difficulty: 2 },
  { text: 'polonia', category: 'countries', difficulty: 2 },
  { text: 'islandia', category: 'countries', difficulty: 2 },
  // Países - difícil
  { text: 'quirguistao', category: 'countries', difficulty: 3 },
  { text: 'uzbequistao', category: 'countries', difficulty: 3 },
  { text: 'cazaquistao', category: 'countries', difficulty: 3 },
  { text: 'liechtenstein', category: 'countries', difficulty: 3 },
  { text: 'azerbaijao', category: 'countries', difficulty: 3 },
  { text: 'turcomenistao', category: 'countries', difficulty: 3 },
  { text: 'mozambigue', category: 'countries', difficulty: 3 },
  { text: 'zimbabue', category: 'countries', difficulty: 3 },
  { text: 'botsuana', category: 'countries', difficulty: 3 },
  { text: 'luxemburgo', category: 'countries', difficulty: 3 },

  // Filmes - fácil
  { text: 'titanic', category: 'movies', difficulty: 1 },
  { text: 'avatar', category: 'movies', difficulty: 1 },
  { text: 'rocky', category: 'movies', difficulty: 1 },
  { text: 'alien', category: 'movies', difficulty: 1 },
  { text: 'matrix', category: 'movies', difficulty: 1 },
  { text: 'shrek', category: 'movies', difficulty: 1 },
  { text: 'cinderela', category: 'movies', difficulty: 1 },
  { text: 'aladdin', category: 'movies', difficulty: 1 },
  { text: 'frozen', category: 'movies', difficulty: 1 },
  { text: 'carrie', category: 'movies', difficulty: 1 },
  // Filmes - médio
  { text: 'interestelar', category: 'movies', difficulty: 2 },
  { text: 'inception', category: 'movies', difficulty: 2 },
  { text: 'gladiador', category: 'movies', difficulty: 2 },
  { text: 'parasita', category: 'movies', difficulty: 2 },
  { text: 'scarface', category: 'movies', difficulty: 2 },
  { text: 'amadeus', category: 'movies', difficulty: 2 },
  { text: 'bravura', category: 'movies', difficulty: 2 },
  { text: 'coringa', category: 'movies', difficulty: 2 },
  { text: 'jumanji', category: 'movies', difficulty: 2 },
  { text: 'godzilla', category: 'movies', difficulty: 2 },
  // Filmes - difícil
  { text: 'amelie', category: 'movies', difficulty: 3 },
  { text: 'donnie', category: 'movies', difficulty: 3 },
  { text: 'bastardos', category: 'movies', difficulty: 3 },
  { text: 'memento', category: 'movies', difficulty: 3 },
  { text: 'whiplash', category: 'movies', difficulty: 3 },
  { text: 'chinatown', category: 'movies', difficulty: 3 },
  { text: 'oldboy', category: 'movies', difficulty: 3 },
  { text: 'seven', category: 'movies', difficulty: 3 },
  { text: 'vertigo', category: 'movies', difficulty: 3 },
  { text: 'psycho', category: 'movies', difficulty: 3 },

  // Tecnologia - fácil
  { text: 'mouse', category: 'technology', difficulty: 1 },
  { text: 'teclado', category: 'technology', difficulty: 1 },
  { text: 'monitor', category: 'technology', difficulty: 1 },
  { text: 'codigo', category: 'technology', difficulty: 1 },
  { text: 'github', category: 'technology', difficulty: 1 },
  { text: 'nuvem', category: 'technology', difficulty: 1 },
  { text: 'wifi', category: 'technology', difficulty: 1 },
  { text: 'server', category: 'technology', difficulty: 1 },
  { text: 'router', category: 'technology', difficulty: 1 },
  { text: 'docker', category: 'technology', difficulty: 1 },
  // Tecnologia - médio
  { text: 'algoritmo', category: 'technology', difficulty: 2 },
  { text: 'backend', category: 'technology', difficulty: 2 },
  { text: 'frontend', category: 'technology', difficulty: 2 },
  { text: 'framework', category: 'technology', difficulty: 2 },
  { text: 'compilador', category: 'technology', difficulty: 2 },
  { text: 'terminal', category: 'technology', difficulty: 2 },
  { text: 'processador', category: 'technology', difficulty: 2 },
  { text: 'memoria', category: 'technology', difficulty: 2 },
  { text: 'bancodeDados', category: 'technology', difficulty: 2 },
  { text: 'criptografia', category: 'technology', difficulty: 2 },
  // Tecnologia - difícil
  { text: 'kubernetes', category: 'technology', difficulty: 3 },
  { text: 'microservicos', category: 'technology', difficulty: 3 },
  { text: 'observabilidade', category: 'technology', difficulty: 3 },
  { text: 'loadbalancer', category: 'technology', difficulty: 3 },
  { text: 'virtualizacao', category: 'technology', difficulty: 3 },
  { text: 'concorrencia', category: 'technology', difficulty: 3 },
  { text: 'orquestracao', category: 'technology', difficulty: 3 },
  { text: 'escalabilidade', category: 'technology', difficulty: 3 },
  { text: 'otimizacao', category: 'technology', difficulty: 3 },
  { text: 'serializacao', category: 'technology', difficulty: 3 },

  // Esportes - fácil
  { text: 'futebol', category: 'sports', difficulty: 1 },
  { text: 'tenis', category: 'sports', difficulty: 1 },
  { text: 'basquete', category: 'sports', difficulty: 1 },
  { text: 'volei', category: 'sports', difficulty: 1 },
  { text: 'golfe', category: 'sports', difficulty: 1 },
  { text: 'xadrez', category: 'sports', difficulty: 1 },
  { text: 'corrida', category: 'sports', difficulty: 1 },
  { text: 'nado', category: 'sports', difficulty: 1 },
  { text: 'rugby', category: 'sports', difficulty: 1 },
  { text: 'boxe', category: 'sports', difficulty: 1 },
  // Esportes - médio
  { text: 'handebol', category: 'sports', difficulty: 2 },
  { text: 'ciclismo', category: 'sports', difficulty: 2 },
  { text: 'maratona', category: 'sports', difficulty: 2 },
  { text: 'esgrima', category: 'sports', difficulty: 2 },
  { text: 'badminton', category: 'sports', difficulty: 2 },
  { text: 'escalada', category: 'sports', difficulty: 2 },
  { text: 'surfe', category: 'sports', difficulty: 2 },
  { text: 'karate', category: 'sports', difficulty: 2 },
  { text: 'judoca', category: 'sports', difficulty: 2 },
  { text: 'triatlo', category: 'sports', difficulty: 2 },
  // Esportes - difícil
  { text: 'levantamento', category: 'sports', difficulty: 3 },
  { text: 'snowboard', category: 'sports', difficulty: 3 },
  { text: 'parapente', category: 'sports', difficulty: 3 },
  { text: 'patinacao', category: 'sports', difficulty: 3 },
  { text: 'corridahurdles', category: 'sports', difficulty: 3 },
  { text: 'biatlo', category: 'sports', difficulty: 3 },
  { text: 'esqui', category: 'sports', difficulty: 3 },
  { text: 'taekwondo', category: 'sports', difficulty: 3 },
  { text: 'lacrosse', category: 'sports', difficulty: 3 },
  { text: 'esportesradicais', category: 'sports', difficulty: 3 },

  // Misc extra palavras para chegar em >= 200
  { text: 'computador', category: 'technology', difficulty: 1 },
  { text: 'controle', category: 'technology', difficulty: 1 },
  { text: 'console', category: 'technology', difficulty: 1 },
  { text: 'joystick', category: 'technology', difficulty: 1 },
  { text: 'processo', category: 'technology', difficulty: 2 },
  { text: 'sistema', category: 'technology', difficulty: 1 },
  { text: 'arquivo', category: 'technology', difficulty: 1 },
  { text: 'janela', category: 'technology', difficulty: 1 },
  { text: 'terminal', category: 'technology', difficulty: 1 },
  { text: 'compilacao', category: 'technology', difficulty: 2 },
  { text: 'debug', category: 'technology', difficulty: 1 },
  { text: 'interface', category: 'technology', difficulty: 2 },
  { text: 'latencia', category: 'technology', difficulty: 3 },
  { text: 'banda', category: 'technology', difficulty: 1 },
  { text: 'pacote', category: 'technology', difficulty: 1 },
  { text: 'protocolo', category: 'technology', difficulty: 2 },
  { text: 'janelao', category: 'technology', difficulty: 2 },
  { text: 'pipeline', category: 'technology', difficulty: 2 },
  { text: 'buffer', category: 'technology', difficulty: 2 },
  { text: 'evento', category: 'technology', difficulty: 1 },
  { text: 'android', category: 'technology', difficulty: 1 },
  { text: 'iphone', category: 'technology', difficulty: 1 },
  { text: 'notebook', category: 'technology', difficulty: 1 },
  { text: 'tablet', category: 'technology', difficulty: 1 },
  { text: 'impressora', category: 'technology', difficulty: 1 },
  { text: 'scanner', category: 'technology', difficulty: 2 },
  { text: 'headset', category: 'technology', difficulty: 1 },
  { text: 'firewall', category: 'technology', difficulty: 3 },
  { text: 'antivirus', category: 'technology', difficulty: 2 },
  { text: 'cache', category: 'technology', difficulty: 2 },
  { text: 'download', category: 'technology', difficulty: 1 },
  { text: 'upload', category: 'technology', difficulty: 1 },
  { text: 'servidor', category: 'technology', difficulty: 1 },
  { text: 'cliente', category: 'technology', difficulty: 1 },
  { text: 'janelaFlutuante', category: 'technology', difficulty: 3 },
  { text: 'motorGrafico', category: 'technology', difficulty: 3 },
  { text: 'multiplayer', category: 'technology', difficulty: 2 },
  { text: 'leaderboard', category: 'technology', difficulty: 2 },
  { text: 'achievement', category: 'technology', difficulty: 2 }
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export class SeedHangmanWords1731000100000 implements MigrationInterface {
  name = 'SeedHangmanWords1731000100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const w of WORDS) {
      const id = randomUUID();
      const textOriginal = w.text;
      const textNormalized = normalize(w.text);
      await queryRunner.query(
        `
        INSERT INTO "hangman_word" ("id", "text_original", "text_normalized", "category", "difficulty", "language", "active")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [id, textOriginal, textNormalized, w.category, w.difficulty, 'pt-BR', true]
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "hangman_word"`);
  }
}

