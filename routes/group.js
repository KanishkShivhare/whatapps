const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  Image: {
    type: String,
    default:
      "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?size=338&ext=jpg&ga=GA1.1.1546980028.1703808000&semt=ais",
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

module.exports = mongoose.model("group", groupSchema);
