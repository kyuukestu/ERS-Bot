// services/PokemonSearchService.ts

import Fuse from 'fuse.js';
import moveListRaw from '../../../public/json/moves-list.json';

export type MoveSearchEntry = {
	name: string;

};

const moveList: MoveSearchEntry[] = moveListRaw.map((move) => ({
	name: move.name,
}));

class MoveSearchService {
	private fuse: Fuse<MoveSearchEntry>;

	constructor() {
		this.fuse = new Fuse(moveList, {
			keys: ['name', 'speciesName', 'formName'],
			threshold: 0.3,
			ignoreLocation: true,
		});
	}

	search(query: string) {
		if (!query) {
			return moveList.slice(0, 25);
		}

		return this.fuse
			.search(query)
			.slice(0, 25)
			.map((result) => result.item);
	}
}

export const moveSearchService = new MoveSearchService();
