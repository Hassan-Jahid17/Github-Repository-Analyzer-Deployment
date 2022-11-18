import { getTime } from "date-fns";
import { addMinutes } from "date-fns";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from 'express';
import { validaionForRefreshToken } from "../../services/validation/authValidation";
import { generateAccessToken, generateRefreshToken, getClaimsFromToken } from "../../services/JwtTokenService";
import { TokenPayload } from "../../models/interfaces/TokenPayload";
import { UserModel } from "../../models/UserModel";
import { UserTokenModel } from "../../models/UserTokenModel";
import { User } from "../../models/interfaces/User";
import { UserToken } from "../../models/interfaces/UserToken";


async function refresh(req: Request, res: Response, next: NextFunction) {

	console.log("/api/identity/refresh");

	try{
		const {error} = validaionForRefreshToken(req.body);
		if(error) {
			return next(createHttpError(400, error.details[0].message));
		}
	
		const claims  = getClaimsFromToken(req.body.AccessToken);

	
		if(!claims || !claims.UserName) {
			return next(createHttpError(400, "Token Not Valid"));
		}
	
		const user = await UserModel.findOne<User>({
			UserName: claims.UserName
		});

		
		if(!user || !user._id) {
			return next(createHttpError(400, "Token not Valid. User Not Found"));
		}
	
		const userTokenInfo = await UserTokenModel.findOne<UserToken>({
			UserId: user._id,
		});


		if(!userTokenInfo || !userTokenInfo.RefreshToken || userTokenInfo.RefreshToken !== req.body.RefreshToken || getTime(userTokenInfo.RefreshTokenExpiryTime) <= getTime(Date.now()) ) {
			return next(createHttpError(400, "Invalid Client Request"));
		}

		const accessToken = generateAccessToken({
			Email: user.Email,
			UserName: user.UserName,
			Provider: user.Provider,
			AvatarUrl: user.AvatarUrl,
			Roles: user.Roles
		});

		const refreshToken = generateRefreshToken();
	
		await UserTokenModel.updateOne<UserToken>(
			{UserId : user._id},
			{$set : {
				RefreshToken: refreshToken
			}},
			{upsert: true}
		);
	
		res.status(200).json({
			AccessToken: accessToken,
			RefreshToken: refreshToken,
			message: "AccessToken Refresh Successfully",
		});
	}catch(err) {
		console.log(err);
		return next(createHttpError(500, {
			error: true,
			message: "Internal Server Error ",
		}))
	}
}


export {
	refresh,
}