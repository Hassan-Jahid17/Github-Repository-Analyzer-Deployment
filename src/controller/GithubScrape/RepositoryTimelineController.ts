import { Request, Response, NextFunction } from 'express';
import { decrypt } from '../../services/EncryptDecrypt';
import axios from 'axios';
import * as cheerio from "cheerio";
import { clearString } from '../../services/shared/StringManipulation';
import { getRepositoryInfo } from '../../services/features/searchGithub';
import { getUserGithubInfo } from '../../services/shared/githubScrape';
import { findRepositoryOfTwoUsers, modifiedTimelineRepositories } from '../../services/features/reposTimelineScrape';
import { repositoryTimelineBodyValidation } from '../../services/validation/repositoryTimelineValidation';
import createHttpError from 'http-errors';
import { SearchRepositoryTimelineConfiguration } from '../../models/interfaces/SearchRepository';


export async function RepositoryTimelineController(req: Request, res: Response, next: NextFunction) {

	console.log("api/github/timeline/repository");
	console.log(req.body);

	let githubAccessToken = req.headers.GithubAccessToken !== undefined && req.headers.GithubAccessToken !== null ? req.headers.GithubAccessToken : null;
	const isLoggedIn = githubAccessToken !== null;

	if(isLoggedIn) {
		githubAccessToken = decrypt(githubAccessToken as string);
	}else githubAccessToken = null;


	const {error} = repositoryTimelineBodyValidation(req.body);

	if(error) {
		return next(createHttpError(400, error.details[0].message));
	}


	let usersInfo = await getUserGithubInfo([req.body[0].UserName, req.body[1].UserName], githubAccessToken);

	let searchQuery = [
		{
			UserName: req.body[0].UserName,
			RepositoryCount: usersInfo[0].RepositoryCount,
			StartFrom: req.body[0].StartFrom,
			TotalRequiredRepos: 10
		},
		{
			UserName: req.body[1].UserName,
			RepositoryCount: usersInfo[1].RepositoryCount,
			StartFrom: req.body[1].StartFrom,
			TotalRequiredRepos: 10
		}
	] as SearchRepositoryTimelineConfiguration[];

	let result = await findRepositoryOfTwoUsers(searchQuery, githubAccessToken);

	let firstUserReposCount = result.filter((item) => item.UserName == req.body[0].UserName).length;
	let secondUserReposCount = result.filter((item) => item.UserName == req.body[1].UserName).length;

	console.log(firstUserReposCount);
	console.log(secondUserReposCount);
	
	let modifiedresult = modifiedTimelineRepositories(result, req.body[0].UserName, req.body[1].UserName);

	res.status(200).json({
		message: "Fetch Successful",
		data: modifiedresult,
		TotalFirstUserRepoSearchDone: searchQuery[0].StartFrom + firstUserReposCount,
		TotalSecondUserRepoSearchDone: searchQuery[1].StartFrom + secondUserReposCount,
		TotalFirstUserRepoFound: firstUserReposCount,
		TotalSecondUserRepoFound: secondUserReposCount,
		HasMoreReposForFirstUser: searchQuery[0].StartFrom + firstUserReposCount < usersInfo[0].RepositoryCount,
		HasMoreReposForSecondUser: searchQuery[1].StartFrom + secondUserReposCount < usersInfo[1].RepositoryCount,
	});


	// let repositoryName = ["KhanShaheb34/Data-Structures-and-Algorithms-Notebook", "KhanShaheb34/ML-with-Python"];
	// //let repositoryName = ["KhanShaheb34"];

	// let axiosList = [];

	// const config = { 
	// 	headers: {
	// 		...(githubAccessToken !== null) && {Authorization: `token ${githubAccessToken}`},
	// 	},
	// 	timeout: 10000,
	// };

	// for(const repoName of repositoryName) {
	// 	axiosList.push(axios.get(`https://github.com/${repoName}`, config));
	// 	//axiosList.push(axios.get(`https://github.com/${repoName}/file-list/master`, config));
	// 	//axiosList.push(axios.get(`https://github.com/${repoName}?tab=repositories`, config));
	// }

	// const response = await Promise.all(axiosList);


	
	// for(const [index, item] of response.entries()) {
	// 	// Repos Name
	// 	//let val = getData(cheerio.load(item.data), "#repository-container-header > div > div > div > strong > a")[0];

	// 	// Repos Description
	// 	//let val = getData(cheerio.load(item.data), "div > div.BorderGrid-row > div.BorderGrid-cell > p.f4.my-3")[0];
		
	// 	// Respos Star
	// 	//let val = getData(cheerio.load(item.data), "#repo-stars-counter-star")[0];

	// 	// Respos Fork
	// 	//let val = getData(cheerio.load(item.data), "#repo-network-counter")[0];

	// 	// Languages
	// 	let val = getData(cheerio.load(item.data), "div > div.BorderGrid-row > div.BorderGrid-cell > ul.list-style-none > li > a > span");
	// 	console.log(val);

	// 	// date list of all files
	// 	//let val = getData(cheerio.load(item.data), "div.Details-content--hidden-not-important.js-navigation-container.js-active-navigation-container.d-md-block > div > div.color-fg-muted.text-right > time-ago");

	// 	//
	// 	//let val = getData(cheerio.load(item.data), "div.Layout-main > div > div > div > div > div > a > relative-time");
	
	// 	// Repos All item list
	// 	// let parseData = cheerio.load(item.data);
	// 	// let val = getRepositoryInfo(parseData, repositoryName[index]);

	// 	// console.log(val.length);
	// 	// res.status(200).json({
	// 	// 	val
	// 	// });

	// 	// countList.push({
	// 	// 	userId : users[index],
	// 	// 	followingCount: parseInt(val)
	// 	// })
	// 	//if(val) console.log(clearString(val));
	// 	//console.log("-----------------------------------");
	// }


	// //res.sendStatus(200);
}