import express, { Application, Request, Response } from "express";
import cors from "cors";
import { userRoutes } from "./app/modules/User/user.route";

const app: Application = express();

app.use(cors());

app.use("/api/v1/user", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "PH Health Care Server is running",
  });
});

export default app;
