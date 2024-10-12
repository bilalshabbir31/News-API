import prisma from "../config/db.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";

const register = async (req, res) => {
  try {
    const body = req.body;
    const validator = vine.compile(registerSchema); // used for the validation purpose
    const payload = await validator.validate(body);

    // Check if email exist

    const findUser = await prisma.users.findUnique({
      where: { email: payload.email }
    });

    if (findUser) {
      return res.status(400).json({errors: {
        email: "Email Already taken. please choose another one."
      }})
    }

    // Encrypt Password
    const salt = bcrypt.genSaltSync(10);
    payload.password = bcrypt.hashSync(payload.password, salt);
    const user = await prisma.users.create({
      data: payload,
    });
    return res.json({
      status: 200,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return res.status(400).json({ errors: error.messages });
    } else {
      return res
        .status(500)
        .json({ status: 500, message: "Something went wrong" });
    }
  }
};

export { register };
