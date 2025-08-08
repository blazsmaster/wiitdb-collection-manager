interface ImportXmlResponse {
	success: boolean;
	message: string;
	games: Game[];
	filters: Filter;
}

interface Filter {
	region: string[];
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