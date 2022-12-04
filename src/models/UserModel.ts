import { Provider, Roles } from "../const/User";
import { Schema, model } from "mongoose";
import { User } from "./interfaces/User";



const userSchema = new Schema<User>({
	UserName: {
		type: String,
		required: true,
	},
	Email: {
		type: String,
	},
	Password: {
		type: String,
	},
	Provider: {
		type: String,
		default: Provider.WEBSITE,
	},
	AvatarUrl: {
		type: String,
	},
	Roles: {
		type: [String],
		default: [Roles.USER],
	},
	CreatedDate: {
		type: Date,
		default: Date.now,
	}
});

const UserModel = model<User>("User", userSchema);

export {UserModel};