import { useParams } from "react-router-dom";

function About() {
    const { id } = useParams();
    return (
        <h1>About page - { id }</h1>
    )
}

export default About;