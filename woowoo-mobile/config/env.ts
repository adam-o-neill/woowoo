const ENV = {
  dev: {
    apiUrl: "https://woowoo-prod.up.railway.app",
    apiKey: "",
  },
  prod: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  },
};

const getEnvVars = () => {
  // For TestFlight and App Store builds, always use prod
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars;
