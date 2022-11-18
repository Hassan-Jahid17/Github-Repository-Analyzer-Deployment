import Joi from "joi";
import { User } from "../../models/interfaces/User";
import { UserToken } from "../../models/interfaces/UserToken";


const signUpValidation = (userModel: User) => {
	const schema = Joi.object({
		UserName: Joi.string().required().label("User Name"),
		Email: Joi.string().email().label("Email"),
		Password: Joi.string().min(4).max(8).required().label("Password"),
	})

	return schema.validate(userModel);
}

const loginValidation = (userModel: User) => {
	const schema = Joi.object({
		UserName: Joi.string().required().label("User Name"),
		Email: Joi.string().email().label("Email"),
		Password: Joi.string().min(4).max(8).required().label("Password"),
	});

	return schema.validate(userModel);
}


const validaionForRefreshToken = (tokenModel: UserToken) => {
	const schema = Joi.object({
		AccessToken: Joi.string().required().label("AccessToken"),
		RefreshToken: Joi.string().required().label("RefreshToken")
	});

	return schema.validate(tokenModel);
}


export {
	signUpValidation,
	loginValidation,
	validaionForRefreshToken,
}