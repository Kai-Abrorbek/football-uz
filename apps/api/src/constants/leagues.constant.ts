export const FEATURED_LEAGUES = [
  39, // Premier League
  140, // La Liga
  61, // Ligue 1
  78, // Bundesliga
  135, // Serie A
  2, // Champions League
  3, // UEFA Europa League
  203, // Süper Lig (터키)
  1, //  World Cup
  4, //  Euro Championship
  9, //Copa America
  31, // AFC Asian Cup
  369, // Uzbekistan Super League
  802, // Uzbekistan Cup
];

export const FEATURED_LEAGUES_Object = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 61, name: 'Ligue 1' },
  { id: 78, name: 'Bundesliga' },
  { id: 135, name: 'Serie A' },
  { id: 369, name: 'Uzbekistan Super League' },
  { id: 802, name: 'Uzbekistan Cup' },
  { id: 2, name: 'UEFA Champions League' },
  { id: 3, name: 'UEFA Europa League' },
  { id: 203, name: 'Süper Lig' },
  { id: 1, name: 'World Cup' },
  { id: 4, name: 'Euro Championship' },
  { id: 9, name: 'Copa America' },
  { id: 31, name: 'AFC Asian Cup' },
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
