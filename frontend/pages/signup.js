import styled from "styled-components";
import Signup from "../components/Signup";
import Singnin from "../components/Singnin";
import RequestReset from "../components/RequestReset";
import ResetPassword from "../components/ResetPassword";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const SignupPage = props => (
  <Columns>
    <Signup />
    <Singnin />
    <RequestReset />
    <ResetPassword {...props} />
  </Columns>
);

export default SignupPage;
