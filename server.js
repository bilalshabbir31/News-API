import express from "express";
import "dotenv/config";
import fileUpload from "express-fileupload";
import authRouter from "./Routes/authRoute.js";
import profileRouter from "./Routes/profileRoute.js";

const app = express()
const PORT = process.env.PORT || 8080

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.status(200).send({message: "Hello bilal" })
});

app.use('/api', authRouter);
app.use('/api', profileRouter);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));