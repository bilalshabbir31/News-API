import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const supportedMimes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/svg",
  "image/gif",
  "image/webp",
];

export const imageValidator = (size, mime) => {
  if (bytesToMB(size) > 2) {
    return "Image size must be less than 2 MB";
  } else if (!supportedMimes.includes(mime)) {
    return "Image must type of png, jpg, jpeg, svg, gif, webp";
  }
};

export const bytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generatedRandomNumber = () => {
  return uuidv4();
};

const getImageUrl = (imageName) => {
  return `${process.env.APP_URL}/images/${imageName}`;
};

export const transformNewsApiResponse = (news) => {
  return {
    id: news.id,
    heading: news.title,
    news: news.content,
    image: getImageUrl(news.image),
    created_at: news.created_at,
    updated_at: news.updated_at,
    reporter: {
      id: news?.user.id,
      name: news?.user.name,
      profile:
        news?.user?.profile !== null ? getImageUrl(news.user.profile) : null,
    },
  };
};

export const removeImage = (imageName) => {
  const path = process.cwd() + "/public/images/" + imageName;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

export const uploadImage = (image) => {
  const imgExt = image?.name.split(".");
  const imageName = generatedRandomNumber() + "." + imgExt[imgExt.length - 1];
  const uploadPath = process.cwd() + "/public/images/" + imageName;
  image.mv(uploadPath, (err) => {
    if (err) throw err;
  });
  return imageName;
};
