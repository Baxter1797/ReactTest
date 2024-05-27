// Libraries
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// MUI Themes
import { Theme, ThemeOptions, ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Components
import Home from "./pages/Home";
import About from "./pages/About";
import NavBar from "./components/Shared/NavBar";
import useMediaQuery from "@mui/material/useMediaQuery";

// Utils
import defineTheme from "./utils/defineTheme";
import Profile from "./pages/Profile";
import TraverseVM from "./pages/TraverseVM";
import { SnackbarProvider } from "./providers/SnackbarProvider";

let themeContext: ThemeOptions;
let theme: Theme;

function setTheme(): void{
  theme = createTheme({
    ...themeContext,
  });
}

const queryClient: QueryClient = new QueryClient();

function App(): JSX.Element {
  
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  if (prefersDarkMode) {
    themeContext=defineTheme("dark");
    setTheme();
  } else {
    themeContext=defineTheme("dark")
    setTheme();
  }

  //console.log(themeContext)

  return (
    <>
      <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <Router>
          <body style={{ height: '100vh', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <NavBar />
          <main style={{ padding: '20px', flex: 1}}>
            <Routes>
              <Route path="/*" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="about/:id" element={<About />} />
              <Route path="profile" element={<Profile />} />
              <Route path='traverseVM' element={<TraverseVM />} />
            </Routes>
          </main>
          </body>
        </Router>
      </SnackbarProvider>
      </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}

export default App
