const users = require("./routes/users");
const msgmodel = require("./routes/msg");
const groupmodel = require("./routes/group");
const group = require("./routes/group");
const { Socket } = require("socket.io");
const { all } = require("./routes");

const io = require("socket.io")();
const socketapi = {
  io: io,
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
  // console.log("A user connected");

  socket.on("join-server", async function (userDetails) {
    const currentUser = await users.findOne({
      username: userDetails.userName,
    });
    //  console.log(currentUser);

    const allGroups = await groupmodel.find({
      user: {
        $in: [currentUser._id],
      },
    });
    // console.log(currentUser._id);

    // console.log(allGroups);

    allGroups.forEach((group) => {
      socket.emit("group-joined", group);
    });

    await users.findOneAndUpdate(
      { username: userDetails.userName },
      { socketId: socket.id }
      // { new: true }
    );
    const onlineusers = await users.find({
      socketId: {
        $nin: ["", socket.id],
      },
    });
    // console.log(onlineusers);

    onlineusers.forEach((onlineusers) => {
      socket.emit("new-user-join", {
        userName: onlineusers.username,
        profileImg: onlineusers.Image,
      });
    });

    socket.broadcast.emit("new-user-join", userDetails);
  });
  socket.on("disconnect", async () => {
    // console.log("user disconnect");
    await users.findOneAndUpdate({ socketId: socket.id }, { socketId: "" });
  });

  socket.on("private-msg", async (msgObj) => {
    await msgmodel.create({
      msg: msgObj.msg,
      sender: msgObj.sender,
      receiver: msgObj.receiver,
    });

    const receiver = await users.findOne({
      username: msgObj.receiver,
    });

    if (!receiver) {
      // JAB REVEIVER NHI MILEGA
      const group = await groupmodel
        .findOne({
          name: msgObj.receiver,
        })
        .populate("user");
      group.user.forEach((user) => {
        socket.to(user.socketId).emit("receive-private-msg", msgObj);
      });
      if (!group) {
        return;
      }
    }

    if (receiver) {
      socket.to(receiver.socketId).emit("receive-private-msg", msgObj);
    }
  });

  socket.on("fetch-conversation", async (conversationDetails) => {
    const isUser = await users.findOne({
      username: conversationDetails.receiver,
    });
    if (isUser) {
      allmsg = await msgmodel.find({
        $or: [
          {
            sender: conversationDetails.sender,
            receiver: conversationDetails.receiver,
          },
          {
            receiver: conversationDetails.sender,
            sender: conversationDetails.receiver,
          },
        ],
      });
      socket.emit("send-conversation-chat", allmsg);
    } else {
      allmsg = await msgmodel.find({
        receiver: conversationDetails.receiver,
      });
      socket.emit("send-conversation-chat", allmsg);
    }
    
  });

  socket.on("create-new-group", async (groupDetail) => {
    // console.log(groupDetail);
    const newGroup = await groupmodel.create({
      name: groupDetail.groupName,
    });
    // console.log(newGroup);
    const currentUser = await users.findOne({
      username: groupDetail.sender,
    });
    // console.log(currentUser);
    // console.log(currentUser._id);
    newGroup.user.push(currentUser._id);
    await newGroup.save();

    // console.log(newGroup);
    socket.emit("group-created", newGroup);
  });

  socket.on("join-group", async (joiningroupDetails) => {
    const group = await groupmodel.findOne({
      name: joiningroupDetails.groupName,
    });

    const currentUser = await users.findOne({
      username: joiningroupDetails.sender,
    });
    group.user.push(currentUser._id);
    await group.save();

    socket.emit("group-joined", {
      Image: group.Image,
      name: group.name,
    });
  });
});
// end of socket.io logic

module.exports = socketapi;
