import vine, { errors } from "@vinejs/vine";
import { newSchema } from "../validations/newValidation.js";
import {
  imageValidator,
  removeImage,
  transformNewsApiResponse,
  uploadImage,
} from "../Utils/helper.js";
import prisma from "../config/db.js";
import redisCache from "../config/redis.js";
import logger from "../config/logger.js";

const index = async (req, res) => {
  try {
    let page = Number(req.query) || 1;
    let limit = Number(req.query.limit) || 10;

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
    logger.error(error?.message);
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

    const imageName = uploadImage(image);

    payload.image = imageName;
    payload.user_id = user.id;

    const news = await prisma.news.create({
      data: payload,
    });

    // remove cache
    redisCache.del("/api/news", (err) => {});

    return res.json({
      status: 200,
      message: "New created Successfully!",
      news,
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

const update = async (req, res) => {
  try {
    const id = req.params.id;

    const user = req.user;
    const body = req.body;

    let imageName = undefined;

    const news = await prisma.news.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (user.id !== news.user_id) {
      return res.status(401).json({ message: "UnAuthorized" });
    }

    const validator = vine.compile(newSchema);
    const payload = await validator.validate(body);
    const image = req?.files?.image;
    if (image) {
      const message = imageValidator(image?.size, image?.mimetype);
      if (message) {
        return res.status(400).json({
          errors: {
            image: message,
          },
        });
      }
      // upload new image
      imageName = uploadImage(image);
      payload.image = imageName;
      // delete image
      removeImage(news.image);
    }
    await prisma.news.update({
      where: {
        id: Number(id),
      },
      data: payload,
    });

    // remove cache
    redisCache.del("/api/news", (err) => {});
    return res.status(200).json({ message: "News updated Successfully!" });
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
    logger.error(error?.message);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

const destroy = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const news = await prisma.news.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (user.id !== news.user_id) {
      return res.status(401).json({ message: "UnAuthorized" });
    }

    // Delete image from filesystem
    removeImage(news.image);

    await prisma.news.delete({ where: { id: Number(id) } });
    // remove cache
    redisCache.del("/api/news", (err) => {});
    return res.json({ message: "News Deleted!" });
  } catch (error) {
    logger.error(error?.message);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong" });
  }
};

export { index, create, update, show, destroy };
