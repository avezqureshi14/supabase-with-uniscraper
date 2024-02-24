import { APP_STORE, GOOGLE_PLAY } from '../constants/actionTypes.js';
import { AppStore } from './app-store/app-store-scrapper.js';
import { GooglePlayStore } from './google-play/google-play-scrapper.js';

export class ScraperFactory {
  static appStoreInstance = new AppStore();
  static googlePlayStoreInstance = new GooglePlayStore();

  static getScraperInstance(platform) {
    switch (platform) {
      case APP_STORE: {
        return ScraperFactory.appStoreInstance;
      }
      case GOOGLE_PLAY: {
        return ScraperFactory.googlePlayStoreInstance;
      }
      default: {
        throw new Error('Invalid platform');
      }
    }
  }
}
