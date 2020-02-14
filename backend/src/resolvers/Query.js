const { forwardTo } = require("prisma-binding");
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parents, args, ctx, info) {
    if (!ctx.request.userId) {
      // throw new Error('no user found')
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    const { userId } = ctx.request;
    // 1. check if logged in
    if (!userId) throw new Error("not logged in");
    // 2. check permissions
    hasPermission(ctx.request.user, ["ADMIN"]);
    const users = await ctx.db.query.users({}, info);
    console.log('users', users);
    return users;
  }
  // async items(parent, args, ctx, info) {
  //   const items  = await ctx.db.query.items();
  //   return items;
  // }
};

module.exports = Query;
