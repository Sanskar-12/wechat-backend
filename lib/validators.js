import { body, check, validationResult, param } from "express-validator";
import ErrorHandler from "../utils/utility.js";

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);

  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(", ");

  if (errors.isEmpty()) return next();
  else {
    return next(new ErrorHandler(errorMessages, 400));
  }
};

const registerValidator = () => [
  body("name", "Please enter your Name").notEmpty(),
  body("bio", "Please enter your Bio").notEmpty(),
  body("username", "Please enter your Username").notEmpty(),
  body("password", "Please enter your Password").notEmpty(),
  check("avatar", "Please Upload Avatar").notEmpty(),
];

const loginValidator = () => [
  body("username", "Please enter your Username").notEmpty(),
  body("password", "Please enter your Password").notEmpty(),
];

const newGroupChatValidator = () => [
  body("name").notEmpty().withMessage("Please enter your Name"),
  body("members")
    .notEmpty()
    .withMessage("Please enter Members")
    .isArray({ min: 2, max: 100 })
    .withMessage("Group Chat must have atleast 3 members"),
];

const addMembersValidator = () => [
  body("chatId").notEmpty().withMessage("Please enter your Chat Id"),
  body("members")
    .notEmpty()
    .withMessage("Please enter Members")
    .isArray({ min: 1, max: 97 })
    .withMessage("Members must be 1-97"),
];

const removeMemberValidator = () => [
  body("chatId").notEmpty().withMessage("Please enter your Chat Id"),
  body("userId").notEmpty().withMessage("Please enter your User Id"),
];

const leaveMemberValidator = () => [
  param("id").notEmpty().withMessage("Please enter your Chat Id"),
];

const sendAttachmentsValidator = () => [
  body("chatId").notEmpty().withMessage("Please enter your Chat Id"),
  body("files")
    .notEmpty()
    .withMessage("Please Upload Attachments")
    .isArray({ min: 1, max: 5 })
    .withMessage("Attachments must be 1-5"),
];

const getChatDetailsValidator = () => [
  param("id").notEmpty().withMessage("Please enter your Chat Id"),
];

const getMessagesValidator = () => [
  param("id").notEmpty().withMessage("Please enter your Chat Id"),
];

const deleteChatValidator = () => [
  param("id").notEmpty().withMessage("Please enter your Chat Id"),
];

const renameChatValidator = () => [
  param("id").notEmpty().withMessage("Please enter your Chat Id"),
  body("name").notEmpty().withMessage("Please enter Chat Name"),
];

const sendRequestValidator = () => [
  body("userId").notEmpty().withMessage("Please enter your User Id"),
];

const acceptRequestValidator = () => [
  body("requestId").notEmpty().withMessage("Please enter your Request Id"),
  body("accept")
    .notEmpty()
    .withMessage("Please Add Accept")
    .isBoolean()
    .withMessage("Accept must be boolean"),
];

export {
  registerValidator,
  validateHandler,
  loginValidator,
  newGroupChatValidator,
  addMembersValidator,
  removeMemberValidator,
  leaveMemberValidator,
  sendAttachmentsValidator,
  getChatDetailsValidator,
  getMessagesValidator,
  deleteChatValidator,
  renameChatValidator,
  sendRequestValidator,
  acceptRequestValidator,
};
