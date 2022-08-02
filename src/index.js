import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import "react-colorful/dist/index.css";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";
import { provider } from "web3-core";

export const getLibrary = (provider) => {
  return new Web3(provider);
};

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <App />
  </Web3ReactProvider>,
  document.getElementById("root")
);
