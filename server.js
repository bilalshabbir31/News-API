import express from "express";
import "dotenv/config";

const app = express()
const PORT = process.env.PORT || 8080


app.get('/', (req, res) => {
  res.status(200).send({message: "Hello bilal" })
})

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));