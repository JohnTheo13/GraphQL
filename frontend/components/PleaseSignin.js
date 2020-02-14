import React from "react";
import { Query } from "react-apollo";
import { CURRENT_USER_QUERY } from "./User";
import Signin from "./Singnin";

export default ({ children }) => (
  <Query query={CURRENT_USER_QUERY}>
    {({data, loading}) => {
      if (loading) return <p>loading...</p>;
      if (!data.me) return <Signin />;
      return children;
    }}
  </Query>
);
