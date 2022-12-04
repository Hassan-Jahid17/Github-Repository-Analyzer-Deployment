
import { Provider } from '../const/User';
import { Request, Response, NextFunction } from 'express';
import _ from "lodash";
import { User } from '../models/interfaces/User';
import { UserToken } from '../models/interfaces/UserToken';
import { UserModel } from '../models/UserModel';
import { UserTokenModel } from '../models/UserTokenModel';
import { getClaimsFromToken } from '../services/JwtTokenService';


async function githubAccessToken(req: Request, res: Response, next: NextFunction) {

	try{
		if(req.headers.authorization === undefined) {
			return next();
		}
	
		if(req.headers.GithubAccessToken) {
			return next();
		}
	
		const token: string = _.split(req.headers.authorization, ' ')[1];
	
		if(!token) return next();
	
		const claims = getClaimsFromToken(token);
		
		if(!claims || !claims.UserName) {
			return next();
		}
	
		const user = await UserModel.findOne<User>({
			UserName: claims?.UserName,
			Provider: Provider.GITHUB
		});
	
		if(!user || !user.UserName || !user._id) {
			return next();
		}
	
		const userTokenInfo = await UserTokenModel.findOne<UserToken>({
			UserId: user?._id,
		});
	
		if(userTokenInfo && userTokenInfo.GithubAccessToken) {
			req.headers.GithubAccessToken = userTokenInfo?.GithubAccessToken;
		}
	}catch(error: any) {
		console.log("Error occured When Get Github Access Token");
	}

	return next();
}

export {
	githubAccessToken,
}