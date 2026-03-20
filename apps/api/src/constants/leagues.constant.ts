export const FEATURED_LEAGUES = [
  39, // Premier League  => O
  140, // La Lig => O
  61, // Ligue 1 => O
  78, // Bundesliga => X 선수 가져옴,
  135, // Serie A => O
  2, // UEFA Champions League => O
  3, // UEFA Europa League => O
  848, // UEFA Conference League => X 선수만 가져옴
  203, // Süper Lig
  94, // Primeira Liga => X 선수만 가져옴
  88, // Eredivisie => X 선수만 가져옴
  307, // Saudi Pro League =>
  253, // MLS => X 선수만 가져옴   2026
  17, // AFC Champions League => X 경기가 없어
  32, // AFC Asian Qualifiers => X 경기가 없어
  1, // World Cup => O
  4, // Euro Championship => O
  9, // Copa America => O
  31, // AFC Asian Cup => O 경기가 없어
  5, // UEFA Nations League => O
  369, // Uzbekistan Super League  => O 2026
  802, // Uzbekistan Cup => O
];

export const FEATURED_LEAGUES_Object = [
  { id: 39, name: 'Premier League', totalRounds: 38 },
  { id: 140, name: 'La Liga', totalRounds: 38 },
  { id: 61, name: 'Ligue 1', totalRounds: 34 },
  { id: 78, name: 'Bundesliga', totalRounds: 34 },
  { id: 135, name: 'Serie A', totalRounds: 38 },
  { id: 369, name: 'Uzbekistan Super League', totalRounds: 26 },
  { id: 802, name: 'Uzbekistan Cup', totalRounds: null },
  { id: 2, name: 'UEFA Champions League', totalRounds: 8 },
  { id: 3, name: 'UEFA Europa League', totalRounds: 8 },
  { id: 848, name: 'UEFA Conference League', totalRounds: 8 },
  { id: 203, name: 'Süper Lig', totalRounds: 38 },
  { id: 94, name: 'Primeira Liga', totalRounds: 34 },
  { id: 88, name: 'Eredivisie', totalRounds: 34 },
  { id: 307, name: 'Saudi Pro League', totalRounds: 30 },
  { id: 253, name: 'MLS', totalRounds: 34 },
  { id: 17, name: 'AFC Champions League', totalRounds: null },
  { id: 32, name: 'AFC Asian Qualifiers', totalRounds: null },
  { id: 1, name: 'World Cup', totalRounds: null },
  { id: 4, name: 'Euro Championship', totalRounds: null },
  { id: 9, name: 'Copa America', totalRounds: null },
  { id: 31, name: 'AFC Asian Cup', totalRounds: null },
  { id: 5, name: 'UEFA Nations League', totalRounds: null },
];

interface LeagueConfig {
  id: number;
  name: string;
  searchQuery: string;
}

export const LEAGUES_NEWS: LeagueConfig[] = [
  { id: 39, name: 'Premier League', searchQuery: 'Premier League' },
  { id: 140, name: 'La Liga', searchQuery: 'La Liga' },
  { id: 61, name: 'Ligue 1', searchQuery: 'Ligue 1' },
  { id: 78, name: 'Bundesliga', searchQuery: 'Bundesliga' },
  { id: 135, name: 'Serie A', searchQuery: 'Serie A' },
  { id: 347, name: 'Saudi Pro League', searchQuery: 'Saudi Pro League' },
  { id: 2, name: 'Champions League', searchQuery: 'Champions League' },
  { id: 3, name: 'Europa League', searchQuery: 'Europa League' },
  { id: 203, name: 'Super Lig', searchQuery: 'Super Lig Turkey' },
  { id: 1, name: 'World Cup', searchQuery: 'FIFA World Cup' },
  { id: 4, name: 'Euro Championship', searchQuery: 'Euro Championship' },
  { id: 9, name: 'Copa America', searchQuery: 'Copa America' },
  { id: 31, name: 'Africa Cup', searchQuery: 'Africa Cup of Nations' },
];

export const SEASON = 2025;
