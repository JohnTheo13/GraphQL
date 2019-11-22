// connect to Prisma db and gives us the ability to work from js
const { Prisma } = require('prisma-binding');

const db = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466',
  debug: true
});

module.exports = db;