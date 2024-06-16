const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose
  .connect("mongodb+srv://kanishk:kanishkmern@cluster0.99v5rcb.mongodb.net/whatapp?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required for creating a user"],
    unique: [true, "username should be unique"],
  },

  contact: {
    type: String,
  },
  Image: {
    type: String,
    default:
      "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?size=338&ext=jpg&ga=GA1.1.1546980028.1703808000&semt=ais",
  },
  socketId: {
    type: String,
  },
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
