import React from 'react'
import { Slider } from './slider'
import { Card, CardContent, CardHeader, CardTitle } from './card'

const EffectsUnit = () => {
  return (
    <div>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-10'>
            <div className='space-y-2'>
              <p>Attack</p>
              <Slider></Slider>
            </div>
            <div className='space-y-2'>
              <p>Release</p>
              <Slider></Slider>
            </div>
            <div className='space-y-2'>
              <p>Decay</p>
              <Slider></Slider>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EffectsUnit