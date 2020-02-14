const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { makeANiceEmail, transport } = require("../mail");
const { hasPermission } = require("../utils");

const { APP_SECRET, FRONTEND_URL } = process.env;

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // this is how we creat erelationship
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );
    return item;
  },
  async updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    const item = await ctx.db.mutation.updateItem(
      {
        data: { ...updates },
        where: { id: args.id }
      },
      info
    );
    return item;
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);
    // 2. Check if they own that item, or have the permissions
    const hasPer = hasPermission(ctx.request.user, ["ADMIN", "ITEMDELETE"]);
    if (!hasPer || !(item.user.id === ctx.request.userId))
      throw new Error("Not allowed");
    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  // create user in db
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    // hash password
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      { data: { ...args, password, permissions: { set: ["USER"] } } },
      info
    );
    // create jwt for use
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax"
      // secure: true
    });
    // Finally return user to the client

    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`no user wiht email: ${email}`);
    }
    // 2. check if passs correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid password");
    }
    // 3. generate JWT
    const token = jwt.sign({ userId: user.id }, APP_SECRET);
    // 4. Set cookie token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax"
      // secure: true
    });
    // 5. return user
    return user;
  },
  signout(parent, args, ctx, info) {
    return ctx.response.clearCookie("token");
  },
  async requestReset(parent, { email }, ctx, info) {
    // 1. check if real user
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error(`no user with email: ${email}`);
    // 2. set resetToken and expiry
    const resetToken = randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });
    // 3. Email that resettoken
    const mailRes = await transport.sendMail({
      from: "sogi@test.com",
      to: user.email,
      subject: "Pass reset",
      html: makeANiceEmail(
        `your pass reset her:\n\n <a href="${FRONTEND_URL}/signup?resetToken=${resetToken}">CLick here to reset</>`
      )
    });
    if (!mailRes) throw new Error("PROble sending email");
    // 4. rerutn message
    return { message: "Thanks" };
  },
  async resetPassword(
    parent,
    { resetToken, newPassword, confirmationPassword },
    ctx,
    info
  ) {
    // 1. check if password match
    if (newPassword !== confirmationPassword)
      throw new Error("password missmatch");
    // 2. check if legit token
    // 3. check if its expired
    const [resetUser] = await ctx.db.query.users({
      where: { resetToken, resetTokenExpiry_gte: Date.now() - 36000 }
    });
    if (!resetUser) throw new Error("Token invalid or expired");
    // 4. hash new password
    const password = await bcrypt.hash(newPassword, 10);
    // 5. save new parrsord ad reset token fields
    const user = await ctx.db.mutation.updateUser({
      where: { id: resetUser.id },
      data: { password, resetToken: null, resetTokenExpiry: 0 }
    });
    // 6. new jwt
    const token = jwt.sign({ userId: user.id }, APP_SECRET);
    // 7. set the new jwt
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax"
      // secure: true
    });
    // 8. return new user
    return user;
  },
  async updatePermissions(parent, { permissions, userId }, ctx, info) {
    // 1. check if logged in
    if (!ctx.request.userId) throw new Error("not logged in");
    // 2. check permissions
    hasPermission(ctx.request.user, ["PERMISSIONUPDATE"]);
    const user = await ctx.db.mutation.updateUser(
      {
        where: { id: userId },
        data: {
          permissions: {
            set: permissions // set because enum or array?
          }
        }
      },
      info
    );
    console.log("users", user);
    return { message: "success" };
  },
  async addToCart(parent, { id: itemId }, ctx, info) {
    // 1. loged in
    if (!ctx.request.userId) throw new Error("not logged in");
    // 2. Query user's curent cart
    const [existingItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: ctx.request.userId },
        item: { id: itemId }
      }
    }, info);
    // 3. Check if item already in cart to increase quantity
    if(existingItem) {
      console.log('Item exists')
      return ctx.db.mutation.updateCartItem({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 }
      }, info)
    }
    // 4. item is new to the cart
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: ctx.request.userId }
        },
        item: {
          connect: { id: itemId }
        }
      }
    }, info)
  },
  async removeFromCart(parent, { id: itemId }, ctx, info) {
    // 1. loged in
    if (!ctx.request.userId) throw new Error("not logged in");
    return ctx.db.mutation.deleteCartItem({
      where: { id: itemId }
    }, info)
  }
};

module.exports = Mutations;
