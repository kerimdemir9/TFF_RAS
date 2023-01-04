import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors/index.js";

const register = async (req, res) => {
  const { name, lastName, city, email, password } = req.body;

  if (!name || !lastName || !city || !email || !password) {
    throw new BadRequestError("please provide all values");
  }

  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    throw new BadRequestError("Email already in use");
  }

  const user = await User.create({
    name,
    email,
    password,
    lastName,
    location: city,
  });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      type: user.type,
    },
    token,
    location: user.location,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }
  const token = user.createJWT();
  user.password = undefined;

  res.status(StatusCodes.OK).json({ user, token, location: user.location });
};

const updateUser = async (req, res) => {
  const { email, name, lastName, location } = req.body;
  if (!email || !name || !lastName || !location) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  user.lastName = lastName;
  user.location = location;

  await user.save();

  // various setups
  // in this case only id
  // if other properties included, must re-generate

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user,
    token,
    location: user.location,
  });
};

const deleteUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });

  await user.remove();

  res.status(StatusCodes.OK).json({ msg: "Success! Account removed" });
};

const passwordEmail = async (req, res) => {
  const email = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(400);
    throw new BadRequestError("No account with that email exists");
  }
  const code = crypto.randomBytes(32).toString("hex");
  const existingToken = await passwordToken.findOne({ email });
  if (existingToken) {
    await passwordToken.deleteMany({ email: email });
  }
  const emailToken = await passwordToken.create({ code, email });
  const Base =
    process.env.NODE_ENV !== "production"
      ? `${process.env.BASE_URL}`
      : "https://team18-tff-ras-production.up.railway.app/verify/";
  const url = `${Base}${emailToken.code}`;
  try {
    await sendEmail(user.email, "Account verification", url);
  } catch (error) {
    console.log(error);
  }

  res.status(201).json({ message: "An email has been sent to your inbox" });
};

export { register, login, updateUser, deleteUser };
