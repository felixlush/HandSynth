import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Select, SelectItem, SelectValue } from './select'
import { SelectContent, SelectIcon, SelectTrigger } from '@radix-ui/react-select'

const gestures = [
    {value: "palm", label: "palm", path: "/palm-gesture.png"},
    {value: "peace", label: "peace", path: "/peace-gesture.png"},
    {value: "point", label: "point", path: "/point-gesture.png"},
    {value: "three-fingers", label: "three-fingers", path: "/three-finger.svg"},
]

interface GestureSelectProps {
    onGestureChange: (gesture: string) => void;
    selectedGesture: string;
}

const GestureSelect = ({onGestureChange, selectedGesture}: GestureSelectProps) => {

    return (
        <div>
            <Card className='border-accent-foreground overflow-auto'>

                <CardHeader>
                    <CardTitle>Gesture</CardTitle>
                </CardHeader>

                <CardContent>
                    <Select value={selectedGesture} onValueChange={onGestureChange} > 
                        <SelectTrigger>
                            <SelectValue placeholder="Select A Gesture"/>
                        </SelectTrigger>
                        <SelectContent 
                            position="popper"     // enable flip/offset logic
                            sideOffset={5}        // a little gap from the trigger
                            className="overflow-hidden rounded-md bg-blue-600 opacity-80 shadow-md"
                        >
                            {gestures.map((gesture) => (
                                <SelectItem key={gesture.value} value={gesture.value} className='flex items-center gap-2 p-2'>
                                    <img 
                                        src={gesture.path}
                                        alt={gesture.label}
                                        className="w-12 h-12 object-contain"
                                    />
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </div>
    )
}

export default GestureSelect