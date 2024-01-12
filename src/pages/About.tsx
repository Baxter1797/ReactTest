import { useParams } from "react-router-dom";

// MUI Components
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function About(): JSX.Element {
    const { id } = useParams();

    return (
        <>
            <h1>About page - { id }</h1>
            <Box sx={{width: "100%", display: "flex", justifyContent: "center"}}>
                <Button variant="contained">Hello World</Button>
            </Box>
        </>
    )
}

export default About;