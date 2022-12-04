import mongoose, { mongo, connect } from "mongoose";

const dbConnect = () => {
	try{
		const connectionParams = {
			useNewUrlParser: true,
			useUnifiedTopology: true
		};
	
		connect(`${process.env.MONGO_CONNECTION_STRING}`);
	
		mongoose.connection.on("error", (error) => {
			console.log("Error while connecting to database :" + error);
		});
	
		mongoose.connection.on("disconnected", () => {
			console.log("Mongodb connection disconnected");
		});
	}catch(error) {
		console.log("Error occure when database connection");
	}
}

export default dbConnect;