const { createClient } = require("@supabase/supabase-js");

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
    .from("collections")
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
export const getDeveloperFromDatabase = async (developerName) => {
  const { data, error } = await supabase
    .from("developers")
    .select("*")
    .eq("name", developerName)
    .single();

  if (error) {
    console.error("Error getting developer from database:", error);
    return null;
  }

  return data.identifier;
};

// Function to create a new developer in the database
export const createDeveloperInDatabase = async (developerName) => {
  const { data, error } = await supabase
    .from("developers")
    .upsert([{ name: developerName }], { onConflict: ["name"] });

  if (error) {
    console.error("Error creating developer in database:", error);
    return null;
  }
};

// Function to get a platform from the database based on the platform name
export const getPlatformFromDatabase = async (platformName) => {
  const { data, error } = await supabase
    .from("platforms")
    .select("*")
    .eq("platform_name", platformName)
    .single();

  if (error) {
    console.error("Error getting platform from database:", error);
    return null;
  }

  return data.identifier;
};


// Function to create a new application in the database
export const createApplicationInDatabase = async (applicationData) => {
    const { data, error } = await supabase
      .from("applications")
      .upsert([applicationData], { onConflict: ["title"] });
  
    if (error) {
      console.error("Error creating application in database:", error);
      return null;
    }
  
    return data[0];
  };
  
  export const addReviewToDatabase = async (applicationId, reviewData) => {
    const { data, error } = await supabase
      .from("reviews")
      .upsert([{ application_identifier: applicationId, ...reviewData }], {
        onConflict: ["application_identifier"],
      });
  
    if (error) {
      console.error("Error adding review to database:", error);
      return null;
    }
  
    return data[0];
  };
  
  // Function to add a screenshot to the database
  export const addScreenshotToDatabase = async (applicationId, screenshotData) => {
    const { data, error } = await supabase
      .from("screenshots")
      .upsert([{ application_identifier: applicationId, ...screenshotData }], {
        onConflict: ["application_identifier"],
      });
  
    if (error) {
      console.error("Error adding screenshot to database:", error);
      return null;
    }
  
    return data[0];
  };
  
  // Function to add a supported device to the database
  export const addSupportedDeviceToDatabase = async (
    applicationId,
    supportedDeviceData
  ) => {
    const { data, error } = await supabase
      .from("supported_devices")
      .upsert(
        [{ application_identifier: applicationId, ...supportedDeviceData }],
        {
          onConflict: ["application_identifier"],
        }
      );
  
    if (error) {
      console.error("Error adding supported device to database:", error);
      return null;
    }
  
    return data[0];
  };
  

  