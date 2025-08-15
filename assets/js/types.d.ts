interface ImportXmlResponse {
	success: boolean;
	message: string;
	games: Game[];
	filters: Filter;
}

interface Filter {
	region: string[];
	language: string[];
	developer: string[];
	publisher: string[];
	type: string[];
}

interface ActiveFilter {
	region: string;
	language: string;
	developer: string;
	publisher: string;
	regionCode: string;
	type: string;
}

interface Game {
	id: string;
	name: string;
	title: string;
	region: string;
	language: string;
	developer: string[];
	publisher: string[];
	type: string;
	checked: boolean;
	searchMatchDetails?: MatchDetails;
}

interface MatchResult {
	matches: boolean;
	matchDetails?: MatchDetails;
}

interface MatchDetails {
	field: string;
	index: number;
	length: number;
	matchedValue?: string;
}

interface LanguageSrc {
	name: string;
	code: string;
	url: string;
}

type MessageType = 'success' | 'error' | ''
type FilterOptions = 'region' | 'language' | 'developer' | 'publisher' | 'regionCode' | 'type'
type JumpPosition = 'top' | 'bottom'