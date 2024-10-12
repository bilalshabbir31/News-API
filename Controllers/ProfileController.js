import prisma from "../config/db.js";
import { generatedRandomNumber, imageValidator } from "../Utils/helper.js";

const index = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ status: 200, user });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const store = async (req, res) => {};

const show = async (req, res) => {};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.files && Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Profile Image is required." });
    }

    const profile = req.files.profile;
    
    const message = imageValidator(profile?.size, profile.mimetype);
    if (message) {
      return res.status(400).json({ errors: profile.message });
    }
    
    const imgExt = profile?.name.split(".");    
    const imageName = generatedRandomNumber() + "." + imgExt[imgExt.length -1];
    const uploadPath = process.cwd() + "/public/images/" + imageName;
    profile.mv(uploadPath, (err) => {
      if (err) throw err;
    });

    await prisma.users.update({
      data: { profile: imageName },
      where: { id: Number(id) },
    });

    return res
      .status(200)
      .json({ status: 200, message: "Profile updated successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ errors: error, message: "Something went wrong." });
  }
};

const destroy = async (req, res) => {};

export { index, store, show, update, destroy };
