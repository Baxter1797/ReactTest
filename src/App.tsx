//Libraries
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

//Components
import Home from "./pages/Home";
import About from "./pages/About";
import NavBar from "./components/NavBar";

function App(): JSX.Element {

  return (
    <>
      <NavBar />
        <main>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/about/:id" element={<About />} />
            </Routes>
          </Router>
        </main>
    </>
  )
}

export default App
