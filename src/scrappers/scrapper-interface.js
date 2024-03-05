export class ScraperInterface {
  async listApps({ selectedCollection, selectedCategory, num, selectedCountry, selectedSort }) {}
  async listDeveloperApps({ devId }) {}
  async getAppDetails({ appId }) {}
  async getReviews({ appId, sortReviewsBy, numReviews }) {}

}
