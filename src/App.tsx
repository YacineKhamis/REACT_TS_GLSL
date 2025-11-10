import { Canvas } from "@react-three/fiber";
import Plane from "./components/Plane";

export default function App() {
  return (
    <Canvas style={{ background: "black" }} orthographic camera={{ zoom: 1, position: [0, 0, 10] }}>
      <Plane />
    </Canvas>
  );
}