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

const update = async (req, res) => {};

const destroy = async (req, res) => {};

export { index, store, show };
