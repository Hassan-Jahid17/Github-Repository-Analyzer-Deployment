import express from "express";
import dbConnect from "./database/connection/dbConnect";
import { errorHandler, notFoundHandler } from "./middlewares/shared/errorHandler";
import router from "./router/route";
import cors from "cors";
import path from "path";
import { config } from "./config/config";

const app = express();

// database connection
dbConnect();

//handing cors
app.use(cors({
	origin: [
		"http://localhost:3000",
		"http://localhost:3001",
		"https://githubrepositoryanalysis.herokuapp.com/"
	]
}))

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Define Router
app.use('/', router);


app.use(express.static('build'));
app.get('*', (req: any, res: any) => {
	res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
})


// 404 not found handler
app.use(notFoundHandler);

// // common error handler
app.use(errorHandler);

app.listen(config.server.port, () => {
	console.log(`app listening to port ${process.env.PORT}`);
});