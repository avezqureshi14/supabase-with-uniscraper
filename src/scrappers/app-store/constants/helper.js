import store from 'app-store-scraper';

export const  mapToStoreSortValue = (reviewSort) => {
    switch (reviewSort) {
      case 'RECENT':
        return store.sort.RECENT;
      case 'HELPFUL':
        return store.sort.HELPFUL;
      // Add more cases for other reviewSort values as needed
  
      default:
        // Handle any unknown or unsupported values
        throw new Error(`Unsupported reviewSort value: ${reviewSort}`);
    }
  }