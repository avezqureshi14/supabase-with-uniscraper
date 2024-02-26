import { Actor } from "apify";
import {
  GET_DETAILS,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
} from "./constants/actionTypes.js";
import { logError } from "./utility/logError.js";
import { ScraperFactory } from "./scrappers/scrapper-factory.js";
import {
  addReviewToDatabase,
  addSupportedDeviceToDatabase,
  createApplicationInDatabase,
  createDeveloperInDatabase,
  getCategoryFromDatabase,
  getCollectionFromDatabase,
  getDeveloperFromDatabase,
  getPlatformFromDatabase,
  updateApplication,
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
        const { selectedCollection, selectedCategory, platform } = input;
        await Promise.all(
          apps?.map(async (app) => {
            try {
              const data = await storeInstance.getAppDetails({
                appId: app?.id,
              });

              const category = await getCategoryFromDatabase(selectedCategory);
              const collection = await getCollectionFromDatabase(
                selectedCollection
              );
              let developer = await getDeveloperFromDatabase(data.developerId);

              if (!developer) {
                const developerData = {
                  developer_identifier:data.developerId,
                  name: data.developer,
                  developer_url: data.developerUrl,
                  developer_website: data.developerWebsite,
                };
                developer = await createDeveloperInDatabase(developerData);
              }

              const platformId = await getPlatformFromDatabase(platform);
              const reviewData = {
                score: data?.score,
                current_version_score: data?.currentVersionScore,
                current_version_reviews: data?.currentVersionReviews,
              };
              const supportedDeviceData = {
                device_name:data?.supportedDevices
              }
              
              const application = await createApplicationInDatabase({
                application_identifier: data?.id,
                title: data?.title,
                url: data?.url,
                description: data?.description,
                icon: data?.icon,
                content_rating: data?.contentRating,
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
                has_iap: null,
                has_ads: null,
                installs: null,
                installs_range: null,
                iap_range: null,
                developer_identifier: developer,
                screenshot_identifier: null,
                supported_device_identifier: null,
                review_identifier: null,
                platform_identifier: platformId,
                category_identifier: category,
                collection_identifier: collection,
              });
              const applicationIdentifier = application?.application_identifier;

              // Step 3: Use the application identifier to create related records
              const review_identifier = await addReviewToDatabase(applicationIdentifier, reviewData);
              const supported_device_identifier = await addSupportedDeviceToDatabase(applicationIdentifier, supportedDeviceData);

              await updateApplication(applicationIdentifier,review_identifier,supported_device_identifier);
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
