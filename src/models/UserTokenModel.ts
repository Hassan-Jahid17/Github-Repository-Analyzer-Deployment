import { Schema, model } from "mongoose";
import { UserToken } from "./interfaces/UserToken";



const userTokenSchema = new Schema<UserToken>({
	UserId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	RefreshToken: {
		type: String,
		required: true,
	},
	GithubAccessToken: {
		type: String,
	},
	RefreshTokenExpiryTime: {
		type: Date,
		default: Date.now,
		required: true,
	},
});

const UserTokenModel = model<UserToken>("UserToken", userTokenSchema);

export {UserTokenModel};