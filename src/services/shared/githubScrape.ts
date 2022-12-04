import axios from 'axios';
import * as cheerio from "cheerio";
import { clearString } from './StringManipulation';



interface GithubUser {
	userId: string,
	followingCount: number,
	RepositoryCount: number,
}


/* Get Data using html selector from parse html */
function getData($: any, selector: string) {
	let userList: any = [];

	$(selector).each((index: number, element: any) => {
		userList.push(element.children[0].data);
	});

	return userList;
}


/* Get number of Following User that a specific User follow to */
export async function getUserGithubInfo(users: string[], githubAuthToken: string | null = null) {
	let axiosList = [];

	console.log("Start getUserGithubInfo");
	console.log(githubAuthToken);

	const config = { 
		headers: {
			...(githubAuthToken !== null) && {Authorization: `token ${githubAuthToken}`},
		},
		timeout: 6000,
	};

	for(const user of users) {
		axiosList.push(axios.get(`https://github.com/${user}`, config))
	}

	let response: any[] = [];

	try{
		response = await Promise.allSettled(axiosList);
	}catch(error) {
		console.log("Api call Error occured When GithubUserinfo Page fetch");
	}

	let infoList: GithubUser[] = [];
	for(const [index, item] of response?.entries()) {
		if(item?.status === "fulfilled" && item?.value?.status < 300 && item?.value?.data) {
			const parseData = cheerio.load(item?.value?.data);
			let followingCount = getData(parseData, "div.mb-3 > a.Link--secondary:nth-child(2) > span")[0];
			if(!followingCount) followingCount = 0;
			let repositoryCount = getData(parseData, "div.Layout-main > div > nav > a > span")[0];
			if(!repositoryCount) repositoryCount = 0;
			infoList.push({
				userId : users[index],
				followingCount: parseInt(followingCount) || 0,
				RepositoryCount: parseInt(repositoryCount) || 0,
			})
		}else{
			infoList.push({
				userId : users[index],
				followingCount: 0,
				RepositoryCount: 0,
			});
			if(item.status === "rejected") {
				console.log(`When ${users[index]} Info Fetch, Error Occured => Reason is ${item.reason.message}`);
			}
		}
	}

	console.log("End getUserGithubInfo");

	return infoList;
}


/* Get all Following user of a Specific User */
export async function getAllFollowingUser(users: GithubUser[], githubAuthToken: string | null = null) {
	let axiosList = [];

	console.log("Start => getAllFollowingUser");

	const config = { 
		headers: {
			...(githubAuthToken !== null) && {Authorization: `token ${githubAuthToken}`},
		},
		timeout: 10000,
	};

	try{
		for(const user of users) {
			const numberOfFollowingUser = user.followingCount;
			const userId = user.userId;
			for(let i = 1; i<= ((numberOfFollowingUser + 50 - 1) / 50); i++) {
				axiosList.push(axios.get(`https://github.com/${userId}?page=${i}&tab=following`, config));
			}
		}
	}catch(error: any) {
		console.log("Error occured When User Following List Page Axios Pushing");
	}

	let response: any[] = [];
	let followingUser: any[] = [];

	try{
		response = await Promise.allSettled(axiosList);

		for(const [index, item] of response.entries()) {
			if(item?.status === "fulfilled" && item?.value?.status < 300 && item?.value?.data) {
				const parseData = cheerio.load(item?.value?.data);

				let val = getData(parseData, "a > span.Link--secondary");
				for(let user of val) {
					followingUser.push(clearString(user));
				}
			}else{
				if(item.status === "rejected") {
					console.log(`When ==> ${users[index].userId} <== Following List Page Fetch Error occured => ${item.reason.message}`);
				}
			}
		}

	}catch(error: any) {
		console.log("Error occured When User Following List Page Promise Resolved");
	}

	return followingUser;
}