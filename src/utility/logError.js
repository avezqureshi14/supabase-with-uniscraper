export const logError = (error) => {
  console.error("Error fetching data:", error);
  return { error: error.message || "Internal Server Error" };
};
