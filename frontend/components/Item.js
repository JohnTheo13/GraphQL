/* eslint-disable import/no-cycle */
import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import Title from "./styles/Title";
import ItemStyles from "./styles/ItemStyles";
import PriceTag from "./styles/PriceTag";
import formatMoney from "../lib/formatMoney";
import DeleteItem from "./DeleteItem";
import AddToCart from "./AddToCart";

const Item = ({ item: { image, title, id, price, description } }) => (
  <ItemStyles>
    {image && <img src={`../static/${image}`} alt={title} />}
    <Title>
      <Link
        href={{
          pathname: "/item",
          query: { id }
        }}
      >
        <a>{title}</a>
      </Link>
    </Title>
    <PriceTag>{formatMoney(price)}</PriceTag>
    <p>{description}</p>

    <div className="buttonList">
      <Link
        href={{
          pathname: "update",
          query: { id }
        }}
      >
        <a>Edit ✏️</a>
      </Link>
      <button type="button">Add To Cart</button>
      <DeleteItem id={id}>Delete Item</DeleteItem>
      <AddToCart id={id} />
    </div>
  </ItemStyles>
);

Item.PropTypes = {
  item: PropTypes.object.isRequired
};

export default Item;
