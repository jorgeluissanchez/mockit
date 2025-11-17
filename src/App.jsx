import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { IPhone13ProModel } from './IPhone13Pro'

// Componente para el iPhone con pantalla
function IPhone({ imageUrl }) {
  // Cargar la textura de la pantalla
  const screenTexture = useLoader(THREE.TextureLoader, imageUrl || '/screenip12.jpg')
  
  // Configurar la textura
  if (screenTexture) {
    screenTexture.flipY = false
    screenTexture.needsUpdate = true
  }
  
  return (
    <group position={[0, -1, 0]}>
      {/* Modelo del iPhone optimizado con gltfjsx */}
      <IPhone13ProModel screenTexture={screenTexture} scale={15} />
    </group>
  )
}

// Componente de carga
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 0]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  )
}

function App() {
  const { t, i18n } = useTranslation()
  const [screenImage, setScreenImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef(null)
  
  // Cambiar idioma
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    // Actualizar el HTML lang attribute
    document.documentElement.lang = lng
  }
  
  // Procesar y redimensionar imagen a resolución de iPhone 13 Pro
  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Resolución del iPhone 13 Pro: 1542 x 3334
          const targetWidth = 1542
          const targetHeight = 3334
          
          // Crear canvas para redimensionar
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')
          
          // Calcular dimensiones manteniendo aspect ratio
          const imgRatio = img.width / img.height
          const targetRatio = targetWidth / targetHeight
          
          let drawWidth, drawHeight, offsetX, offsetY
          
          if (imgRatio > targetRatio) {
            // Imagen más ancha - ajustar por altura
            drawHeight = targetHeight
            drawWidth = img.width * (targetHeight / img.height)
            offsetX = (targetWidth - drawWidth) / 2
            offsetY = 0
          } else {
            // Imagen más alta - ajustar por anchura
            drawWidth = targetWidth
            drawHeight = img.height * (targetWidth / img.width)
            offsetX = 0
            offsetY = (targetHeight - drawHeight) / 2
          }
          
          // Fondo negro
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, targetWidth, targetHeight)
          
          // Dibujar imagen centrada
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
          
          // Convertir a JPG con calidad 0.92 (SIN descargar automáticamente)
          canvas.toBlob((blob) => {
            const processedUrl = URL.createObjectURL(blob)
            resolve({ url: processedUrl, blob })
          }, 'image/jpeg', 0.92)
        }
        img.src = e.target.result
      }
      
      reader.readAsDataURL(file)
    })
  }
  
  // Manejar la carga de imagen
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      setIsProcessing(true)
      const { url } = await processImage(file)
      setScreenImage(url)
      setIsProcessing(false)
    }
  }
  
  // Resetear a imagen predeterminada
  const handleReset = () => {
    if (screenImage) {
      URL.revokeObjectURL(screenImage) // Liberar memoria
    }
    setScreenImage(null)
  }
  
  // Descargar el mockup como PNG sin fondo
  const handleDownloadMockup = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      // Crear un nuevo canvas con fondo transparente
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      const ctx = tempCanvas.getContext('2d')
      
      // Copiar el contenido del canvas 3D
      ctx.drawImage(canvas, 0, 0)
      
      // Descargar como PNG
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `iphone-mockup-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
  }
  
  return (
    <>
      {/* Main content - 3D Canvas */}
      <main className="w-full h-full" role="main" aria-label="iPhone 3D Mockup Viewer">
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, alpha: true }}
          style={{ background: '#ffffff' }}
        >
          {/* Luces sin reflejos con punto de luz */}
          <ambientLight intensity={5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} />
          <pointLight position={[0, 5, 3]} intensity={1.2} color="#ffffff" />
          <pointLight position={[3, -2, 5]} intensity={0.6} color="#e0e0e0" />
          
          {/* Controles de cámara */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
          
          {/* Modelo del iPhone */}
          <Suspense fallback={<Loader />}>
            <IPhone imageUrl={screenImage} key={screenImage || 'default'} />
          </Suspense>
        </Canvas>
      </main>
      
      {/* Sidebar lateral minimalista y no intrusiva */}
      <aside 
        className="fixed right-0 top-0 h-full w-56 md:w-64 bg-white border-l-2 border-black z-[100] flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.05)]"
        role="complementary"
        aria-label="Control Panel"
      >
        {/* Header */}
        <header className="p-4 md:p-6 border-b border-gray-200">
          <h1 className="text-sm md:text-base font-semibold text-black tracking-tight">
            {t('app.title')}
          </h1>
          
          {/* Language Selector */}
          <nav aria-label="Language selection" className="flex gap-2 mt-3">
            <button
              onClick={() => changeLanguage('es')}
              aria-label="Cambiar idioma a Español"
              aria-pressed={i18n.language === 'es'}
              className={`px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-all ${
                i18n.language === 'es'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => changeLanguage('en')}
              aria-label="Change language to English"
              aria-pressed={i18n.language === 'en'}
              className={`px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-all ${
                i18n.language === 'en'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              EN
            </button>
          </nav>
        </header>
        
        {/* Controls */}
        <section className="flex-1 p-4 md:p-6 flex flex-col gap-3 overflow-y-auto" aria-label="Image controls">
          {isProcessing ? (
            <div 
              className="px-3 py-2 text-center text-gray-500 text-[10px] md:text-xs font-medium uppercase tracking-wider border border-gray-300 bg-gray-50"
              role="status"
              aria-live="polite"
            >
              {t('buttons.processing')}
            </div>
          ) : (
            <>
              <label 
                htmlFor="image-input" 
                className="px-3 py-2 text-[10px] md:text-xs font-medium text-center cursor-pointer transition-all duration-200 border-2 border-black bg-black text-white uppercase tracking-wider hover:bg-white hover:text-black active:scale-95"
              >
                {t('buttons.loadImage')}
              </label>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Upload image file"
              />
            </>
          )}
          
          {screenImage && !isProcessing && (
            <button 
              onClick={handleReset}
              aria-label="Restore default image"
              className="px-3 py-2 text-[10px] md:text-xs font-medium text-center cursor-pointer transition-all duration-200 border border-gray-300 bg-white text-black uppercase tracking-wider hover:bg-gray-50 hover:border-black active:scale-95"
            >
              {t('buttons.restore')}
            </button>
          )}
          
          <button 
            onClick={handleDownloadMockup}
            aria-label="Download mockup as PNG"
            className="px-3 py-2 text-[10px] md:text-xs font-semibold text-center cursor-pointer transition-all duration-200 border-2 border-black bg-black text-white uppercase tracking-wider hover:bg-white hover:text-black active:scale-95"
          >
            {t('buttons.download')}
          </button>
          
          {/* Info - Solo visible en desktop */}
          <footer className="hidden md:block mt-auto pt-4 border-t border-gray-200">
            <p className="text-[10px] text-gray-500 leading-relaxed">
              <strong className="font-medium text-black block mb-1">{t('controls.title')}</strong>
              {t('controls.rotate')}<br/>
              {t('controls.move')}<br/>
              {t('controls.zoom')}
            </p>
          </footer>
        </section>
      </aside>
    </>
  )
}

export default App

