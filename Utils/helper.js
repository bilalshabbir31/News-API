import { v4 as uuidv4 } from "uuid";

export const supportedMimes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/svg",
  "image/gif",
  "image/webp",
];

export const imageValidator = (size, mime) => {
  console.log(supportedMimes.includes(mime));
  
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
}