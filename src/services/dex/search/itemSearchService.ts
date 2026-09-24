import Fuse from 'fuse.js';
import itemListRaw from '../../../../public/json/items-list.json';

export type ItemSearchEntry = {
	name: string;
};

const itemList: ItemSearchEntry[] = itemListRaw.map((item) => ({ name: item.name }));

class ItemSearchService {
  private fuse: Fuse<ItemSearchEntry>;

  constructor() {
    this.fuse = new Fuse(itemList, {
      keys: ['name'],
      threshold: 0.3,
    });
  }

  search(query: string): ItemSearchEntry[] {
    if (!query) {
      return itemList.slice(0, 25);
    };
    
    return this.fuse.search(query).slice(0, 25).map((result) => result.item);
  }
}

export const itemSearchService = new ItemSearchService();
