import axios from 'axios';
import * as cheerio from "cheerio";
import { ceil, floor } from 'lodash';
import { clearString } from '../../services/shared/StringManipulation';
import { getRepositoryInfoFromRepositoriesTab } from '../../services/shared/repositoryScrape';
import { RepositoryItem, SearchRepositoryTimelineConfiguration } from '../../models/interfaces/SearchRepository';


export async function findRepositoryOfTwoUsers(users: SearchRepositoryTimelineConfiguration[],githubAuthToken: any): Promise<any> {
	
	console.log("Search Users is");
	console.log(users);

	let axiosList = [];

	const config = { 
		headers: {
			...(githubAuthToken !== null) && {Authorization: `token ${githubAuthToken}`}
		},
		timeout: 10000,
	};

	for(let user of users) {
		axiosList.push(axios.get(`https://github.com/${user.UserName}?page=${ceil((user.StartFrom + 1)/30)}&tab=repositories`, config));
	}

	let response: any[] = [];
	let userRepos: RepositoryItem[][] = [];
	try{
		response = await Promise.all(axiosList);

		if(response?.length > 0) {
			for(const [index, item] of response?.entries()) {
				const parseData = cheerio.load(item.data);
				let reposList = getRepositoryInfoFromRepositoriesTab(parseData, users[index].UserName);
				let filterReposList = getFilterRepository(reposList, users[index].StartFrom, users[index].TotalRequiredRepos);
				userRepos.push(filterReposList);
			}
		}
	}catch(error: any) {
		console.log(error);
		console.log(error.response);
	}

	axiosList = [];
	for(let [index, userReposList] of userRepos.entries()) {
		for(let repo of userReposList) {
			axiosList.push(axios.get(`https://github.com/${repo.UserName}/${repo.Name}`, config));
		}
	}

	response = [];

	try{
		response = await Promise.all(axiosList);

		if(response?.length > 0) {
			for(const [index, item] of response?.entries()) {
				const userNo = floor(index / users[0].TotalRequiredRepos);
				const userReposNo = index % users[0].TotalRequiredRepos;
				const parseData = cheerio.load(item.data);
				userRepos[userNo][userReposNo].Languages = getReposLanguage(parseData, 4);
				userRepos[userNo][userReposNo].MainBrachName = getMainBranchNameofRepos(parseData);
			}
		}

		await new Promise(r => setTimeout(r, 2000));

		axiosList = [];
		response = [];

		for(let [index, userReposList] of userRepos.entries()) {
			for(let repo of userReposList) {
				axiosList.push(axios.get(`https://github.com/${repo.UserName}/${repo.Name}/file-list/${repo.MainBrachName}`, config));
			}
		}

		response = await Promise.all(axiosList);

		if(response?.length > 0) {
			for(const [index, item] of response?.entries()) {
				const userNo = floor(index / users[0].TotalRequiredRepos);
				const userReposNo = index % users[0].TotalRequiredRepos;
				console.log(index, userNo);
				const parseData = cheerio.load(item.data);
				
				userRepos[userNo][userReposNo].CreatedDate = getReposCreatedDate(parseData);
			}
		}

	}catch(error: any) {
		console.log("Error Occured");
	}


	return userRepos;
}

export interface TimelineReposResult extends RepositoryItem {
	IsFristUsersRepos ?: boolean,
	IsSecondUsersRepos ?: boolean,
}

export function modifiedTimelineRepositories(reposList: RepositoryItem[][]) {
	let firstUserRepos = reposList[0] as TimelineReposResult[];
	let secondUserRepos = reposList[1] as TimelineReposResult[];

	let reposResult: TimelineReposResult[] = [];

	for(let repo of firstUserRepos) {
		reposResult.push({
			...repo,
			IsFristUsersRepos: true,
			IsSecondUsersRepos: false,
			CreatedDate: repo.CreatedDate?.replace(',', ''),
			ModifiedDate: repo.ModifiedDate?.replace(',', ''),
		});
	}

	for(let repo of secondUserRepos) {
		reposResult.push({
			...repo,
			IsFristUsersRepos: false,
			IsSecondUsersRepos: true,
			CreatedDate: repo.CreatedDate?.replace(',', ''),
			ModifiedDate: repo.ModifiedDate?.replace(',', ''),
		});
	}

	reposResult.sort((X: TimelineReposResult, Y: TimelineReposResult) => {
		if(X.CreatedDate && Y.CreatedDate) {
			return new Date(X.CreatedDate).getTime() - new Date(Y.CreatedDate).getTime();
		}else return -1;
	});

	return reposResult;

	// for(let repo of firstUserRepos) {
	// 	if(repo.CreatedDate) {
	// 		repo.CreatedYear = new Date(repo.CreatedDate).getFullYear().toString();
	// 		repo.CreatedMonth = repo.CreatedDate.substring(0,6);
	// 	}
	// }

	// firstUserRepos.sort((X: TimelineReposResult, Y: TimelineReposResult) => {
	// 	if(X.CreatedDate && Y.CreatedDate) {
	// 		return new Date(X.CreatedDate).getTime() - new Date(Y.CreatedDate).getTime();
	// 	}else return -1;
	// });

	// for(let repo of secondUserRepos) {
	// 	if(repo.CreatedDate) {
	// 		repo.CreatedYear = new Date(repo.CreatedDate).getFullYear().toString();
	// 		repo.CreatedMonth = repo.CreatedDate.substring(0,6);
	// 	}
	// }

	// secondUserRepos.sort((X: TimelineReposResult, Y: TimelineReposResult) => {
	// 	if(X.CreatedDate && Y.CreatedDate) {
	// 		return new Date(X.CreatedDate).getTime() - new Date(Y.CreatedDate).getTime();
	// 	}else return -1;
	// });

	// return [firstUserRepos, secondUserRepos];

	// let currentYear = null;
	// let i = 0, j = 0;
	// while(i < firstUserRepos.length || j < secondUserRepos.length) {
	// 	if(i == firstUserRepos.length) {

	// 	}else if(j == secondUserRepos.length) {

	// 	}else{
	// 		if(currentYear == null) {

	// 		}
	// 	}
	// }
}


function getFilterRepository(reposList: any, startFrom: any, totalReposRequired: any) {
	startFrom %= 30;
	let filterRepos = [];

	for(let [i, repos] of reposList.entries()) {
		if(i >= startFrom && i < (startFrom + totalReposRequired)) {
			filterRepos.push(repos);
		}
	}

	return filterRepos;
}

function getReposCreatedDate(parseData: any) {
	let filesData = getData(parseData, "div.Details-content--hidden-not-important.js-navigation-container.js-active-navigation-container.d-md-block > div > div.color-fg-muted.text-right > time-ago");

	let allFilesData = [];
	for(let item of filesData) allFilesData.push(clearString(item));
	return getOldestDateFromDateList(allFilesData);
}

function getOldestDateFromDateList(dateList: any) {
	dateList.sort((X: any, Y: any) => {
		return new Date(X).getTime() - new Date(Y).getTime();
	});
	return dateList[0];
}

function getMainBranchNameofRepos(parseData: any) {
	return getData(parseData, "#branch-select-menu > summary > span.css-truncate-target")[0];
}


function getReposLanguage(parseData: any, totalNeededLanguage: number) {

	let languageList = getData(parseData, "div > div.BorderGrid-row > div.BorderGrid-cell > ul.list-style-none > li > a > span");

	let languages = [];
	for(let index = 0; index<languageList.length && index < ((totalNeededLanguage * 2) - 1); index += 2) {
		languages.push({
			Name: clearString(languageList[index]),
			Parcentage: clearString(languageList[index + 1]),
		})
	}
	return languages;
}

/* Get Data using html selector from parse html */
function getData($: any, selector: string) {
	let userList: any = [];

	$(selector).each((index: number, element: any) => {
		userList.push(element.children[0].data);
	});

	return userList;
}