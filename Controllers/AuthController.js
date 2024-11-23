import prisma from "../config/db.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import logger from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/sendEmailJob.js";

const register = async (req, res) => {
  try {
    const body = req.body;
    const validator = vine.compile(registerSchema); // used for the validation purpose
    const payload = await validator.validate(body);

    // Check if email exist

    const findUser = await prisma.users.findUnique({
      where: { email: payload.email },
    });

    if (findUser) {
      return res.status(400).json({
        errors: {
          email: "Email Already taken. please choose another one.",
        },
      });
    }

    // Encrypt Password
    const salt = bcrypt.genSaltSync(10);
    payload.password = bcrypt.hashSync(payload.password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    payload.confirmToken = otp;

    const user = await prisma.users.create({
      data: payload,
    });

    // send account registeration email.
    const email = [
      {
        toEmail: payload.email,
        subject: "Confirm Your News API Account",
        body: `<p>Hi ${payload.name},</p>
               <p>Your News API account has been created successfully.</p>
               <p>Please confirm your account using the following OTP: <strong>${otp}</strong></p>`,
      },
    ];

    // Exclude sensitive fields
    const { password, confirmToken, ...safeUserData } = user;

    await emailQueue.add(emailQueueName, email);

    return res.json({
      status: 200,
      message: "User created successfully",
      user: safeUserData,
    });
  } catch (error) {
    logger.error(error?.message);
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return res.status(400).json({ errors: error.messages });
    } else {
      return res
        .status(500)
        .json({ status: 500, message: "Something went wrong" });
    }
  }
};

const login = async (req, res) => {
  try {
    const body = req.body;
    const validator = vine.compile(loginSchema);
    const payload = await validator.validate(body);

    const findUser = await prisma.users.findUnique({
      where: { email: payload.email },
    });
    if (findUser) {
      if (!findUser.isConfirmed) {
        return res.status(403).json({
          errors: {
            message: "Please Confirm your Account.",
          },
        });
      }
      if (!bcrypt.compareSync(payload.password, findUser.password)) {
        return res.status(400).json({
          errors: {
            email: "Password is incorrect.",
          },
        });
      }

      // generate token
      const payloadData = {
        id: findUser.id,
        email: findUser.email,
        name: findUser.name,
      };

      const token = jwt.sign(payloadData, process.env.JWT_SECERT, {
        expiresIn: "1d",
      });

      return res.json({
        message: "Logged In",
        access_token: `Bearer ${token}`,
      });
    } else {
      return res.status(400).json({
        errors: {
          email: "Email or Password is incorrect.",
        },
      });
    }
  } catch (error) {
    logger.error(error?.message);
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return res.status(400).json({ errors: error.messages });
    } else {
      return res
        .status(500)
        .json({ status: 500, message: "Something went wrong" });
    }
  }
};

// testing email
const sendTestEmail = async (req, res) => {
  try {
    const email = req.query.email;

    const payload = [
      {
        toEmail: email,
        subject: "Hey I am just testing",
        body: "<h1> I am from Bilal </h1>",
      },
      {
        toEmail: email,
        subject: "Hey I am just testing 1111111111111",
        body: "<h1> I am from Bilal </h1>",
      },
      {
        toEmail: email,
        subject: "Hey I am just testing 22222222222222222222",
        body: "<h1> Bilal </h1>",
      },
    ];

    await emailQueue.add(emailQueueName, payload);

    return res.json({ status: 200, message: "Job added Successfully!" });
  } catch (error) {
    logger.error({ type: "Email Error", body: error });
    return res.status(500).json({ message: "Something went Wrong!" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.confirmToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.users.update({
      where: { email },
      data: { isConfirmed: true, confirmToken: null },
    });

    

    return res.json({
      status: 200,
      message: "Account verified successfully.",
    });
  } catch (error) {
    logger.error(error?.message);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong" });
  }
};


export { register, login, sendTestEmail, verifyOtp };
