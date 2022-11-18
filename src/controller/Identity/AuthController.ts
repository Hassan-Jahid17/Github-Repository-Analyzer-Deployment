import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from 'express';
import { UserModel } from "../../models/UserModel";
import { User } from "../../models/interfaces/User";
import { loginValidation, signUpValidation } from "../../services/validation/authValidation";
import { generateAccessToken, generateRefreshToken } from "../../services/JwtTokenService";
import { UserTokenModel } from "../../models/UserTokenModel";
import { addMinutes } from "date-fns";
import { Provider } from "../../const/User";


async function signup(req: Request, res: Response, next: NextFunction) {

	console.log("/api/identity/signup");

	const userData = req.body;
	console.log(req.headers);
	
	try{
		const {error} = signUpValidation(userData);

		if(error) {
			return next(createHttpError(400, error.details[0].message));
		}
	
		const user = await UserModel.findOne({
			UserName: userData.UserName,
			Provider: Provider.WEBSITE
		})
	
		if(user) {
			return next(createHttpError(400, "User with given UserName already exist"))
		}

	
		const salt = await bcrypt.genSalt(Number(process.env.PASSWORD_SALT));
		const hashPassword = await bcrypt.hash(userData.Password, salt);
	
		const saveData = await new UserModel({...userData, Password: hashPassword}).save();
	
		res.status(201).json({
			message: "Account created sucessfully",
			data: saveData,
		})
	}catch(err) {
		console.log(err);
		return next(createHttpError(500, {
			error: true,
			message: "Internal Server Error"
		}))
	}
}


async function login(req: Request, res: Response, next: NextFunction) {

	console.log("/api/identity/login");
	const userLoginData: User = req.body;
	console.log(userLoginData);
	res.sendStatus(401);

	try {
		const {value, error} = loginValidation(userLoginData);

		if(error) {
			return next(createHttpError(400, error.details[0].message));
		}
	
		const user = await UserModel.findOne({
			UserName: userLoginData.UserName,
			Provider: Provider.WEBSITE
		});

		console.log("User is");
		console.log(user);

		if(!user) {
			return next(createHttpError(401, "Invalid UserName or password"));
		}
	
		const isVerifiedPassword = await bcrypt.compare(
			userLoginData.Password,
			user.Password
		);
	
		if(!isVerifiedPassword) {
			return next(createHttpError(401, "Invalid UserName or password"));
		}
	
		const accessToken = generateAccessToken({
			Email: user.Email,
			UserName: user.UserName,
			Provider: user.Provider,
			AvatarUrl: user.AvatarUrl,
			Roles: user.Roles
		});

		console.log(accessToken);
	
		const refreshToken = generateRefreshToken();
		const refreshTokenExpireTime = process.env.REFRESH_TOKEN_EXPIRY_TIME as unknown;
		await UserTokenModel.updateOne(
			{UserId : user._id},
			{$set : {
				RefreshToken: refreshToken,
				RefreshTokenExpiryTime: addMinutes(Date.now(), (refreshTokenExpireTime as number))
			}},
			{upsert: true}
		);
	
		res.status(200).json({
			AccessToken: accessToken,
			RefreshToken: refreshToken,
			message: "Logged in sucessfully",
		});
	}catch(err) {
		console.log(err);
		return next(createHttpError(500, "Internal Server Error"));
	}
}


export {
	signup,
	login,
}

