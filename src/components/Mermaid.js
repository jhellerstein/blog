import React from "react";
import Mermaid from "react-mermaid2";

export default function MermaidChart({ chart }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <Mermaid chart={chart} />
    </div>
  );
}