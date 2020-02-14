import React from "react";
import { Query } from "react-apollo";
import styled from "styled-components";
import Head from "next/head";
import gql from "graphql-tag";
import Error from "./ErrorMessage";

export const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
      largeImage
    }
  }
`;

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`;

export default ({ id }) => (
  <Query query={SINGLE_ITEM_QUERY} variables={{ id }}>
    {({ error, loading, data }) => {
      if (error) return <Error>{error}</Error>;
      if (loading) return <p>Loading...</p>;
      if (!data.item) return <p>No Item Found for {id}</p>;
      const { item } = data;
      return (
        <SingleItemStyles>
          <Head>
            <title>Sick Fits | {item.title}</title>
          </Head>
          <img src={`../static/${item.largeImage}`} alt={item.title} />
          <div className="details">
            <h2>Viewing {item.title}</h2>
            <p>{item.description}</p>
          </div>
        </SingleItemStyles>
      );
    }}
  </Query>
);
