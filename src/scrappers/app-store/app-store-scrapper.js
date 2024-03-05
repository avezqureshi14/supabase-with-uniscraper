import memoize from 'memoizee';
import { ScraperInterface } from '../scrapper-interface.js';
import { storeCategory } from './constants/category.js';
import { storeCollection } from './constants/collection.js';
import { countries } from '../../constants/countries.js';
import store from 'app-store-scraper';
import { appStoreSort } from '../app-store/constants/sort.js';
import { mapToStoreSortValue } from './constants/helper.js';

export class AppStore extends ScraperInterface {
  constructor() {
    super();

    // Memoize the functions with appropriate configurations
    this.memoizedListApps = memoize(this.listApps.bind(this), { promise: true });
    this.memoizedListDeveloperApps = memoize(this.listDeveloperApps.bind(this), { promise: true });
    this.memoizedGetAppDetails = memoize(this.getAppDetails.bind(this), { promise: true });
  }

  async listApps({
    selectedCollection,
    selectedCategory,
    num,
    selectedCountry,
    selectedSort,
  }) {
    const appStoreCategory = storeCategory[selectedCategory];
    const appStoreCollection = storeCollection[selectedCollection];
    const appStoreCountry = countries[selectedCountry];
    const sort = appStoreSort[selectedSort];

    const allApps = await store.list({
      category: appStoreCategory,
      collection: appStoreCollection,
      country: appStoreCountry,
      sort,
      num,
    });

    // Filter apps based on price if needed
    return allApps;
  }

  async listDeveloperApps({ devId }) {
    return await store.developer({ devId });
  }

  async getAppDetails({ appId }) {
    return await store.app({ id: appId });
  }

  getReviews({ appId, sortReviewsBy, numReviewsPages }) {
    // Map playStoreReviewSort to the corresponding store sort value
    const storeSortValue = mapToStoreSortValue(sortReviewsBy);  
    return store.reviews({
      id: appId,
      sort: storeSortValue,
      page: numReviewsPages,
    });
  }
}
