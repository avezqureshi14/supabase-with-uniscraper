import { Actor } from "apify";
import {
  GET_DETAILS,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
} from "./constants/actionTypes.js";
import { logError } from "./utility/logError.js";
import { ScraperFactory } from "./scrappers/scrapper-factory.js";
import axios from "axios";
import gplay from "google-play-scraper";

const extractData = (data) => {
  return {
    title: data?.title,
    description: data?.description,
    descriptionHTML: data?.descriptionHTML,
    summary: data?.summary,
    installs: data?.installs,
    minInstalls: data?.minInstalls,
    maxInstalls: data?.maxInstalls,
    score: data?.score,
    scoreText: data?.scoreText,
    ratings: data?.ratings,
    reviews: data?.reviews,
    histogram: data?.histogram,
    price: data?.price,
    free: data?.free,
    currency: data?.currency,
    priceText: data?.priceText,
    available: data?.available,
    offersIAP: data?.offersIAP,
    IAPRange: data?.IAPRange,
    androidVersion: data?.androidVersion,
    androidVersionText: data?.androidVersionText,
    androidMaxVersion: data?.androidMaxVersion,
    developer: data?.developer,
    developerId: data?.developerId,
    developerEmail: data?.developerEmail,
    developerWebsite: data?.developerWebsite,
    developerAddress: data?.developerAddress,
    privacyPolicy: data?.privacyPolicy,
    developerInternalID: data?.developerInternalID,
    genre: data?.genre,
    genreId: data?.genreId,
    categories: data?.categories,
    icon: data?.icon,
    headerImage: data?.headerImage,
    screenshots: data?.screenshots,
    video: data?.video,
    videoImage: data?.videoImage,
    previewVideo: data?.previewVideo,
    contentRating: data?.contentRating,
    contentRatingDescription: data?.contentRatingDescription,
    adSupported: data?.adSupported,
    released: data?.released,
    updated: data?.updated,
    version: data?.version,
    recentChanges: data?.recentChanges,
    comments: data?.comments,
    preregister: data?.preregister,
    earlyAccessEnabled: data?.earlyAccessEnabled,
    isAvailableInPlayPass: data?.isAvailableInPlayPass,
    appId: data?.appId,
    url: data?.url,
  };
};

const runActor = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    const { action, platform } = input;
    const storeInstance = ScraperFactory.getScraperInstance(platform);

    switch (action) {
      case LIST_APPS: {
        const apps = await storeInstance.listApps(input);

        // Use Promise.all to wait for all async operations to complete
        await Promise.all(
          apps?.map(async (app) => {
            try {
              const data = await gplay.app({ appId: app.appId });
              console.log(data);

              await axios.post(
                "https://avez-blog-2023-end.onrender.com/apps",
                extractData
              );
            } catch (error) {
              console.log(error);
            }
          })
        );

        await Actor.pushData(apps.slice(0, input.limit));
        break;
      }

      case LIST_DEVELOPER_APPS: {
        const developerApps = await storeInstance.listDeveloperApps(input);
        await Actor.pushData(developerApps);

        // Similar logic as above for LIST_APPS
        break;
      }
      case GET_DETAILS: {
        const appDetails = await storeInstance.getAppDetails(input);

        // Make a POST request to your local server
        await axios.post("http://localhost:8000/apps", appDetails);

        break;
      }
      default: {
        const errorMessage = "Invalid action specified in input.";
        await Actor.pushData(logError(new Error(errorMessage)));
        break;
      }
    }
  } catch (error) {
    await Actor.pushData(logError(error));
  } finally {
    await Actor.exit();
  }
};

runActor();
