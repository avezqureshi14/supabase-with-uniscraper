import { Actor } from 'apify';
import {
  GET_DETAILS,
  LIST_APPS,
  LIST_DEVELOPER_APPS
} from './constants/actionTypes.js';
import { logError } from './utility/logError.js';
import { ScraperFactory } from './scrappers/scrapper-factory.js';
import mongoose from 'mongoose';

// Mongoose setup
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Mongoose model for AppDetails
const AppDetails = mongoose.model('AppDetails', {
  // Define your model fields here
  // Example: title: String, description: String, ...
});

const runActor = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    const { action, platform } = input;
    const storeInstance = ScraperFactory.getScraperInstance(platform);

    switch (action) {
      case LIST_APPS: {
        const apps = await storeInstance.listApps(input);
        await Actor.pushData(apps.slice(0, input.limit));

        // Extract app IDs
        const appIds = apps.map(app => app.appId);

        // Fetch details for each app ID
        for (const appId of appIds) {
          const appDetailsInput = { ...input, appId, action: GET_DETAILS };
          const appDetails = await storeInstance.getAppDetails(appDetailsInput);

          // Save app details to MongoDB
          const newAppDetails = new AppDetails(appDetails);
          await newAppDetails.save();
        }
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

        // Save app details to MongoDB
        const newAppDetails = new AppDetails(appDetails);
        await newAppDetails.save();

        break;
      }
      default: {
        const errorMessage = 'Invalid action specified in input.';
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
