import { Actor } from "apify";
import {
  GET_DETAILS,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
} from "./constants/actionTypes.js";
import { logError } from "./utility/logError.js";
import { ScraperFactory } from "./scrappers/scrapper-factory.js";
import * as supabase from "./utility/supabase.js";
import { countries } from "./constants/countries.js";

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
              const data = await storeInstance.getAppDetails({
                appId: platform === "APP_STORE" ? app?.id : app?.appId,
              });

              const category = await supabase.getCategoryFromDatabase(
                selectedCategory
              );
              const collection = await supabase.getCollectionFromDatabase(
                selectedCollection
              );
              let developer = await supabase.getDeveloperFromDatabase(
                data.developerId
              );

              if (!developer) {
                const developerData = {
                  developer_identifier: data.developerId,
                  name: data.developer,
                  developer_url:
                    platform === "APP_STORE"
                      ? data.developerUrl
                      : data.developerEmail,
                  developer_website: data.developerWebsite,
                };
                developer = await supabase.createDeveloperInDatabase(
                  developerData
                );
              }

              const platformId = await supabase.getPlatformFromDatabase(
                platform
              );
              const array = [];
              let reviews = await storeInstance.getReviews(input);
              array.push(reviews);
              console.log(array);
              console.log("Item ✅")
              array.data.map((item)=>{
                console.log(item);
              })
              const reviewData = {

              };
              const supportedDeviceData = {
                device_name: data?.supportedDevices,
              };

              const application = await supabase.createApplicationInDatabase({
                application_identifier:
                  platform === "APP_STORE" ? data?.id : data?.appId,
                title: data?.title,
                url: data?.url,
                description: data?.description,
                icon: data?.icon,
                content_rating: data?.contentRating,
                languages: data?.languages, //n
                size: data?.size, //n
                required_os_version:
                  platform === "APP_STORE"
                    ? data?.requiredOsVersion
                    : data.androidVersion,
                released: data?.released,
                updated: data?.updated,
                release_notes:
                  platform === "APP_STORE"
                    ? data?.releaseNotes
                    : data.recentChanges,
                version: data?.version,
                price: data?.price,
                currency: data?.currency,
                free: data?.free,
                has_iap: platform === "APP_STORE" ? null : data.offersIAP,
                has_ads: platform === "APP_STORE" ? null : data.adSupported,
                installs: platform === "APP_STORE" ? null : data.installs,
                installs_range:
                  platform === "APP_STORE"
                    ? data?.installsRange
                    : [data.minInstalls, data.maxInstalls],
                iap_range: platform === "APP_STORE" ? null : data.IAPRange,
                score: data?.score,
                currentVersionScore: platform === "APP_STORE" ? data.currentVersionScore : null,
                currentVersionReviews: platform === "APP_STORE" ? data.currentVersionReviews : null,
                developer_identifier: developer,
                screenshot_identifier: null,
                supported_device_identifier: null,
                review_identifier: null,
                platform_identifier: platformId,
                category_identifier: category,
                collection_identifier: collection,
                videoImage: platform === "APP_STORE" ? null : data.videoImage,
                video: platform === "APP_STORE" ? null : data.video,
              });
              const applicationIdentifier = application?.application_identifier;
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
