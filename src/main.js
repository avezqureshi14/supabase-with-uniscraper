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
        // await Promise.all(
        //   apps?.map(async (app) => {
        //     try {
        //       const data = await storeInstance.getAppDetails({ appId: app.appId })
        //       const title = data?.title;
        //       const description = data?.description;
        //       const descriptionHTML = data?.descriptionHTML;
        //       const summary = data?.summary;
        //       const installs = data?.installs;
        //       const minInstalls = data?.minInstalls;
        //       const maxInstalls = data?.maxInstalls;
        //       const score = data?.score;
        //       const scoreText = data?.scoreText;
        //       const ratings = data?.ratings;
        //       const reviews = data?.reviews;
        //       const histogram = data?.histogram;
        //       const price = data?.price;
        //       const free = data?.free;
        //       const currency = data?.currency;
        //       const priceText = data?.priceText;
        //       const available = data?.available;
        //       const offersIAP = data?.offersIAP;
        //       const IAPRange = data?.IAPRange;
        //       const androidVersion = data?.androidVersion;
        //       const androidVersionText = data?.androidVersionText;
        //       const androidMaxVersion = data?.androidMaxVersion;
        //       const developer = data?.developer;
        //       const developerId = data?.developerId;
        //       const developerEmail = data?.developerEmail;
        //       const developerWebsite = data?.developerWebsite;
        //       const developerAddress = data?.developerAddress;
        //       const privacyPolicy = data?.privacyPolicy;
        //       const developerInternalID = data?.developerInternalID;
        //       const genre = data?.genre;
        //       const genreId = data?.genreId;
        //       const categories = data?.categories;
        //       const icon = data?.icon;
        //       const headerImage = data?.headerImage;
        //       const screenshots = data?.screenshots;
        //       const video = data?.video;
        //       const videoImage = data?.videoImage;
        //       const previewVideo = data?.previewVideo;
        //       const contentRating = data?.contentRating;
        //       const contentRatingDescription = data?.contentRatingDescription;
        //       const adSupported = data?.adSupported;
        //       const released = data?.released;
        //       const updated = data?.updated;
        //       const version = data?.version;
        //       const recentChanges = data?.recentChanges;
        //       const comments = data?.comments;
        //       const preregister = data?.preregister;
        //       const earlyAccessEnabled = data?.earlyAccessEnabled;
        //       const isAvailableInPlayPass = data?.isAvailableInPlayPass;
        //       const application_identifier = data?.appId;
        //       const url = data?.url;
        //       await axios.post("https://avez-blog-2023-end.onrender.com/apps", {
        //         title,
        //         description,
        //         descriptionHTML,
        //         summary,
        //         installs,
        //         minInstalls,
        //         maxInstalls,
        //         score,
        //         scoreText,
        //         ratings,
        //         reviews,
        //         histogram,
        //         price,
        //         free,
        //         currency,
        //         priceText,
        //         available,
        //         offersIAP,
        //         IAPRange,
        //         androidVersion,
        //         androidVersionText,
        //         androidMaxVersion,
        //         developer,
        //         developerId,
        //         developerEmail,
        //         developerWebsite,
        //         developerAddress,
        //         privacyPolicy,
        //         developerInternalID,
        //         genre,
        //         genreId,
        //         categories,
        //         icon,
        //         headerImage,
        //         screenshots,
        //         video,
        //         videoImage,
        //         previewVideo,
        //         contentRating,
        //         contentRatingDescription,
        //         adSupported,
        //         released,
        //         updated,
        //         version,
        //         recentChanges,
        //         comments,
        //         preregister,
        //         earlyAccessEnabled,
        //         isAvailableInPlayPass,
        //         appId,
        //         url
        //       });
        //     } catch (error) {
        //       console.log(error);
        //     }
        //   })
        // );

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
