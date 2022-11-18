import axios from 'axios';
import * as cheerio from "cheerio";
import { ceil, floor } from 'lodash';
import { clearString } from '../../services/shared/StringManipulation';
import { getRepositoryInfoFromRepositoriesTab } from '../../services/shared/repositoryScrape';
import { RepositoryItem, SearchRepositoryTimelineConfiguration } from '../../models/interfaces/SearchRepository';


export async function findRepositoryOfTwoUsers(users: SearchRepositoryTimelineConfiguration[],githubAuthToken: any) {
	
	console.log("Search Users is");
	console.log(users);

	let axiosList = [];

	const config = { 
		headers: {
			...(githubAuthToken !== null) && {Authorization: `token ${githubAuthToken}`}
		},
		timeout: 10000,
	};

	let response: any[] = [];
	let userRepos: RepositoryItem[] = [];

	try{
		for(let user of users) {
			axiosList.push(axios.get(`https://github.com/${user.UserName}?page=${ceil((user.StartFrom + 1)/30)}&tab=repositories`, config));
		}
	}catch(error: any) {
		console.log("Error occured When User Repository List Page Axios Pushing");
		//return userRepos;
	}

	
	try{
		response = await Promise.allSettled(axiosList);

		if(response?.length > 0) {
			for(const [index, item] of response?.entries()) {
				if(item?.status === "fulfilled" && item?.value?.status < 300 && item?.value?.data) {
					const parseData = cheerio.load(item?.value?.data);
					let reposList = getRepositoryInfoFromRepositoriesTab(parseData, users[index].UserName);
					let filterReposList = getFilterRepository(reposList, users[index].StartFrom, users[index].TotalRequiredRepos);
					userRepos = [...userRepos, ...filterReposList];
				}else{
					if(item.status === "rejected") {
						console.log(`When ==> ${users[index].UserName} <== Repository Page Fetch Error occured => ${item.reason.message}`);
					}
				}
			}
		}
	}catch(error: any) {
		console.log("Error occured When User Repository List Page Promise Resolved");
	}

	axiosList = [];
	
	try{
		for(let repo of userRepos) {
			axiosList.push(axios.get(`https://github.com/${repo?.UserName}/${repo?.Name}`, config));
		}
	}catch(error: any) {
		console.log("Error occured When User Repository Home Page Axios Pushing");
	}

	response = [];

	try{
		response = await Promise.allSettled(axiosList);

		if(response?.length > 0) {
			for(const [index, item] of response?.entries()) {
				if(item?.status === "fulfilled" && item?.value?.status < 300 && item?.value?.data) {
					const parseData = cheerio.load(item?.value?.data);
					
					const repositoryName = getRepositoryNameFromRepositoryHomePage(parseData);
					const repositoryAuthorName = getRepositoryAuthorFromRepositoryHomePage(parseData);
	
					const reposIndex = userRepos.findIndex(element => element.Name == repositoryName && element.UserName == repositoryAuthorName);
	
					userRepos[reposIndex].Languages = getReposLanguage(parseData, 4);
					userRepos[reposIndex].MainBrachName = getMainBranchNameofRepos(parseData);
				}else{
					if(item.status === "rejected") {
						console.log(`When User ==> ${userRepos[index].UserName} <== of ==> ${userRepos[index].Name} <== Repository Home Page Fetch Error occured => ${item.reason.message}`);
					}
				}
			}
		}

	}catch(error: any){
		console.log("Error occured When User Repository Home Page Promise Resolved");
	}

	await new Promise(r => setTimeout(r, 2000));


	try{

		axiosList = [];
		response = [];

		for(let repo of userRepos) {
			axiosList.push(axios.get(`https://github.com/${repo.UserName}/${repo.Name}/file-list/${repo.MainBrachName}`, config));
		}
	}catch(error: any){
		console.log("Error occured When User Repository File List Page Axios Pushing");
	}

	try{

		response = await Promise.allSettled(axiosList);

		if(response?.length > 0) {
			for(const [index, item] of response?.entries()) {
				if(item?.status === "fulfilled" && item?.value?.status < 300 && item?.value?.data) {
					const parseData = cheerio.load(item?.value?.data);
					userRepos[index].CreatedDate = getReposCreatedDate(parseData);
				}else{
					if(item.status === "rejected") {
						console.log(`When User ===> ${userRepos[index].UserName} <=== of Repository ===> ${userRepos[index].Name} <=== Repository File List Page Fetch Error occured => ${item.reason.message}`);
					}
				}
			}
		}

	}catch(error: any) {
		console.log("Error occured When User Repository File List Page Promise Resolved");
	}

	return userRepos;
}

export interface TimelineReposResult extends RepositoryItem {
	IsFristUsersRepos ?: boolean,
	IsSecondUsersRepos ?: boolean,
}

export function modifiedTimelineRepositories(reposList: RepositoryItem[], firstUserName: string, secondUserName: string) {
	let firstUserRepos = reposList.filter((item) => item.UserName == firstUserName);
	let secondUserRepos = reposList.filter((item) => item.UserName == secondUserName);



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
	return clearString(getData(parseData, "#branch-select-menu > summary > span.css-truncate-target")[0]);
}

function getRepositoryNameFromRepositoryHomePage(parseData: any) {
	return clearString(getData(parseData, "#repository-container-header > div > div > div > strong > a")[0]);
}

function getRepositoryAuthorFromRepositoryHomePage(parseData: any) {
	return clearString(getData(parseData, "#repository-container-header > div > div > div > span.author > a")[0]);
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