import { useParams } from "react-router-dom";

function About(): JSX.Element {
    const { id } = useParams();
    return (
        <h1>About page - { id }</h1>
    )
}

export default About;