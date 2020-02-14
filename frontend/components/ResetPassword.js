import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const PASWORD_RESET_MUTATION = gql`
  mutation PASSWORD_RESET_MUTATION(
    $resetToken: String!
    $newPassword: String!
    $confirmationPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      newPassword: $newPassword
      confirmationPassword: $confirmationPassword
    ) {
      id
      email
      name
    }
  }
`;

export default class ResetPassword extends Component {
  state = {
    newPassword: "",
    confirmationPassword: "",
    resetToken: this.props.query.resetToken
  };
  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Mutation
        mutation={PASWORD_RESET_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await resetPassword();
              this.setState({ newPassword: "", confirmationPassword: "" });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Set new password</h2>
              <Error error={error} />
              {!loading && !error && called && (<p>Email is send!</p>)}
              <label htmlFor="newPassword">
                newPassword
                <input
                  type="newPassword"
                  name="newPassword"
                  placeholder="newPassword"
                  value={this.state.newPassword}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="confirmationPassword">
                confirmationPassword
                <input
                  type="confirmationPassword"
                  name="confirmationPassword"
                  placeholder="confirmationPassword"
                  value={this.state.confirmationPassword}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Proceed!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}
