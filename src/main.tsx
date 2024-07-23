import ReactDOM from "react-dom/client";
import { CssVarsProvider, extendTheme } from "@mui/joy";

import App from "./App";

const theme = extendTheme({ cssVarPrefix: "sky-pack" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <CssVarsProvider
    defaultMode="system"
    theme={theme}
    modeStorageKey="sky-pack-theme-mode"
    disableNestedContext
  >
    <App />
  </CssVarsProvider>
);
