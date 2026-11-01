import Fuse from 'fuse.js';
import abilityListRaw from '../../../../public/json/abilities-list.json';

export type AbilitySearchEntry = {
	name: string;
};

const abilityList: AbilitySearchEntry[] = abilityListRaw.map((ability) => ({
	name: ability.name,
}));

class AbilitySearchService {
	private fuse: Fuse<AbilitySearchEntry>;

	constructor() {
		this.fuse = new Fuse(abilityList, {
			keys: ['name'],
			threshold: 0.3,
			ignoreLocation: true,
		});
	}

	search(query: string): AbilitySearchEntry[] {
		if (!query) {
			return abilityList.slice(0, 25);
		}

		return this.fuse
			.search(query)
			.slice(0, 25)
			.map((result) => result.item);
	}
}

export const abilitySearchService = new AbilitySearchService();
