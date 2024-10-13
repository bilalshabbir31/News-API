import vine, { errors } from "@vinejs/vine";
import { newSchema } from "../validations/newValidation.js";
import { generatedRandomNumber, imageValidator } from "../Utils/helper.js";
import prisma from "../config/db.js";

const index = async (req, res) => {};

const create = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;
    const validator = vine.compile(newSchema);
    const payload = await validator.validate(body);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ errors: { image: "Image field is required." } });
    }

    const image = req.files?.image;
    const message = imageValidator(image?.size, image?.mimetype);

    if (message) {
      return res.status(400).json({ errors: { image: message } });
    }

    const imgExt = image?.name.split(".");
    const imageName = generatedRandomNumber() + "." + imgExt[imgExt.length - 1];
    const uploadPath = process.cwd() + "/public/images/" + imageName;
    image.mv(uploadPath, (err) => {
      if (err) throw err;
    });

    payload.image = imageName;
    payload.user_id = user.id;

    const news = await prisma.news.create({
      data: payload,
    });

    return res.json({
      status: 200,
      message: "New created Successfully!",
      news,
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

const update = async (req, res) => {};

const show = async (req, res) => {};

const destroy = async (req, res) => {};

export { index, create, update, show, destroy };
