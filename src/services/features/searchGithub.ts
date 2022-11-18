import axios from 'axios';
import * as cheerio from "cheerio";
import { SearchRepositoryConfiguration, SearchRepositoryItem, SearchRepositoryQuery, SearchRepositoryResult } from '../../models/interfaces/SearchRepository';
import { clearString } from '../../services/shared/StringManipulation';


export async function findRepositoryByQuery(queryObj: SearchRepositoryConfiguration, users: string[], githubAuthToken: string | null = null): Promise<SearchRepositoryResult> {
	const searchText = queryObj.SearchText;
	const searchLanguage = queryObj.SearchLanguage;
	const isLoggedIn = queryObj.IsLoggedIn;
	const pageSearchPerApiCall = queryObj.PageSearchPerApiCall;
	const waitBetweenApiCall = queryObj.WaitBetweenApiCall;
	const minDesireRepository = queryObj.MinDesireRepository;
	const totalTimeoutForApiCall = queryObj.TotalTimeoutForApiCall;
	const totalPageSearchPerApiCall = queryObj.TotalPageSearchPerApiCall;
	

	console.log(queryObj);
	console.log(githubAuthToken);

	let axiosList = [];

	const config = { 
		headers: {
			...(githubAuthToken !== null) && {Authorization: `token ${githubAuthToken}`}
		},
		timeout: totalTimeoutForApiCall,
	};


	let searchQueryResult = {} as SearchRepositoryResult;
	searchQueryResult.ReposResult = [];

	for(let i = queryObj.SearchStartIndex; i < users.length; i++) {
		const user = users[i];
		
		try{
			axiosList.push(axios.get(`https://github.com/${user}?tab=repositories&q=${searchText}&type=&language=${searchLanguage}&sort=`, config));
		}catch(error: any) {
			console.log(`Error occured When User ==> ${user} <== Search Repository Page Axios Pushing`);
		}

		if((i + 1)%pageSearchPerApiCall === 0 || i === (users.length - 1)) {

			console.log(i + 1, "Start Crawling==============>");
			await new Promise(r => setTimeout(r, waitBetweenApiCall));

			let response: any[] = [];
			try{
				response = await Promise.allSettled(axiosList);
				if(response?.length > 0) {
					for(const [index, item] of response?.entries()) {
						if(item?.status === "fulfilled" && item?.value?.status < 300 && item?.value?.data) {
							const parseData = cheerio.load(item?.value?.data);
							searchQueryResult.ReposResult = [...searchQueryResult.ReposResult, ...getRepositoryInfo(parseData, users[index])];
						}else{
							if(item.status === "rejected") {
								console.log(`When ==> ${user} <== Search Repository Page Fetch Error occured => ${item.reason.message}`);
							}
						}
					}
				}
			}catch(error: any) {
				console.log("Error occured When Search Repository Page Promise Resolved");
			}


			console.log("End Search Api");

			axiosList = [];

			if(i === (users.length - 1)) {
				searchQueryResult.HasMoreUserToSearch = false;
				break;
			}
			if(searchQueryResult.ReposResult.length >= minDesireRepository) {
				searchQueryResult.HasMoreUserToSearch = true;
				searchQueryResult.UserSearchDoneCount = i + 1;
				break;
			}

			if((i - queryObj.SearchStartIndex + 1) >= totalPageSearchPerApiCall) {
				searchQueryResult.HasMoreUserToSearch = true;
				searchQueryResult.UserSearchDoneCount = i + 1;
				break;
			}
		}
	}
	
	return searchQueryResult;
}


export function getRepositoryInfo($: any, user: string) {

	let repositoryList : SearchRepositoryItem[] = [];

	$("#user-repositories-list > ul > li").each((index: number, element: any) => {		
		const parseElement = cheerio.load(element);
		let repository = {} as SearchRepositoryItem;
		repository.UserName = user;

		parseElement("div > div > h3 > a").each((index: number, value: any) => {
			repository.Name = clearString(value.children[0].data);
		});

		parseElement("div > div > span > a").each((index: number, value: any) => {
			repository.ForkName = clearString(value.children[0].data);
		})

		parseElement("div > div:nth-child(2) > p").each((index: number, value: any) => {
			repository.Description = clearString(value.children[value.children.length - 1].data);
		})

		parseElement("div > div.f6.color-fg-muted.mt-2 > span > span:nth-child(2)").each((index: number, value: any) => {
			repository.Language = clearString(value.children[0].data);
		})

		parseElement("div > div.f6.color-fg-muted.mt-2 > a:nth-child(2)").each((index: number, value: any) => {
			repository.Star = clearString(value.children[value.children.length - 1].data);
		})

		parseElement("div > div.f6.color-fg-muted.mt-2 > a:nth-child(3)").each((index: number, value: any) => {
			repository.Fork = clearString(value.children[value.children.length - 1].data);
		})

		parseElement("div > div.f6.color-fg-muted.mt-2 > relative-time").each((index: number, value: any) => {
			repository.ModifiedDate = clearString(value.children[value.children.length - 1].data);
		})

		repositoryList.push(repository);
	});


	return repositoryList;
}