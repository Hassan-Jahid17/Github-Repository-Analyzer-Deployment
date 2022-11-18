import axios from 'axios';
import * as cheerio from "cheerio";



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

	console.log("start");

	const config = { 
		headers: {
			...(githubAuthToken !== null) && {Authorization: `token ${githubAuthToken}`},
		}
	};

	for(const user of users) {
		axiosList.push(axios.get(`https://github.com/${user}`, config))
	}

	const response = await Promise.all(axiosList);

	console.log("end");

	let infoList: GithubUser[] = [];
	for(const [index, item] of response.entries()) {
		const parseData = cheerio.load(item.data);
		let followingCount = getData(parseData, "div.mb-3 > a.Link--secondary:nth-child(2) > span")[0];
		if(!followingCount) followingCount = 0;
		let repositoryCount = getData(parseData, "div.Layout-main > div > nav > a > span")[0];
		if(!repositoryCount) repositoryCount = 0;
		infoList.push({
			userId : users[index],
			followingCount: parseInt(followingCount),
			RepositoryCount: parseInt(repositoryCount),
		})
	}

	return infoList;
}


/* Get all Following user of a Specific User */
export async function getAllFollowingUser(users: GithubUser[], githubAuthToken: string | null = null) : Promise<string[]> {
	let axiosList = [];

	console.log("Start => getAllFollowingUser");

	const config = { 
		headers: {
			...(githubAuthToken !== null) && {Authorization: `token ${githubAuthToken}`},
		}
	};

	for(const user of users) {
		const numberOfFollowingUser = user.followingCount;
		const userId = user.userId;
		for(let i = 1; i<= ((numberOfFollowingUser + 50 - 1) / 50); i++) {
			axiosList.push(axios.get(`https://github.com/${userId}?page=${i}&tab=following`, config));
		}
	}

	const response = await Promise.all(axiosList);

	let followingUser = [];
	for(const [index, item] of response.entries()) {
		let val = getData(cheerio.load(item.data), "a > span.Link--secondary");
		followingUser.push(...val);
	}

	return followingUser;
}