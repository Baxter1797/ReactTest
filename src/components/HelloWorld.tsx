import userDetails from "../interfaces/IuserDetails";

function HelloWorld(userDetails: userDetails): JSX.Element {
    return (
        <h1>Hello World!!! FirstName: {userDetails.firstname} LastName: {userDetails.lastname}</h1>
    );
}

export default HelloWorld;