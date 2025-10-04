"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface CategoryData { id: string; name: string; color: string }
interface TransactionData { id: string; categoryId: string; amount: number; type: "expense" | "income" }
interface GoalData { id: string; title: string; targetAmount: number; currentAmount: number; }
interface VoucherData { id: string; amount: number; type: string }

export function ThreeVisualization() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const labelRendererRef = useRef<CSS2DRenderer>()
  const animationRef = useRef<number>()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const { user } = useAuth()

  const [dataLoaded, setDataLoaded] = useState(false)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [goals, setGoals] = useState<GoalData[]>([])
  const [vouchers, setVouchers] = useState<VoucherData[]>([])
  const [hoverInfo, setHoverInfo] = useState<string>("")

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const catSnap = await getDocs(query(collection(db, "categories"), where("userId", "==", user.uid)))
      const cats = catSnap.docs.map(d => ({ id: d.id, name: d.data().name, color: d.data().color || "#10b981" }))
      setCategories(cats)

      const txSnap = await getDocs(query(collection(db, "expenses"), where("userId", "==", user.uid)))
      const txs = txSnap.docs.map(d => ({
        id: d.id,
        categoryId: d.data().categoryId,
        amount: d.data().amount,
        type: d.data().type
      }))
      setTransactions(txs)

      const goalSnap = await getDocs(query(collection(db, "goals"), where("userId", "==", user.uid)))
      const gs = goalSnap.docs.map(d => ({
        id: d.id,
        title: d.data().title,
        targetAmount: d.data().targetAmount,
        currentAmount: d.data().currentAmount
      }))
      setGoals(gs)

      const vSnap = await getDocs(query(collection(db, "vouchers"), where("userId", "==", user.uid)))
      const vs = vSnap.docs.map(d => ({ id: d.id, amount: d.data().amount, type: d.data().type }))
      setVouchers(vs)

      setDataLoaded(true)
    }
    fetchData()
  }, [user])

  // ---------------- Three.js Initialization ----------------
  useEffect(() => {
    if (!mountRef.current || !dataLoaded) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 12
    camera.position.y = 4

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // CSS2DRenderer for labels
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    labelRenderer.domElement.style.position = "absolute"
    labelRenderer.domElement.style.top = "0px"
    mountRef.current.appendChild(labelRenderer.domElement)
    labelRendererRef.current = labelRenderer

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(10, 10, 5)
    dirLight.castShadow = true
    scene.add(dirLight)

    const objects: THREE.Mesh[] = []

    // Categories/Expenses Bars
    categories.forEach((cat, index) => {
      const total = transactions.filter(t => t.categoryId === cat.id && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)
      const height = Math.max(total / 100, 0.2)
      const geom = new THREE.BoxGeometry(0.6, height, 0.6)
      const mat = new THREE.MeshLambertMaterial({ color: cat.color })
      const bar = new THREE.Mesh(geom, mat)
      bar.position.x = index * 1.2 - categories.length / 2
      bar.position.y = height / 2
      scene.add(bar)
      objects.push(bar)

      // Label
      const div = document.createElement("div")
      div.className = "text-xs px-1 py-0.5 bg-white shadow rounded"
      div.textContent = `${cat.name}: $${total}`
      const label = new CSS2DObject(div)
      label.position.set(0, height / 2 + 0.3, 0)
      bar.add(label)
    })

    // Goals Spheres
    goals.forEach((g, i) => {
      const radius = Math.max(g.currentAmount / 200, 0.3)
      const geom = new THREE.SphereGeometry(radius, 16, 16)
      const mat = new THREE.MeshLambertMaterial({ color: 0xffa500 })
      const sphere = new THREE.Mesh(geom, mat)
      sphere.position.x = i * 1.5 - goals.length / 2
      sphere.position.y = radius
      sphere.position.z = -3
      scene.add(sphere)
      objects.push(sphere)

      const div = document.createElement("div")
      div.className = "text-xs px-1 py-0.5 bg-white shadow rounded"
      div.textContent = `${g.title}: ${g.currentAmount}/${g.targetAmount}`
      const label = new CSS2DObject(div)
      label.position.set(0, radius + 0.3, 0)
      sphere.add(label)
    })

    // Vouchers
    vouchers.forEach((v, i) => {
      const size = Math.max(v.amount / 200, 0.3)
      const geom = new THREE.BoxGeometry(size / 2, size / 2, size / 2)
      const mat = new THREE.MeshLambertMaterial({ color: v.type === "expense" ? 0xff0000 : 0x00ff00 })
      const cube = new THREE.Mesh(geom, mat)
      cube.position.x = i * 1 - vouchers.length / 2
      cube.position.y = size / 2
      cube.position.z = 3
      scene.add(cube)
      objects.push(cube)

      const div = document.createElement("div")
      div.className = "text-xs px-1 py-0.5 bg-white shadow rounded"
      div.textContent = `Voucher: $${v.amount} (${v.type})`
      const label = new CSS2DObject(div)
      label.position.set(0, size / 2 + 0.3, 0)
      cube.add(label)
    })

    // Ground
    const planeGeom = new THREE.PlaneGeometry(30, 30)
    const planeMat = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 })
    const plane = new THREE.Mesh(planeGeom, planeMat)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -0.5
    plane.receiveShadow = true
    scene.add(plane)

    // Hover interaction
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current || !camera) return
      const rect = mountRef.current.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      raycaster.current.setFromCamera(mouse.current, camera)
      const intersects = raycaster.current.intersectObjects(objects)
      if (intersects.length > 0) {
        const obj = intersects[0].object
        setHoverInfo(`Object: ${obj.uuid}`)
      } else {
        setHoverInfo("")
      }

      scene.rotation.y += 0.001
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }
    animate()

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !labelRendererRef.current) return
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
      labelRendererRef.current.setSize(width, height)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement)
      if (mountRef.current && labelRenderer.domElement) mountRef.current.removeChild(labelRenderer.domElement)
      renderer.dispose()
    }
  }, [dataLoaded, categories, transactions, goals, vouchers])

  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Dashboard</CardTitle>
        <CardDescription>
          Visual representation of your expenses, goals, and vouchers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div ref={mountRef} className="h-[500px] w-full rounded-lg overflow-hidden" />
          {hoverInfo && (
            <div className="absolute bottom-2 left-2 bg-white p-2 text-xs rounded shadow">
              {hoverInfo}
            </div>
          )}
          <div className="absolute top-2 right-2 bg-white p-2 text-xs rounded shadow">
            <strong>Legend:</strong>
            <div>🟥 Expense</div>
            <div>🟩 Income</div>
            <div>🟧 Goals</div>
            <div>⬜ Vouchers</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
