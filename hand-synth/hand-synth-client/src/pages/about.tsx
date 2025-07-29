import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const About = () => {
    return (
        <div className="p-20 flex justify-center">
        <Card className="max-w-2xl">
            <CardHeader>
            <CardTitle><img src={"logo.png"} alt="WaveForm Logo" width={200} height={200}></img></CardTitle>
            <p className="text-sm text-muted-foreground">The Synthesiser you control with your hand</p>
            </CardHeader>
            <CardContent>
            <div className="space-y-8">

                {/* Step 1: Chord Selection */}
                <div>
                <h3 className="font-semibold text-lg">1. Select Your Chord</h3>
                <p className="mt-1">
                    Use the interactive piano keyboard at the top to pick the notes
                    you want in your chord. As you click each key, the dropdown menu below
                    will update in real-time to show the selected notes and name of the chord.
                </p>
                <img
                    src="keyboard-demo.png"
                    alt="Interactive piano interface"
                    className="mt-4 rounded-md shadow-sm w-full object-cover border-amber-50 border"
                />
                </div>

                {/* Step 2: Map Gesture */}
                <div>
                <h3 className="font-semibold text-lg">2. Map to a Gesture</h3>
                <p className="mt-1">
                    Open the gesture dropdown menu and choose a hand gesture for your chord.
                    The dropdown intelligently lists your selected notes and chord name
                    alongside each gesture option, so you always know what you’re mapping.
                </p>
                <img
                    src="gesture-menu.png"
                    alt="Gesture selection dropdown"
                    className="mt-4 rounded-md shadow-sm w-full object-cover border-amber-50 border"
                />
                </div>

                {/* Step 3: Play with Your Hand */}
                <div>
                <h3 className="font-semibold text-lg">3. Play with Your Hand</h3>
                <p className="mt-1">
                    Position your hand in front of your webcam and perform the chosen gesture.
                    Our AI model will detect your hand pose and instantly play the mapped chord
                    through the onboard synthesiser.
                </p>
                <img
                    src="gesture-about.png"
                    alt="Hand performing gesture in front of webcam"
                    className="mt-4 rounded-md shadow-sm w-full object-cover border-amber-50 border"
                />
                </div>

                {/* Step 4: Stop the sound */}
                <div>
                <h3 className="font-semibold text-lg">4. Stop the synth with a fist</h3>
                <p className="mt-1">
                    In order to stop the synthesiser playing, use a fist gesture and the music will stop
                </p>
                <img
                    src="fist-about.png"
                    alt="fist in front of webcam"
                    className="mt-4 rounded-md shadow-sm w-full object-cover border-amber-50 border"
                />
                </div>

                {/* Step 5: MIDI Integration */}
                <div>
                <h3 className="font-semibold text-lg">4. Connect via MIDI</h3>
                <p className="mt-1">
                    Want to use your favourite software instruments? Plug WaveForm’s
                    MIDI-Out into your DAW to route the chords directly to virtual synths,
                    drum machines, or any MIDI-capable hardware.
                </p>
                <img
                    src="settings-about.png"
                    alt="MIDI out connection to DAW"
                    className="mt-4 rounded-md shadow-sm w-full object-cover border-amber-50 border"
                />
                </div>

            </div>
            </CardContent>
        </Card>
        </div>
    )
}

export default About