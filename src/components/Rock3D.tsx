import React, { useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

interface Rock3DProps {
  position: [number, number, number]
}

const Rock3D: React.FC<Rock3DProps> = ({ position }) => {
  const obj = useLoader(OBJLoader, '/images/rocks/rock1.obj')
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={meshRef} position={position} scale={[0.1, 0.1, 0.1]}>  // Reduced scale from 0.5 to 0.1
      <primitive object={obj} />
    </mesh>
  )
}

export default Rock3D
