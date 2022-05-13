import React from "react";
import ReactDOM from "react-dom";
import Example from "./quicklinks";
import "./iconFont.css";

import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface";

ReactDOM.render(
    <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
      <Example />
    </SurfaceContext.Provider>,
    document.getElementById("root")
);