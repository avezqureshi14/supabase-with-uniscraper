import { ScraperInterface } from '../scrapper-interface.js';
import { countries } from '../../constants/countries.js';
import { gplayCategory } from './constants/category.js';
import gplay from 'google-play-scraper';
import { gplaySort } from '../google-play/constants/sort.js';

export class GooglePlayStore extends ScraperInterface {
  async listApps({
    selectedCollection,
    selectedCategory,
    selectedCountry,
    selectedSort,
  }) {
    const playStoreCategory = gplayCategory[selectedCategory];
    const playStoreCollection = selectedCollection;
    const playStoreCountry = countries[selectedCountry];
    const sort = gplaySort[selectedSort];
    const allApps = gplay.list({
      category: playStoreCategory,
      collection: playStoreCollection,
      country: playStoreCountry,
      sort: sort,
    });

    return allApps;
  }

  async listDeveloperApps({ devId }) {
    throw new Error('This parameter only works for App Store');
  }

  async getAppDetails({ appId }) {
    return await gplay.app({ appId });
  }
}
