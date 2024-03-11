import * as supabase from "./supabase.js";

export const addApplication = async (data, platform, developer, category, collection, platformId) => {
    return await supabase.createApplicationInDatabase({
        application_identifier: platform === "APP_STORE" ? data?.id : data?.appId,
        title: data?.title,
        url: data?.url,
        description: data?.description,
        icon: data?.icon,
        content_rating: data?.contentRating,
        languages: data?.languages,
        size: data?.size,
        required_os_version: platform === "APP_STORE" ? data?.requiredOsVersion : data.androidVersion,
        released: data?.released,
        updated: data?.updated,
        release_notes: platform === "APP_STORE" ? data?.releaseNotes : data.recentChanges,
        version: data?.version,
        price: data?.price,
        currency: data?.currency,
        free: data?.free,
        has_iap: platform === "APP_STORE" ? null : data.offersIAP,
        has_ads: platform === "APP_STORE" ? null : data.adSupported,
        installs: platform === "APP_STORE" ? null : data.installs,
        installs_range: platform === "APP_STORE" ? data?.installsRange : [data.minInstalls, data.maxInstalls],
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
};


export const addDeveloper = async (data, platform) => {
    const developer = await supabase.getDeveloperFromDatabase(data.developerId);

    if (!developer) {
        const developerData = {
            developer_identifier: data.developerId,
            name: data.developer,
            developer_url: platform === "APP_STORE" ? data.developerUrl : data.developerEmail,
            developer_website: data.developerWebsite,
        };
        return await supabase.createDeveloperInDatabase(developerData);
    }

    return developer;
};