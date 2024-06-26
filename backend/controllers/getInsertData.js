const multer = require("multer");
const {
  ProductsDB,
  BestSellerItemsDB,
  sequelize,
} = require("../models/models");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("image");

const uploadImage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Upload failed", error: err.message });
    }

    const { type, price, name, where } = req.body;

    try {
      let url = "http://localhost:3131/";
      let imagePath = (url += req.file.path);

      console.log("Image received and saved locally:", imagePath);
      console.log("Type:", type);
      console.log("Price:", price);
      console.log("Name:", name);
      console.log("Where:", where);

      await insertNewProduct(where, name, type, price, imagePath);

      return res.json({ message: "Upload successful", imageUrl: imagePath });
    } catch (error) {
      console.error("Error saving image locally:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

const insertNewProduct = async (where, name, type, price, imagePath) => {
  if (where === "products") {
    const ProductId = await ProductsDB.findOne({
      attributes: [[sequelize.fn("max", sequelize.col("id")), "lastId"]],
    });
    let lastId = ProductId.get("lastId") || 0;
    console.log("Last Product ID:", lastId);
    let newImgPath = imagePath.replace(/\\/g, "/");
    const Product = await ProductsDB.create({
      id: lastId + 1,
      name: name,
      price: Number(price),
      image: newImgPath,
      type: type,
    });

    console.log("Product generated ID:", Product.id);
  } else {
    const lastBestSellerID = await BestSellerItemsDB.findOne({
      attributes: [[sequelize.fn("max", sequelize.col("id")), "lastId"]],
    });
    let lastBestseller = lastBestSellerID.get("lastId") || 0;
    console.log("Last Bestseller ID:", lastBestseller);

    const Bestseller = await BestSellerItemsDB.create({
      id: lastBestseller + 1,
      name: name,
      price: Number(price),
      image: imagePath,
      type: type,
    });

    console.log("Bestseller generated ID:", Bestseller.id);
  }
};

module.exports = {
  uploadImage,
};
