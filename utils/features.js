import { User } from "../models/userModel";
import { myCache } from "../app.js";
export const invalidateCache = async ({ user, order, admin }) => {
  if (user) {
    const usersKey = ["getMyProfile"];
    //users id
    const users = await User.find({}).select("_id");
    users.forEach((i) => {
      usersKey.push(`user-${i._id}`);
    });
    myCache.del(usersKey);
  }
};
