import * as supabase from "./supabase.js";

export const processDB = async (apps, input, storeInstance) => {
  const { selectedCollection, selectedCategory, platform } = input;
  await Promise.all(
    apps?.slice(0, input.limit)?.map(async (app) => {
      try {
        const data = await storeInstance.getAppDetails({
          appId: app?.id,
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
            developer_url: data.developerUrl,
            developer_website: data.developerWebsite,
          };
          developer = await supabase.createDeveloperInDatabase(developerData);
        }

        const platformId = await supabase.getPlatformFromDatabase(platform);
        const reviewData = {
          score: data?.score,
          current_version_score: data?.currentVersionScore,
          current_version_reviews: data?.currentVersionReviews,
        };
        const supportedDeviceData = {
          device_name: data?.supportedDevices,
        };

        const application = await supabase.createApplicationInDatabase({
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
        const review_identifier = await supabase.addReviewToDatabase(
          applicationIdentifier,
          reviewData
        );
        const supported_device_identifier =
          await supabase.addSupportedDeviceToDatabase(
            applicationIdentifier,
            supportedDeviceData
          );

        await supabase.updateApplication(
          applicationIdentifier,
          review_identifier,
          supported_device_identifier
        );
      } catch (error) {
        console.error(
          `Error processing app details for appId: ${app?.id}`,
          error
        );
      }
    })
  );
};