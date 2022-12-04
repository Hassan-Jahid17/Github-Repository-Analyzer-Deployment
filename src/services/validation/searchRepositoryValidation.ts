import Joi from "joi";


const searchRepositryBodyValidation = (queryObj: any) => {
	const schema = Joi.object({
		GithubHandle: Joi.string().required().min(1).label("Github Handle"),
		QueryText: Joi.string().min(0).label("Query Text"),
		QueryLanguage: Joi.string().min(0).label("Query Language"),
		QuerySearchStartIndex: Joi.number().required().min(0).label("Query Search Start Index"),
	})

	return schema.validate(queryObj);
}

export {
	searchRepositryBodyValidation,
}