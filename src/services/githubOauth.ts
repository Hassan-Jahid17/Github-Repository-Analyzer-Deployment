import { Provider, Roles } from "../const/User";
import { TokenPayload } from "../models/interfaces/TokenPayload";

const getGithubUserModel = (data: any) => {
	return {
		UserName: data.login,
		Id: data.id,
		NodeId: data.node_id,
		AvatarUrl: data.avatar_url,
		GravatarId: data.gravatar_id,
		ApiUrl: data.url,
		WebsiteUrl: data.html_url,
		FollowersApiUrl: data.followers_url,
		FollowingApiUrl: data.following_url,
		GistsUrl: data.gists_url,
		StarredApiUrl: data.starred_url,
		SubscriptionsApiUrl: data.subscriptions_url,
		OrganizationsApiUrl: data.organizations_url,
		RepostoryApiUrl: data.repos_url,
		EventApiUrl: data.events_url,
		ReceivedEventsApiUrl: data.received_events_url,
		UserType: data.type,
		IsSiteAdmin: data.site_admin,
		Name: data.name,
		Company: data.company,
		Blog: data.blog,
		Location: data.location,
		Email: data.email,
		Hireable: data.hireable,
		Bio: data.bio,
		TwitterUsername: data.twitter_username,
		PublicRepos: data.public_repos,
		PublicGists: data.public_gists,
		Followers: data.followers,
		Following: data.following,
		CreatedDate: data.created_at,
		UpdatedDate: data.updated_at,
	}
}

const getUserClaimsFromGithubUser = (data: any) : TokenPayload => {
	data = getGithubUserModel(data);

	return {
		UserName: data.UserName,
		Email: data.Email,
		AvatarUrl: data.AvatarUrl,
		Provider: Provider.GITHUB,
		Roles: [Roles.USER],
	} as TokenPayload;
}



export {
	getUserClaimsFromGithubUser
}