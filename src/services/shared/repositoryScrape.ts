import { RepositoryItem, RepositoryLanguage } from "../../models/interfaces/SearchRepository";
import * as cheerio from "cheerio";
import { clearString } from "./StringManipulation";


export function getRepositoryInfoFromRepositoriesTab($: any, user: string) {

	let repositoryList : RepositoryItem[] = [];

	$("#user-repositories-list > ul > li").each((index: number, element: any) => {		
		const parseElement = cheerio.load(element);
		let repository = {} as RepositoryItem;
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
			if(!repository.Languages) repository.Languages = [];
			repository.Languages.push({
				Name: clearString(value.children[0].data),
				Parcentage: null,
			})
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


export function getRepositoryInfoFromRepositoriesPage($: any, repository: RepositoryItem) {
	repository.Languages = [];
	$("div > div.BorderGrid-row > div.BorderGrid-cell > ul.list-style-none > li > a > span").each((index: number, value: any) => {
		if(!repository.Languages) repository.Languages = [];
		if(index%2) {
			repository.Languages[repository.Languages.length - 1].Parcentage = clearString(value);
		}else{
			repository.Languages.push({} as RepositoryLanguage);
			repository.Languages[repository.Languages.length - 1].Name = clearString(value);
		}
	})
}