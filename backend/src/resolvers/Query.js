const { forwardTo } = require('prisma-binding');

const Query = {
  items: forwardTo('db'),
  // dogs(parent, args, ctx, info) {
  //   return [{ name: "snikcers" }, { name: "Sunny" }];
  // }
};

module.exports = Query;
