const router = require("express").Router();
const chatController = require("../controllers/chat");
const isAuth = require("../middleware/is-auth");
const isRole = require("../middleware/is-role");
//----------------------user------------------------
router.get(
  "/user/get_new_conversation",
  isAuth,
  chatController.getNewConversation
);

router.get(
  "/user/get_message/:conversationId",
  isAuth,
  chatController.getMessage
);
router.post("/user/post_message", isAuth, chatController.postMessage);

//-----------------------admin------------------------

router.get(
  "/admin/get_conversation",
  isAuth,
  isRole.sellerAndAdmin,
  chatController.getAdminConversation
);

router.get(
  "/admin/get_message/:conversationId",
  isAuth,
  isRole.sellerAndAdmin,
  chatController.getMessage
);

router.post(
  "/admin/post_message",
  isAuth,
  isRole.sellerAndAdmin,
  chatController.postMessage
);
module.exports = router;
