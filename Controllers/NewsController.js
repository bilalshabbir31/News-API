import vine, { errors } from "@vinejs/vine";
import { newSchema } from "../validations/newValidation.js";
import {
  generatedRandomNumber,
  imageValidator,
  transformNewsApiResponse,
} from "../Utils/helper.js";
import prisma from "../config/db.js";

const index = async (req, res) => {
  try {
    let page = Number(req.query) || 1;
    let limit = Number(req.query.limit) || 1;

    if (page <= 0) {
      page = 1;
    }

    if (limit <= 0 || limit > 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    const news = await prisma.news.findMany({
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });
    const newsTransform = news?.map((item) => transformNewsApiResponse(item));

    const totalNews = await prisma.news.count();
    const totalPages = Math.ceil(totalNews / limit);

    return res.json({
      status: 200,
      news: newsTransform,
      meta: {
        totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong" });
  }
};

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

const show = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await prisma.news.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });

    const transformedNews = news ? transformNewsApiResponse(news) : null;

    return res.json({ status: 200, news: transformedNews });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

const destroy = async (req, res) => {};

export { index, create, update, show, destroy };
