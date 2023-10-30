const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const imagekit = require("../libs/imagekit");
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Register User
  register: async (req, res, next) => {
    try {
      let { first_name, last_name, email, password, password_confirmation } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already exists",
          data: null,
        });
      }

      if (password != password_confirmation) {
        return res.status(400).json({
          status: false,
          message: "please ensure that the password and password confirmation match!",
          data: null,
        });
      }

      let encryptedPassword = await bcrypt.hash(password, 10);
      let newUser = await prisma.user.create({
        data: {
          email,
          password: encryptedPassword,
        },
      });

      let newUserProfile = await prisma.userProfile.create({
        data: {
          first_name,
          last_name,
          birth_date: "",
          profile_picture: "",
          userId: newUser.id,
        },
      });

      res.status(201).json({
        status: true,
        message: "User registration has been successful",
        data: { newUser, newUserProfile: { first_name, last_name } },
      });
    } catch (err) {
      next(err);
    }
  },

  // Login User
  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: "invalid email or password!",
          data: null,
        });
      }

      let isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          status: false,
          message: "invalid email or password!",
          data: null,
        });
      }

      let token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);

      return res.status(200).json({
        status: true,
        message: "OK",
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { first_name, last_name, birth_date } = req.body;
      let url;

      if (req.file) {
        const strFile = req.file.buffer.toString("base64");

        const result = await imagekit.upload({
          // Menggunakan `await` untuk menunggu hasil unggah
          fileName: Date.now() + path.extname(req.file.originalname),
          file: strFile,
        });

        url = result.url; // Mengambil URL dari hasil unggah
      }

      const updateData = {
        first_name,
        last_name,
        birth_date,
      };

      if (url) {
        updateData.profile_picture = url;
      }

      const newUserProfile = await prisma.userProfile.update({
        where: {
          userId: Number(req.user.id),
        },
        data: updateData,
      });

      return res.status(200).json({
        status: true,
        message: "OK",
        data: { newUserProfile },
      });
    } catch (err) {
      next(err);
    }
  },

  authenticateUser: async (req, res, next) => {
    try {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: Number(req.user.id) },
      });

      return res.status(200).json({
        status: true,
        message: "OK",
        data: {
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          email: req.user.email,
          birth_date: userProfile ? userProfile.birth_date : "",
          profile_picture: userProfile ? userProfile.profile_picture : "",
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
