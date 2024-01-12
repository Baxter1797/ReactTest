import { ThemeOptions } from "@mui/material"

const darkPallete = {
    default: '#1e2124',
    light: '#424549',
    main: '#36393e',
    dark: '#282b30',
    contrastText: '#fff',
    mainCancel: '#e50000',
    darkCancel: '#b20000',
    mainConfirm: '#0080FE',
    darkConfirm: '#0000cc',
    secondaryLight: '#dcb3e3',
    secondaryMain: '#ce93d8',
    secondaryDark: '#a475ac'
}

export default function defineTheme(prefferedTheme: string): ThemeOptions {
    if (prefferedTheme === "dark"){
        return({
            palette: {
            mode: "dark",
            background: {
              default: darkPallete.default
            },
            primary: {
              light: darkPallete.light,
              main: darkPallete.main,
              dark: darkPallete.dark,
              contrastText: darkPallete.contrastText,
            },
            custom: {
              cancel: {
                main: darkPallete.mainCancel,
                dark: darkPallete.darkCancel,
              },
              confirm: {
                main: darkPallete.mainConfirm,
                dark: darkPallete.darkConfirm,
              }
            },
            secondary: {
              light: darkPallete.secondaryLight,
              main: darkPallete.secondaryMain,
              dark: darkPallete.secondaryDark,
              contrastText: darkPallete.contrastText,
            },
          },
          shape: {
            borderRadius: 4
          },
          components: {
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        "&:hover": {backgroundColor: darkPallete.light},
                        borderRadius: '10px',
                    },
                },
            },
            MuiButton: {
                variants: [{
                    props: {variant: 'text', color: 'primary'},
                    style: {
                        color: '#fff',
                        "&:hover": {backgroundColor: darkPallete.light}
                    }
                },
                {
                    props: {variant: 'contained', color: 'primary'},
                    style: {
                        "&:hover": {backgroundColor: darkPallete.light}
                    }
                }] 
            },
            MuiPaper:  {
                styleOverrides: {
                    root: {
                        backgroundColor: darkPallete.dark,
                        backgroundBlendMode: 'color',
                    }
                }
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        "&:hover": {backgroundColor: darkPallete.light}
                    }
                }
            },
            MuiCheckbox: {
              defaultProps: {
                style: {
                  color: darkPallete.secondaryMain
                }
              },
              styleOverrides: {
                root: {
                  color: darkPallete.secondaryMain,
                }
              }
            },
            MuiDataGrid: {
              styleOverrides : {
                row: {
                    "&.Mui-selected": {
                    backgroundColor: darkPallete.main,
                    border: 'none',
                    borderBox: 'none',
                    "&:hover": {
                      backgroundColor: darkPallete.main
                    }
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                    },
                },
                root: {
                  '& .MuiDataGrid-row:hover': {color: 'secondary.main', cursor: 'pointer'}, 
                }
              }
            }
          },
          breakpoints: {
            values: {
              xs: 0,
              mobile: 400,
              sm: 600,
              md: 900,
              lg: 1200,
              xl: 1536,
            }
          }
        ,})
    } else {
        return({palette: {
            mode: "light",
            background: {
              default: '#FAF9F6'
            },/*
            primary: {
              light: '#757ce8',
              main: '#3f50b5',
              dark: '#002884',
              contrastText: '#fff',
            },
            secondary: {
              light: '#ff7961',
              main: '#f44336',
              dark: '#ba000d',
              contrastText: '#000',
            },*/
          },})
    }
}