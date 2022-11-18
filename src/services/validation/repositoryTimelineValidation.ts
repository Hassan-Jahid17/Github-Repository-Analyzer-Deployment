import Joi from "joi";


const repositoryTimelineBodyValidation = (queryObj: any) => {
	const schema = Joi.array().items(
		Joi.object({
			UserName: Joi.string().required().min(1).label("Github Handle"),
			StartFrom: Joi.number().required().min(0).label("Repo Start Index"),
		}),
		Joi.object({
			UserName: Joi.string().required().min(1).label("Github Handle"),
			StartFrom: Joi.number().required().min(0).label("Repo Start Index"),
		})
	);

	return schema.validate(queryObj);
}

export {
	repositoryTimelineBodyValidation,
}