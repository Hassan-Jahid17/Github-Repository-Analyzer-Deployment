import { Request, Response, NextFunction } from 'express';
import { getAllFollowingUser, getUserGithubInfo } from '../../services/shared/githubScrape';
import { SearchRepositoryConfiguration, SearchRepositoryItem, SearchRepositoryQuery } from '../../models/interfaces/SearchRepository';
import { decrypt } from '../../services/EncryptDecrypt';
import { findRepositoryByQuery } from '../../services/features/searchGithub';
import { searchRepositryBodyValidation } from '../../services/validation/searchRepositoryValidation';
import createHttpError from 'http-errors';
//import { getUserGithubInfo } from '../../services/features/searchGithub';


export async function SearchReposController(req: Request, res: Response, next: NextFunction) {
	
	let githubAccessToken = req.headers.GithubAccessToken !== undefined && req.headers.GithubAccessToken !== null ? req.headers.GithubAccessToken : null;
	const isLoggedIn = githubAccessToken !== null;

	if(isLoggedIn) {
		githubAccessToken = decrypt(githubAccessToken as string);
	}else githubAccessToken = null;


	const {error} = searchRepositryBodyValidation(req.body);

	if(error) {
		return next(createHttpError(400, error.details[0].message));
	}

	let followingUserCount = await getUserGithubInfo([req.body.GithubHandle], githubAccessToken);
	let followingUser = await getAllFollowingUser(followingUserCount, githubAccessToken);


	let searchQuery = {
		SearchText: req.body.QueryText,
		SearchLanguage: req.body.QueryLanguage,
		IsLoggedIn: isLoggedIn,
		PageSearchPerApiCall: isLoggedIn ?  50 : 20,
		TotalPageSearchPerApiCall: isLoggedIn ? 200 : 60,
		WaitBetweenApiCall: 2000,
		MinDesireRepository: isLoggedIn ? 10 : 4,
		TotalTimeoutForApiCall: isLoggedIn ? 15000 : 10000,
		SearchStartIndex: req.body.QuerySearchStartIndex
	} as SearchRepositoryConfiguration;


	const searchResult = await findRepositoryByQuery(searchQuery, followingUser, githubAccessToken);

	console.log(searchResult.ReposResult.length);

	res.status(200).json({
		message: "AccessToken Refresh Successfully",
		data: searchResult,
	});
}