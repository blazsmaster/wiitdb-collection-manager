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
}

interface ActiveFilter {
	region: string;
	language: string;
	developer: string;
	publisher: string;
}

interface Game {
	id: string;
	name: string;
	region: string;
	language: string;
	developer: string;
	publisher: string;
	type: string;
}

type MessageType = 'success' | 'error' | ''
type FilterOptions = 'region' | 'language' | 'developer' | 'publisher'