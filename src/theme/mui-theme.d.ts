import "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Theme {
        fundMe: {
            gradients: {
                page: string;
                hero: string;
                accent: string;
                button: string;
                buttonHover: string;
                spotlight: string;
            };
            surfaces: {
                glass: string;
                glassStrong: string;
                glassAccent: string;
            };
            blur: {
                sm: string;
                md: string;
                lg: string;
            };
            radius: {
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
            };
            shadows: {
                soft: string;
                glass: string;
                lift: string;
            };
        };
    }

    interface ThemeOptions {
        fundMe?: {
            gradients?: Partial<Theme["fundMe"]["gradients"]>;
            surfaces?: Partial<Theme["fundMe"]["surfaces"]>;
            blur?: Partial<Theme["fundMe"]["blur"]>;
            radius?: Partial<Theme["fundMe"]["radius"]>;
            shadows?: Partial<Theme["fundMe"]["shadows"]>;
        };
    }
}

export {};
