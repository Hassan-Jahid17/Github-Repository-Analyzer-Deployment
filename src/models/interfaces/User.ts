import { Types } from "mongoose";
import { Provider } from "../../const/User";

export interface User {
	_id: Types.ObjectId,
	UserName: string,
	Email: string,
	Password: string,
	Provider: Provider,
	AvatarUrl: string,
	Roles: string[],
	CreatedDate: Date,
	UpdateDate: Date,
}