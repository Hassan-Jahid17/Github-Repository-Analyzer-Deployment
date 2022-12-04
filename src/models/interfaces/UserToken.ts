import { Types } from "mongoose"

export interface UserToken {
	_id: Types.ObjectId
	UserId: Types.ObjectId,
	RefreshToken: string,
	GithubAccessToken: string,
	RefreshTokenExpiryTime: Date,
}