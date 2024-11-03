'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#FF6D01', '#46BDC6', '#7BAAF7', '#F07B72']

export function WheelOfNamesComponent() {
  const [names, setNames] = useState<string[]>([])
  const [currentName, setCurrentName] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    drawWheel()
  }, [names])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(e.target.value)
  }

  const handleAddName = () => {
    if (currentName.trim() !== '') {
      setNames([...names, currentName.trim()])
      setCurrentName('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddName()
    }
  }

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    if (names.length === 0) {
      ctx.font = '20px Arial'
      ctx.fillStyle = '#000'
      ctx.textAlign = 'center'
      ctx.fillText('Add names to spin the wheel', centerX, centerY)
      return
    }

    const sliceAngle = (2 * Math.PI) / names.length

    names.forEach((name, index) => {
      const startAngle = index * sliceAngle
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = COLORS[index % COLORS.length]
      ctx.fill()

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = '16px Arial'
      ctx.fillText(name, radius - 10, 0)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()

    // Draw spin text
    ctx.font = '14px Arial'
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.fillText('Click to spin', centerX, centerY + 5)
  }

  const spinWheel = () => {
    if (names.length === 0 || spinning) return

    setSpinning(true)
    setWinner('')

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    let currentAngle = 0
    const totalAngle = 360 * 5 + Math.random() * 360 // 5 full rotations + random angle

    const spinAnimation = () => {
      currentAngle += 10
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((currentAngle * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
      drawWheel()
      ctx.restore()

      if (currentAngle < totalAngle) {
        requestAnimationFrame(spinAnimation)
      } else {
        setSpinning(false)
        const winnerIndex = Math.floor((currentAngle % 360) / (360 / names.length))
        setWinner(names[winnerIndex])
      }
    }

    spinAnimation()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Wheel of Names</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="border border-gray-300 rounded-full cursor-pointer"
              onClick={spinWheel}
              aria-label="Spin the wheel"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && spinWheel()}
            />
            {winner && (
              <p className="mt-4 text-center font-semibold">
                Winner: <span className="text-green-600">{winner}</span>
              </p>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter a name"
                value={currentName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                aria-label="Enter a name"
              />
              <Button onClick={handleAddName}>Add</Button>
            </div>
            <div className="bg-white p-4 rounded-md shadow">
              <h3 className="font-semibold mb-2">Names on the wheel:</h3>
              <ul className="list-disc pl-5">
                {names.map((name, index) => (
                  <li key={index} style={{color: COLORS[index % COLORS.length]}}>{name}</li>
                ))}
              </ul>
            </div>
            <Button onClick={spinWheel} disabled={spinning || names.length === 0} className="w-full">
              {spinning ? 'Spinning...' : 'Spin the Wheel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}