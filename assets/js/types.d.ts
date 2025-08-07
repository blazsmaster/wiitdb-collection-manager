interface ImportXmlResponse {
	success: boolean;
	message: string;
	games: Game[];
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
