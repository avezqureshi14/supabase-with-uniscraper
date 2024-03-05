import gplay from 'google-play-scraper';

export const  mapToGPlaySortValue = (reviewSort) => {
    switch (reviewSort) {
      case 'RECENT':
        return gplay.sort.NEWEST;
    //   case 'RATING':
    //     return gplay.sort.RATING;
      case 'HELPFUL':
        return gplay.sort.HELPFULNESS;
      // Add more cases for other reviewSort values as needed
  
      default:
        // Handle any unknown or unsupported values
        throw new Error(`Unsupported reviewSort value: ${reviewSort}`);
    }
  }