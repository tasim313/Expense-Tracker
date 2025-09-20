"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ThreeVisualization() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Create 3D expense categories visualization
    const categories = [
      { name: "Food", value: 300, color: 0x10b981 },
      { name: "Transport", value: 150, color: 0x3b82f6 },
      { name: "Bills", value: 400, color: 0xf59e0b },
      { name: "Entertainment", value: 200, color: 0xef4444 },
      { name: "Shopping", value: 250, color: 0x8b5cf6 },
    ]

    const maxValue = Math.max(...categories.map((c) => c.value))
    const bars: THREE.Mesh[] = []

    categories.forEach((category, index) => {
      const height = (category.value / maxValue) * 3
      const geometry = new THREE.BoxGeometry(0.5, height, 0.5)
      const material = new THREE.MeshLambertMaterial({ color: category.color })
      const bar = new THREE.Mesh(geometry, material)

      bar.position.x = (index - 2) * 1.2
      bar.position.y = height / 2
      bar.castShadow = true
      bar.receiveShadow = true

      scene.add(bar)
      bars.push(bar)
    })

    // Add a ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -0.5
    plane.receiveShadow = true
    scene.add(plane)

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      // Rotate the scene slowly
      scene.rotation.y += 0.005

      // Animate bars with a subtle bounce
      bars.forEach((bar, index) => {
        bar.position.y = Math.abs(Math.sin(Date.now() * 0.001 + index)) * 0.1 + bar.geometry.parameters.height / 2
      })

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Expense Categories</CardTitle>
        <CardDescription>Interactive 3D visualization of your spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={mountRef} className="h-[400px] w-full rounded-lg overflow-hidden" />
      </CardContent>
    </Card>
  )
}
