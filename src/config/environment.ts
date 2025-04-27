const environment = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production', 
    apiUrl: process.env.REACT_APP_API_URL,
    // 다른 환경 관련 설정들...
  };

  export default environment;