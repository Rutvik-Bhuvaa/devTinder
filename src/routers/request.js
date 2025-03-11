const express = require("express");

const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");
const { User } = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        res.status(400).json({
          message: "Invalid status type: " + status,
        });
        return;
      }

      const toUser = await User.findById(toUserId);

      if (!toUser) {
        res.status(404).json({
          message: "User not found!",
        });
      }

      const isConnectionRequestExist = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (isConnectionRequestExist) {
        res.status(400).json({
          message: "Connection request already exist!!",
        });
        return;
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      let message = "";
      if (status === "interested") {
        message = `${req.user.firstName} is interested in connecting with ${toUser.firstName}`;
      } else if (status === "ignored") {
        message = `${req.user.firstName} ignored ${toUser.firstName}'s profile`;
      }

      res.json({
        message: message,
        data: data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        res.status(400).json({
          message: "Status is not valid!",
        });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        res.status(404).json({
          message: "Connection request not found",
        });
        return;
      }

      const fromUser = await User.findById(connectionRequest.fromUserId);

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      let message = "";
      if (status === "accepted") {
        message = `${loggedInUser.firstName} accepted ${fromUser.firstName}'s connection request`;
      } else if (status === "rejected") {
        message = `${loggedInUser.firstName} rejected ${fromUser.firstName}'s connection request`;
      }

      res.json({
        message: message,
        data: data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);
module.exports = { requestRouter };
