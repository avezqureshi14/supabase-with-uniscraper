import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://jjvixvxxvjucmnddztii.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqdml4dnh4dmp1Y21uZGR6dGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4MzY4MzEsImV4cCI6MjAyMzQxMjgzMX0.fiSiIflKB14U3yJeZ83-nwksOdm58TnlDWcaquHAnVQ";

const supabase = createClient(supabaseUrl, supabaseKey);
import axios from "axios";
const logError = (action, error) => {
  console.error(`Error ${action}:`, error);
  return { error: error.message || "Internal Server Error" };
};

//Function to get category from database
export const getCategoryFromDatabase = async (categoryName) => {
  const { data, error } = await supabase
    .from("category")
    .select("*")
    .eq("category_name", categoryName)
    .single();
  if (error) {
    return logError("getting category from database", error);
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
    return logError("getting collection from database", error);
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
    return logError("getting developer from database", error);
  }
  return data.developer_identifier;
};

// Function to create a new developer in the database
export const createDeveloperInDatabase = async (developerData) => {
  const { data, error } = await supabase.from("developer").upsert([
    {
      developer_identifier: developerData.developer_identifier,
      name: developerData.name,
      developer_url: developerData.developer_url,
      developer_website: developerData.developer_website,
    },
  ]);
  if (error) {
    return logError("adding developer", error);
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
    return logError("getting platform from database", error);
  }
  return data.identifier;
};

//Function to get application from database
export const getApplicationFromDatabase = async (application_identifier) => {
  const { data, error } = await supabase
    .from("application")
    .select("*")
    .eq("application_identifier", application_identifier)
    .single();
  if (error) {
    return logError("getting application from database", error);
  }
  return data;
};

// Function to create a new application in the database
export const createApplicationInDatabase = async (applicationData) => {
  const { data, error } = await supabase
    .from("application")
    .upsert([applicationData]);
  if (error) {
    return logError("adding application", error);
  }
  return getApplicationFromDatabase(applicationData.application_identifier);
};


//Function for getting review from database
export const getReviewFromDatabase = async (application_identifier) => {
  const { data, error } = await supabase
    .from("review")
    .select("*")
    .eq("application_identifier", application_identifier)
    .single();
  if (error) {
    return logError("getting review from database", error);
  }
  return data.identifier;
};


//Function for adding review from database
export const addReviewToDatabase = async (applicationId, reviewData) => {
  const { data, error } = await supabase
    .from("review")
    .upsert([{ application_identifier: applicationId, ...reviewData }]);
  if (error) {
    return logError("adding review", error);
  }
  return getReviewFromDatabase(applicationId);
};

//Function for getting supported device from database
export const getSupportedDeviceFromDatabase = async (
  application_identifier
) => {
  const { data, error } = await supabase
    .from("supported_device")
    .select("*")
    .eq("application_identifier", application_identifier)
    .single();
  if (error) {
    return logError("getting supported device from database", error);
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
    .upsert([
      { application_identifier: applicationId, ...supportedDeviceData },
    ]);
  if (error) {
    return logError("adding supported device", error);
  }
  return getSupportedDeviceFromDatabase(applicationId);
};

// Function for getting screenshots from database
export const getScreenshotsFromDatabase = async (application_identifier) => {
  const { data, error } = await supabase
    .from("screenshot")
    .select("*")
    .eq("application_identifier", application_identifier)
    .single();
  if (error) {
    return logError("getting screenshots from database", error);
  }
  return data.identifier;
};

// Function to add a supported device to the database
export const addScreenshotsToDatabase = async (
  applicationId,
  screenshotsData
) => {
  const { data, error } = await supabase
    .from("screenshot")
    .upsert([{ application_identifier: applicationId, ...screenshotsData }]);
  if (error) {
    return logError("adding screenshots", error);
  }
  return getScreenshotsFromDatabase(applicationId);
};

// Function for updating application from database
export const updateApplication = async (
  applicationId,
  reviewId,
  supportedDeviceId,
  screenshotId
) => {
  // Check if the supportedDeviceId exists in the supported_device table
  const supportedDeviceExists = await supabase
    .from("supported_device")
    .select("*")
    .eq("identifier", supportedDeviceId)
    .single();

  if (!supportedDeviceExists) {
    console.error(
      `Supported device with ID ${supportedDeviceId} does not exist.`
    );
    return null;
  }

  // Perform the update operation
  const { data, error } = await supabase
    .from("application")
    .update({
      review_identifier: reviewId,
      supported_device_identifier: supportedDeviceId,
      screenshot_identifier: screenshotId,
    })
    .eq("application_identifier", applicationId);

  if (error) {
    return logError("updating application", error);
  }

  return data;
};

// Function for adding ranking from database
export const ranking = async (rankingData) => {
  const { data, error } = await supabase.from("ranking").upsert([rankingData]);

  if (error) {
    return logError("adding ranking", error);
  }
};



