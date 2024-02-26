import { Actor } from "apify";
import {
  GET_DETAILS,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
} from "./constants/actionTypes.js";
import { logError } from "./utility/logError.js";
import { ScraperFactory } from "./scrappers/scrapper-factory.js";
import {
  createApplicationInDatabase,
  createDeveloperInDatabase,
  getCategoryFromDatabase,
  getCollectionFromDatabase,
  getDeveloperFromDatabase,
  getPlatformFromDatabase,
} from "./utility/supabase.js";

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
        } = input;
        await Promise.all(
          apps?.map(async (app) => {
            try {
              const data = await storeInstance.getAppDetails({
                appId: app?.id,
              });

              const category = await getCategoryFromDatabase(selectedCollection); // Implement this function
              const collection = await getCollectionFromDatabase(
                data.collection
              ); // Implement this function
              let developer = await getDeveloperFromDatabase(selectedCategory); // Implement this function

              if (!developer) {
                developer = await createDeveloperInDatabase(data.developer); // Implement this function
              }

              const platform = await getPlatformFromDatabase(data.platform); // Implement this function

              const application = await createApplicationInDatabase({
                application_identifier: data?.id,
                title: data?.title,
                url: data?.url,
                description: data?.description,
                icon: data?.icon,
                contentRating: data?.contentRating,
                languages: data?.languages,
                size: data?.size,
                required_os_version: data?.requiredOsVersion,
                released: data?.released,
                updated: data?.updated,
                release_notes: data?.releaseNotes,
                version: data?.version,
                price: data?.price,
                currency: data?.currency,
                free: data?.free,
                category_identifier: category,
                collection_identifier: collection,
                developer_identifier: developer,
                screenshot_identifier: null,
                supported_device_identifier: null,
                review_identifier: null,
                platform_identifier: platform,
              });
            } catch (error) {
              console.error(
                `Error processing app details for appId: ${app?.id}`,
                error
              );
              // Handle the error as needed
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
