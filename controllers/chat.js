const User = require("../models/user");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const io = require("../socket");

//-------------------------new conversation---------------------
exports.getNewConversation = async (req, res, next) => {
  try {
    const conversation = new Conversation({
      members: [req.userId],
    });
    await conversation.save();
    io.getIo().emit("new_conversation", conversation);
    res.status(200).json({ roomId: conversation._id });
  } catch (err) {
    next(err);
  }
};
//-------------------------get message--------------------------
exports.getMessage = async (req, res, next) => {
  const conversationId = req.params.conversationId;

  try {
    if (conversationId === "null") {
      return res.status(200).json({ message: [] });
    }

    const message = await Message.find({
      conversationId: conversationId,
    }).populate("sender", "email name role");
    res.status(200).json({ message });
  } catch (err) {
    next(err);
  }
};
//-------------------------post message--------------------------
exports.postMessage = async (req, res, next) => {
  const text = req.body.text;
  let conversationId = req.body.roomId;
  try {
    //-----tạo conversation -------
    if (conversationId === "null") {
      const conversation = new Conversation({
        members: [req.userId],
      });
      await conversation.save();
      conversationId = conversation._id;

      io.getIo().emit("new_conversation", conversation);
    }
    //----- lưu message--------

    const message = new Message({
      conversationId: conversationId,
      sender: req.userId,
      text,
    });
    await message.save();
    const dataSocket = await message.populate("sender");
    io.getIo().to(conversationId).emit("send_message", dataSocket);
    return res.status(201).json({ message, roomId: conversationId });
  } catch (err) {
    next(err);
  }
};

//----------------------get admin conversation----------------------
exports.getAdminConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.find({});
    res.status(200).json({ conversation });
  } catch (err) {
    next(err);
  }
};
