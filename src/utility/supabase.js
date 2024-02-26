import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://jjvixvxxvjucmnddztii.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqdml4dnh4dmp1Y21uZGR6dGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4MzY4MzEsImV4cCI6MjAyMzQxMjgzMX0.fiSiIflKB14U3yJeZ83-nwksOdm58TnlDWcaquHAnVQ";

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get a category from the database based on the category name
export const getCategoryFromDatabase = async (categoryName) => {
  const { data, error } = await supabase
    .from("category")
    .select("*")
    .eq("category_name", categoryName)
    .single();
  if (error) {
    console.error("Error getting category from database:", error);
    return null;
  }

  return data.identifier;
};

// Function to get a collection from the database based on the collection name
export const getCollectionFromDatabase = async (collectionName) => {
  const { data, error } = await supabase
    .from("collection")
    .select("*")
    .eq("collection_name", collectionName)
    .single();

  if (error) {
    console.error("Error getting collection from database:", error);
    return null;
  }

  return data.identifier;
};

// Function to get a developer from the database based on the developer name
export const getDeveloperFromDatabase = async (developer_identifier) => {
  const { data, error } = await supabase
    .from("developer")
    .select("*")
    .eq("developer_identifier", developer_identifier)
    .single();

  if (error) {
    console.error("Error getting developer from database:", error);
    return null;
  }

  return data.developer_identifier;
};

// Function to create a new developer in the database
export const createDeveloperInDatabase = async (developerData) => {
  const { data, error } = await supabase
    .from("developer")
    .upsert([
      {
        developer_identifier:developerData.developer_identifier,
        name: developerData.name,
        developer_url: developerData.developer_url,
        developer_website: developerData.developer_website
      },
    ]);

  if (error) {
    console.error("Error creating developer in database:", error);
    return null;
  }

  return getDeveloperFromDatabase(developerData.developer_identifier);

};

// Function to get a platform from the database based on the platform name
export const getPlatformFromDatabase = async (platformName) => {
  const { data, error } = await supabase
    .from("platform")
    .select("*")
    .eq("platform_name", platformName)
    .single();

  if (error) {
    console.error("Error getting platform from database:", error);
    return null;
  }

  return data.identifier;
};
export const getApplicationFromDatabase = async (application_identifier) => {
  const { data, error } = await supabase
    .from("application")
    .select("*")
    .eq("application_identifier", application_identifier)
    .single();

  if (error) {
    console.error("Error getting platform from database:", error);
    return null;
  }

  return data;
};

// Function to create a new application in the database
export const createApplicationInDatabase = async (applicationData) => {
  const { data, error } = await supabase
    .from("application")
    .upsert([applicationData]);

  if (error) {
    console.error("Error creating application in database:", error);
    return null;
  }

  return getApplicationFromDatabase(applicationData.application_identifier);
};


export const getReviewFromDatabase = async (application_identifier) => {
  const { data, error } = await supabase
    .from("review")
    .select("*")
    .eq("application_identifier", application_identifier)
    .single();

  if (error) {
    console.error("Error getting platform from database:", error);
    return null;
  }

  return data.identifier;
};


export const addReviewToDatabase = async (applicationId, reviewData) => {
  const { data, error } = await supabase
    .from("review")
    .upsert([{ application_identifier: applicationId, ...reviewData }]);

  if (error) {
    console.error("Error adding review to database:", error);
    return null;
  }

  return getReviewFromDatabase(applicationId);
};


// Function to add a screenshot to the database
export const addScreenshotToDatabase = async (
  applicationId,
  screenshotData
) => {
  const { data, error } = await supabase
    .from("screenshots")
    .upsert([{ application_identifier: applicationId, ...screenshotData }], {
      onConflict: ["application_identifier"],
    });

  if (error) {
    console.error("Error adding screenshot to database:", error);
    return null;
  }
};

export const getSupportedDeviceFromDatabase = async (application_identifier) => {
  const { data, error } = await supabase
    .from("supported_device")
    .select("*")
    .eq("application_identifier", application_identifier)
    .single();

  if (error) {
    console.error("Error getting platform from database:", error);
    return null;
  }

  return data.identifier;
};


// Function to add a supported device to the database
export const addSupportedDeviceToDatabase = async (
  applicationId,
  supportedDeviceData
) => {
  const { data, error } = await supabase
    .from("supported_device")
    .upsert(
      [{ application_identifier: applicationId, ...supportedDeviceData }]
    );

  if (error) {
    console.error("Error adding supported device to database:", error);
    return null;
  }

  return getSupportedDeviceFromDatabase(applicationId);
};


export const updateApplication = async (
  applicationId,
  reviewId,
  supportedDeviceId
) => {
  // Check if the supportedDeviceId exists in the supported_device table
  const supportedDeviceExists = await supabase
    .from("supported_device")
    .select("*")
    .eq("identifier", supportedDeviceId)
    .single();

  if (!supportedDeviceExists) {
    console.error(`Supported device with ID ${supportedDeviceId} does not exist.`);
    return null;
  }

  // Perform the update operation
  const { data, error } = await supabase
    .from("application")
    .update({
      review_identifier: reviewId,
      supported_device_identifier: supportedDeviceId,
    })
    .eq("application_identifier", applicationId);

  if (error) {
    console.error("Error updating application in database:", error);
    return null;
  }

  return data;
};
