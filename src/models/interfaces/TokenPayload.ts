import { Provider, Roles } from "../../const/User";

export interface TokenPayload {
	UserName: string,
	Email: string,
	Provider: Provider,
	AvatarUrl: string,
	Roles: string[],
}