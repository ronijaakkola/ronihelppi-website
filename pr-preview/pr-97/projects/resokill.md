# RESOKILL

**RESOKILL** is a retro rhythm shooter built in one month for GitHub's annual [Game Off 2025 Jam](https://itch.io/jam/game-off-2025). Our team of three placed 36th overall out of 716 participants and 20th in Audio.

The jam's theme was *waves*. We interpreted it literally and mechanically: the player picks up a portable cassette player, inserts a tape, and wields a sound blaster that shoots sound waves against waves of enemies. Shooting in rhythm with the music lets the player unleash increasingly powerful blasts. Accurate shooting builds up a combo that increases damage — and part of that combo can be spent on a devastating piercing sound blast. A stats screen after each song tracks beat accuracy, encouraging players to chase tighter timing.

Beating a song unlocks the next cassette. Four custom tracks, composed by our sound designer, drive the game — each designed with clear, detectable beats at different tempos to support the rhythm mechanic. The visual intensity matches the audio: the dithered PS1-style graphics with aggressive screen effects.

![[resokill-gameplay-1.png|Players can build up their combo meter displayed directly in their gun.]]

## Development

We developed RESOKILL in Unity. Our team had experience with multiple game engines, but we preferred Unity's reliable WebGL export for game jams where browser playability matters.

I created the 3D models in Blender, with textures stitched together from CC0 sources. To nail the retro look, we built a custom dithering shader to emulate the way the PS1 rendered graphics.

![[resokill-gameplay-2.png|Using combo points allows the player to unleash a devastating sound blast.]]

## Learnings

### Rhythm games demand careful latency management

Many factors influence audio latency, and the game can feel very different across audio setups. We used FMOD and rewrote the beat detection system multiple times to get latency as low as possible. The WebGL build still struggled with timing precision, so we recommended players download the executable for the best experience. If I were to build another rhythm game, I'd include a latency calibration step at startup.

### Tying level length to song duration limited our options

Each level lasted exactly as long as its song. This made balancing difficult — we couldn't adjust level pacing without touching the music. Next time, I'd design looping tracks that give more control over the gameplay experience independent of the composition.

![[resokill-gameplay-3.png|During the four songs of the game, enemies get tougher and tougher.]]

You can try the game on [Itch.io](https://nashtanir.itch.io/resokill). For the best rhythm experience, I recommend the downloadable version.
