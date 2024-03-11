import { Actor } from "apify";
import {
  APP_STORE,
  GET_DETAILS,
  GOOGLE_PLAY,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
} from "./constants/actionTypes.js";
import { logError } from "./utility/logError.js";
import { ScraperFactory } from "./scrappers/scrapper-factory.js";
import * as supabase from "./utility/supabase.js";
import { countries } from "./constants/countries.js";
import { addApplication } from "./utility/databaseUtils.js";

const runActor = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    const { action, platform } = input;
    const storeInstance = ScraperFactory.getScraperInstance(platform);

    switch (action) {
      case LIST_APPS: {
        const apps = await storeInstance.listApps(input);
        const {
          selectedCollection,
          selectedCategory,
          platform,
          selectedCountry,
        } = input;
        await Promise.all(
          apps?.slice(0, input.limit)?.map(async (app, index) => {

            try {
              console.log("hey i am avez")
              const data = await storeInstance.getAppDetails({
                appId: platform === "APP_STORE" ? app?.id : app?.appId,

              });
              const category = await supabase.getCategoryFromDatabase(
                selectedCategory
              );
              const collection = await supabase.getCollectionFromDatabase(
                selectedCollection
              );
              const developer = await createDeveloperIfNeeded(data, platform);
              const platformId = await supabase.getPlatformFromDatabase(
                platform
              );
              const supportedDeviceData = {
                device_name: data?.supportedDevices,
              };

              const application = await addApplication(data, platform, developer, category, collection, platformId);
              const applicationIdentifier = application?.application_identifier;
              const reviews = [];
              // appId, sortReviewsBy, numReviews
              const { sortReviewsBy, numReviews } = input;
              let review = await storeInstance.getReviews(applicationIdentifier, sortReviewsBy, numReviews);
              reviews.push(review);

              const reviewData = { good: [], bad: [] };
              let goodReviews = [];
              let badReviews = [];

              if (platform === GOOGLE_PLAY) {
                reviews.forEach((item) => {
                  item.data.forEach((i) => {
                    if (i.score >= 4) {
                      goodReviews.push(i.text);
                    } else if (i.score <= 3) {
                      badReviews.push(i.text);
                    }
                  });
                });
              }
              else if (platform === APP_STORE) {
                reviews.forEach((item) => {
                  item.forEach((i) => {
                    if (i.score >= 4) {
                      goodReviews.push(i.text);
                    } else if (i.score <= 3) {
                      badReviews.push(i.text);
                    }
                  });
                });
              }
              reviewData.good = goodReviews;
              reviewData.bad = badReviews;
              const selectedRegion = countries[selectedCountry];
              const rankingData = {
                application_identifier: applicationIdentifier,
                region: selectedRegion,
                category_identifier: category,
                collection_identifier: collection,
                rank: index + 1,
              };
              const screenshotsData = {
                application_identifier: applicationIdentifier,
                mobile: data?.screenshots,
                tablet: data?.ipadScreenshots,
                tv: data?.appletvScreenshots,
              };
              if (applicationIdentifier) {
                const review_identifier = await supabase.addReviewToDatabase(
                  applicationIdentifier,
                  reviewData
                );
                const screenshot_identifier =
                  await supabase.addScreenshotsToDatabase(
                    applicationIdentifier,
                    screenshotsData
                  );

                const supported_device_identifier =
                  await supabase.addSupportedDeviceToDatabase(
                    applicationIdentifier,
                    supportedDeviceData
                  );

                await supabase.updateApplication(
                  applicationIdentifier,
                  review_identifier,
                  supported_device_identifier,
                  screenshot_identifier
                );

                await supabase.ranking(rankingData);
              }
            } catch (error) {
              console.error(
                `Error processing app details for appId: ${app?.id}`,
                error
              );
            }
          })
        );

        await Actor.pushData(apps.slice(0, input.limit));
        break;
      }

      case LIST_DEVELOPER_APPS: {
        const developerApps = await storeInstance.listDeveloperApps(input);
        await Actor.pushData(developerApps);
        break;
      }
      case GET_DETAILS: {
        const appDetails = await storeInstance.getAppDetails(input);

        await Actor.pushData(appDetails);

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
