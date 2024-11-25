type Environment = "development" | "production" | "test" | "staging";

const ENV = {
  dev: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL_DEV || "http://localhost:3000",
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  },
  staging: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL_STAGING,
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  },
  prod: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL_PROD,
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  // You can add logic here to determine staging vs prod
  return ENV.prod;
};

export default getEnvVars;
