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
			console.log("error occured When axios push ====> " + user);
		}

		if((i + 1)%pageSearchPerApiCall === 0 || i === (users.length - 1)) {

			console.log(i + 1, "Start Crawling==============>");
			await new Promise(r => setTimeout(r, waitBetweenApiCall));

			let response: any[] = [];
			try{
				response = await Promise.all(axiosList);
			}catch(error: any) {
				console.log(error);
      			console.log(error.response);
				//console.log("error occured =====> " + user);
			}

			// for(let j = 0; j< 100; j++) {
			// 	if(response[j] && !response[j]?.status) {
			// 		console.log(j);
			// 	}
			// }
			//console.log(Object.keys(response[0].status));
			// console.log(response[0]?.status);
			// for(let j: number = 0; j<crawlCount; j++) {
			// 	if(response[j]?.status !== 200) {
			// 		console.log(`Error =========> ${i - crawlCount + j} ====== ${j}`);
			// 	}else console.log(`Success --------> ${i - crawlCount + j} =====> ${response[j]?.status}`)
			// }

			if(response?.length > 0) {
				for(const [index, item] of response?.entries()) {
					const parseData = cheerio.load(item.data);
					searchQueryResult.ReposResult = searchQueryResult.ReposResult.concat(getRepositoryInfo(parseData, users[index]));
				}
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