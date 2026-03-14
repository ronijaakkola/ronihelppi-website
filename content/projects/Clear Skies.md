---
date: 2025-10-06
description: "A star-gazing game made from scratch completely solo in 48 hours for the Ludum Dare 58 jam Compo category."
subtitle: "Jam game"
tags:
  - "#games"
coverImage: ../images/clear-skies-cover.png
coverImageAlt: "Screenshot of the Clear Skies game where the player is tasked to find constellations from the night sky."
meta:
  - label: "Team"
    value: "Solo"
  - label: "Duration"
    value: "10/2025"
  - label: "Skills"
    value: "Game design, Development, Pixel art, Composing"
    list: true
  - label: "Made with"
    value: "PICO-8, Aseprite"
    list: true
  - label: "Result"
    value: "29th Overall, 14th Innovation, 24th Mood, 272 participants"
    list: true
links:
  - label: "Play"
    url: "https://nashtanir.itch.io/clear-skies"
  - label: "Itch.io"
    url: "https://nashtanir.itch.io/clear-skies"
  - label: "Ludum Dare"
    url: "https://ldjam.com/events/ludum-dare/58/clear-skies"
---

**Clear Skies** is a star-gazing game that I created solo for the [Ludum Dare 58](https://ldjam.com/events/ludum-dare/58) jam. It was created for the Compo category, meaning that all code and assets must be made during the jam, and alone. I placed 29th overall out of 272 participants, and got 14th in Innovation and 24th in Mood categories.

The jam's theme was *collector*. I do a lot of star-gazing during winter time. Each night I pick a new target to hunt for and try to find it with my telescope. Finding a specific object from the night sky is not always an easy feat. This process is called *starhopping*. It means moving your telescope from a familiar star to another and finally (hopefully) reach the target destination.

This translated into a game quite nicely. I gave the player a book that listed star constellations they can find and the most notable stars of each constellation. Then, their task was to find them all using their telescope by connecting stars together similarly to how they were defined in the book. Due to the telescope, the player can only see a small portion of the sky at the same time. This forces them to naturally use the starhopping technique just as they would in real life.

![[clear-skies-gameplay-1.png|The player is tasked to connect stars to form constellations.]]

## Development

Clear Skies was developed using the [PICO-8 fantasy console](https://www.lexaloffle.com/pico-8.php). While it has very harsh limitations, it is one of my favorite platforms to make small games solo, as it features all the tools within the console itself. This means I was able to do coding, art and even sound effects and music directly inside the console.

![[clear-skies-pico-cartridge.png|PICO-8 cartridge of the game. PICO-8 games can be shared as a PNG cartridge image.]]

As stars in the game accurately simulate a portion of a real night sky, modelling it was an important task during the development. I ended up taking a screenshot of the sky, scaling it to the size of the map, and then drew stars on top of it using [Aseprite](https://www.aseprite.org/). This allowed me to easily get star distances right. I also used the relative brightness and color of the stars in the art. Even though the star color is not too apparent in real life, I felt it was necessary for the game. Combining the star size, name and color gave the player a lot of different ways to locate stars from the sky.

![[clear-skies-gameplay-2.png|A book that is given to a player to help them locate even the hardest constellations.]]

## Learnings

### Shared cartridge memory

PICO-8's bottom half of the spritesheet and the bottom half of the map live in the same cartridge memory. This is stated clearly in the documentation but I missed this when moving quickly during the jam. At first, I had my whole sky modelled in the map. However, the sky was so large that it ended up overlapping with my sprite sheet. Due to this, I had to refactor the whole sky rendering during the jam. I ended up drawing all the stars manually to the screen, skipping the map memory completely.

### Giving your players more than they need

I deliberately added a lot of ways the player could locate and recognize specific stars from the sky. The book not only lists names of notable stars but also shows their color and relative size (brightness). It was clear from the feedback that players used a lot of different strategies to locate constellations. Some used the color alone, some hunted for star names. As people tend to gravitate towards different kinds of hints, adding a few more is never going to do any harm.

![[clear-skies-gameplay-3.png|Connecting stars correctly marks the constellation collected. There are 11 constellations total.]]

You can try the game directly on your browser on [Itch.io](https://nashtanir.itch.io/clear-skies).