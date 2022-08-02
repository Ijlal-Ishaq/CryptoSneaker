import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useResource } from "react-three-fiber";
import { ContactShadows, Environment, useGLTF, OrbitControls } from "drei";
import { HexColorPicker } from "react-colorful";
import { proxy, useProxy } from "valtio";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { ContractAddress, ABI } from "./contract/constants";
import Web3 from "web3";
import { create } from "ipfs-http-client";

const state = proxy({
  current: "mesh",
  items: {
    laces: "#ffffff",
    mesh: "#ffffff",
    caps: "#ffffff",
    inner: "#ffffff",
    sole: "#ffffff",
    stripes: "#ffffff",
    band: "#ffffff",
    patch: "#ffffff",
  },
});

function Shoe() {
  const ref = useRef();
  const snap = useProxy(state);
  const { nodes, materials } = useGLTF("shoe-draco.glb");

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = -0.2 - (1 + Math.sin(t / 1.5)) / 20;
    ref.current.rotation.x = Math.cos(t / 4) / 8;
    ref.current.rotation.y = Math.sin(t / 4) / 8;
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
  });

  const [hovered, set] = useState(null);
  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="white-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`;
    document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(
      hovered ? cursor : auto
    )}'), auto`;
  }, [hovered]);

  return (
    <group
      ref={ref}
      dispose={null}
      onPointerOver={(e) => (e.stopPropagation(), set(e.object.material.name))}
      onPointerDown={(e) => (
        e.stopPropagation(), (state.current = e.object.material.name)
      )}
    >
      <mesh
        geometry={nodes.shoe.geometry}
        material={materials.laces}
        material-color={snap.items.laces}
      />
      <mesh
        geometry={nodes.shoe_1.geometry}
        material={materials.mesh}
        material-color={snap.items.mesh}
      />
      <mesh
        geometry={nodes.shoe_2.geometry}
        material={materials.caps}
        material-color={snap.items.caps}
      />
      <mesh
        geometry={nodes.shoe_3.geometry}
        material={materials.inner}
        material-color={snap.items.inner}
      />
      <mesh
        geometry={nodes.shoe_4.geometry}
        material={materials.sole}
        material-color={snap.items.sole}
      />
      <mesh
        geometry={nodes.shoe_5.geometry}
        material={materials.stripes}
        material-color={snap.items.stripes}
      />
      <mesh
        geometry={nodes.shoe_6.geometry}
        material={materials.band}
        material-color={snap.items.band}
      />
      <mesh
        geometry={nodes.shoe_7.geometry}
        material={materials.patch}
        material-color={snap.items.patch}
      />
    </group>
  );
}

function Picker() {
  const snap = useProxy(state);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "fixed",
        left: "0",
        top: "0",
        height: "100vh",
        padding: "15px",
      }}
    >
      <HexColorPicker
        className="picker"
        color={snap.items[snap.current]}
        onChange={(color) => (state.items[snap.current] = color)}
      />
      <h1 style={{ marginBottom: "100px" }}>{snap.current}</h1>
    </div>
  );
}

function Heading() {
  return (
    <div
      style={{
        position: "fixed",
        left: "0",
        right: "0",
        top: "0",
        zIndex: "1000",
        fontFamily: "Inter var",
        fontWeight: "1000",
        fontSize: "90px",
        textAlign: "center",
        color: "#272730",
        cursor: "pointer",
      }}
      className="cryptosneaker"
    >
      CryptoSneaker
    </div>
  );
}

function Customize() {
  return (
    <div
      style={{
        position: "fixed",
        right: "0",
        top: "0",
        bottom: "0",
        zIndex: "1000",
        fontFamily: "Inter var",
        fontWeight: "1000",
        textAlign: "center",
        color: "#272730",
        writingMode: "tb-rl",
        transform: "rotate(180deg)",
      }}
      className="customize"
    >
      Customize
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        left: "0",
        top: "0",
        backgroundColor: "rgba(255,255,255,0.7)",
        zIndex: "10000",
        fontFamily: "Inter var",
        fontSize: "90px",
        fontWeight: "1000",
        textAlign: "center",
        color: "#272730",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "auto",
      }}
    >
      Minting...
    </div>
  );
}

function Successful({ account, setSuccessful }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        left: "0",
        top: "0",
        backgroundColor: "rgba(255,255,255,0.7)",
        zIndex: "10000",
        fontFamily: "Inter var",
        fontSize: "90px",
        fontWeight: "1000",
        textAlign: "center",
        color: "#272730",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "auto",
      }}
    >
      Minted Successfully! <br />
      <a
        href={`https://testnets.opensea.io/${account}`}
        target={"_blank"}
        style={{ fontSize: "30px", color: "#272730" }}
      >
        check your opensea profile.
      </a>
      <div
        style={{
          backgroundColor: "#272730",
          color: "#fff",
          marginTop: "30px",
          fontSize: "30px",
          padding: "10px",
          cursor: "pointer",
        }}
        onClick={() => {
          setSuccessful(false);
        }}
      >
        Close
      </div>
    </div>
  );
}

function MintNow({ account, web3Context, resetPosition, setLoading }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "0",
        right: "0",
        bottom: "30px",
        zIndex: "1000",
        fontFamily: "Inter var",
        fontWeight: "1000",
        textAlign: "center",
        cursor: "pointer",
        width: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
        padding: "0px 10px",
      }}
      className="mint"
      onClick={async () => {
        setLoading(true);
        resetPosition();
        sleep(500).then(async () => {
          try {
            let Uri = await takeScreenShotAndUploadToIpfs(setLoading);
            MintNFT(account, web3Context, Uri, setLoading);
          } catch (e) {
            setLoading(false);
          }
        });
      }}
    >
      MintNow
    </div>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ConnectWallet({ connectWallet }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "0",
        right: "0",
        bottom: "30px",
        zIndex: "1000",
        fontFamily: "Inter var",
        fontWeight: "1000",
        textAlign: "center",
        cursor: "pointer",
        width: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
        padding: "0px 10px",
      }}
      className="mint"
      onClick={() => {
        console.log();
        connectWallet();
      }}
    >
      ConnectWallet
    </div>
  );
}

function MintNFT(account, web3Context, Uri, setLoading) {
  const web3 = new Web3(web3Context.library.currentProvider);
  const contract = new web3.eth.Contract(ABI, ContractAddress);
  console.log(account);
  contract.methods
    .mint(account, Uri)
    .send({ from: account })
    .on("transactionHash", (hash) => {
      console.log("transaction hash: " + hash);
    })
    .on("confirmation", async function (confirmationNumber) {
      if (confirmationNumber === 1) {
        setLoading(false, true);
      }
    })
    .on("error", async function (error) {
      setLoading(false);
      console.log(error);
    });
}

async function takeScreenShotAndUploadToIpfs() {
  let canvas = document.getElementById("canvas");
  let image = canvas.children[0].toDataURL("image/jpeg", 1);

  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  const img = await ipfs.add({
    path: "CryptoSneaker",
    content: dataURItoBlob(image),
  });

  let tempString =
    state.items.laces +
    "," +
    state.items.mesh +
    "," +
    state.items.caps +
    "," +
    state.items.inner +
    "," +
    state.items.sole +
    "," +
    state.items.stripes +
    "," +
    state.items.band +
    "," +
    state.items.patch;

  let URI_Obj = {
    name: "CryptoSneaker-" + Date.now(),
    description: "CryptoSneaker is a collection of customized 3D sneaker NFTs.",
    image: "https://ipfs.infura.io/ipfs/" + img.cid.toString(),
    image3D: "https://cryptosneaker.web.app/" + tempString,
  };

  console.log(URI_Obj.image3D);

  let URI = await ipfs.add(JSON.stringify(URI_Obj));

  return "https://ipfs.infura.io/ipfs/" + URI.cid.toString();
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(",")[1]);
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}

export default function App() {
  const { active, activate, account } = useWeb3React();
  const web3Context = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [successful, setSuccessful] = useState(false);

  const metamaskConnector = new InjectedConnector({
    supportedChainIds: [4],
  });

  const orbitControls = useResource();

  function resetPosition() {
    orbitControls.current.reset();
  }

  function getErrorMessage(error) {
    if (error instanceof NoEthereumProviderError) {
      return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
    } else if (error instanceof UnsupportedChainIdError) {
      return `You're connected to an unsupported network. Please switch to Rinkeby Testnet.`;
    } else if (error instanceof UserRejectedRequestError) {
      return "Please authorize this website to access your Ethereum account.";
    } else {
      console.error(error);
      return "An unknown error occurred. Check the console for more details.";
    }
  }

  async function connectWallet() {
    await activate(metamaskConnector, (err) => {
      alert(getErrorMessage(err));
    });
  }

  function setLoadingModal(status, success) {
    setLoading(status);
    if (success) {
      setSuccessful(true);
    }
  }

  useEffect(() => {
    if (window.location.href.split("/")[3]) {
      let colors = window.location.href.split("/")[3].split(",");
      if (colors.length == 8) {
        state.items = {
          laces: colors[0],
          mesh: colors[1],
          caps: colors[2],
          inner: colors[3],
          sole: colors[4],
          stripes: colors[5],
          band: colors[6],
          patch: colors[7],
        };
      }
    }
  }, []);

  return (
    <>
      <Canvas
        id="canvas"
        concurrent
        pixelRatio={[1, 1.5]}
        camera={{ position: [0, 0, 2.75] }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.3} />
        <spotLight
          intensity={0.3}
          angle={0.1}
          penumbra={1}
          position={[5, 25, 20]}
        />
        <Suspense fallback={null}>
          <Shoe />
          <Environment files="royal_esplanade_1k.hdr" />
          <ContactShadows
            rotation-x={Math.PI / 2}
            position={[0, -0.8, 0]}
            opacity={1}
            width={10}
            height={10}
            blur={2}
            far={1}
          />
        </Suspense>
        <OrbitControls
          ref={orbitControls}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
      <Picker />
      <Heading />
      <Customize />
      {active ? (
        <MintNow
          account={account}
          web3Context={web3Context}
          resetPosition={resetPosition}
          setLoading={setLoadingModal}
        />
      ) : (
        <ConnectWallet connectWallet={connectWallet} />
      )}
      {loading ? <Loading /> : null}
      {successful ? (
        <Successful account={account} setSuccessful={setSuccessful} />
      ) : null}
    </>
  );
}
