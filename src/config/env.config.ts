export const EnvConfiguration = () => ({
    environment: process.env.NODE_ENV || 'dev',
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUsername: process.env.DB_USERNAME,
    port: process.env.PORT || 3001,
    hostApi: process.env.HOST_API,
});