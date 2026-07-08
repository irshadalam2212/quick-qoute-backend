import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/apiresponse.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    companyName,
    mobileNumber,
    alternateMobile,
    website,
    gstNumber,
    panNumber,
    services,
    address,
    logo,
    signature,
  } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,

      companyName,
      mobileNumber,
      alternateMobile,
      website,
      gstNumber,
      panNumber,
      services,
      address,
      logo,
      signature,
    },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      mobileNumber: true,
      alternateMobile: true,
      website: true,
      gstNumber: true,
      panNumber: true,
      services: true,
      address: true,
      logo: true,
      signature: true,
      role: true,
      createdAt: true,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  // Compare password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user.id,
  );

  // Get user without sensitive fields
  const loggedInUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    omit: {
      password: true,
      refreshToken: true,
    },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      refreshToken: null,
    },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },

    select: {
      id: true,
      name: true,
      email: true,

      companyName: true,
      mobileNumber: true,
      alternateMobile: true,

      website: true,
      gstNumber: true,
      panNumber: true,

      services: true,
      address: true,

      logo: true,
      signature: true,

      role: true,

      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user.id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    companyName,
    mobileNumber,
    alternateMobile,
    website,
    gstNumber,
    panNumber,
    services,
    address,
    logo,
    signature,
  } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: req.user.id,
    },

    data: {
      ...(name !== undefined && { name }),
      ...(companyName !== undefined && { companyName }),
      ...(mobileNumber !== undefined && { mobileNumber }),
      ...(alternateMobile !== undefined && { alternateMobile }),
      ...(website !== undefined && { website }),
      ...(gstNumber !== undefined && { gstNumber }),
      ...(panNumber !== undefined && { panNumber }),
      ...(services !== undefined && { services }),
      ...(address !== undefined && { address }),
      ...(logo !== undefined && { logo }),
      ...(signature !== undefined && { signature }),
    },

    select: {
      id: true,
      name: true,
      email: true,

      companyName: true,
      mobileNumber: true,
      alternateMobile: true,

      website: true,
      gstNumber: true,
      panNumber: true,

      services: true,
      address: true,

      logo: true,
      signature: true,

      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully."));
});

export {
  registerUser,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
  updateProfile,
};
