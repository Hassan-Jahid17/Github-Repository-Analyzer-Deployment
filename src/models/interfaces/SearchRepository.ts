

export interface SearchRepositoryQuery{
	text: string,
	language?: string,
}

export interface RepositoryLanguage {
	Name: string,
	Parcentage ?: string | null,
}

export interface RepositoryItem {
	Name: string,
	UserName: string,
	ForkName ?: string,
	Description ?: string,
	Star ?: string,
	Fork ?: string,
	ModifiedDate ?: string,
	CreatedDate ?: string,
	Languages ?: RepositoryLanguage[],
	MainBrachName ?: string,
}

export interface SearchRepositoryItem{
	Name: string,
	UserName: string,
	ForkName?: string,
	Description ?: string,
	Language ?: string,
	Star ?: string,
	Fork ?: string,
	ModifiedDate ?: string,
}

export interface SearchRepositoryConfiguration {
	SearchText: string,
	SearchLanguage?: string,
	IsLoggedIn?: boolean,
	PageSearchPerApiCall: number,
	TotalPageSearchPerApiCall: number,
	WaitBetweenApiCall: number,
	MinDesireRepository: number,
	TotalTimeoutForApiCall: number,
	SearchStartIndex: number,
}

export interface SearchRepositoryTimelineConfiguration {
	UserName: string,
	RepositoryCount: number,
	StartFrom: number,
	TotalRequiredRepos: number,
}

export interface SearchRepositoryResult {
	ReposResult: SearchRepositoryItem[],
	UserSearchDoneCount: number,
	HasMoreUserToSearch: boolean,
}

