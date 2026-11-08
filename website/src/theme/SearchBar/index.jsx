import React, { useEffect, useRef } from "react";
import OriginalSearchBar from "@theme-original/SearchBar";

// The third-party search widget hardcodes an English aria-label. Adapt its
// interactive control after hydration without copying or patching the package.
export default function SearchBar(props) {
  const root = useRef(null);
  useEffect(() => {
    root.current
      ?.querySelector("input")
      ?.setAttribute("aria-label", "Pesquisar");
  }, []);
  return (
    <div ref={root} role="search" aria-label="Pesquisar na documentação">
      <OriginalSearchBar {...props} />
    </div>
  );
}
