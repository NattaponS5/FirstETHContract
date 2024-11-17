const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

// GraphQL schema
const schema = buildSchema(`
  type File {
    name: String
    content: String
  }

  type Query {
    searchFile(text: String!): [File]
  }
`);

// Resolver functions
const root = {
  searchFile: ({ text }) => {
    const directoryPath = path.join(__dirname, 'sample');
    
    
    const files = fs.readdirSync(directoryPath).map(fileName => {
      const filePath = path.join(directoryPath, fileName);
      const content = fs.readFileSync(filePath, 'utf8');
      
      return { name: fileName, content };
    });

    return files.filter(file => file.content.includes(text));
  },
};

// Create an express app
const app = express();

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Start the server
app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});
