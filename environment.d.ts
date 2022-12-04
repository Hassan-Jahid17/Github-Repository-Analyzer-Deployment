declare global{
	namespace NodeJS {
		interface ProcessEnv{
			MONGO_CONNECTION_STRING: string,
			APP_URL: string,
			PORT: number, 
			NODE_ENV: string,
			PASSWORD_SALT: string,
			ACCESS_TOKEN_SECRET_KEY: string,
			ACCESS_TOKEN_EXPIRY_TIME: string,
			REFRESH_TOKEN_EXPIRY_TIME: number,
			GITHUB_OAUTH2_CLIENT_ID: string,
			GITHUB_OAUTH2_CLIENT_SECRET: string,
		}
	}	
}