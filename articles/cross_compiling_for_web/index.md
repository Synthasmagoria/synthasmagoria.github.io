# Thoughts on cross-compiling native / web
I recently made a little math tool using Raylib and Odin. It allows you to visualize what matrix math looks like.

<iframe frameborder="0" src="https://itch.io/embed-upload/19261103?color=333333" allowfullscreen="" width="100%" height="740"><a href="https://synthasmagoria.itch.io/transformation-visualizer">Play Transformation Visualizer on itch.io</a></iframe>

The reason I thought I could do this at all was 3 things:
- Karl Zylinski had made a Raylib Odin template that I had previously used for [Side-Exit](https://synthasmagoria.itch.io/side-exit)
- Raysan has made lots of [really cool tools](https://raylibtech.itch.io/) for Raylib that run on web
- A good friend of mine whith whom I'm developing a [multplayer game](https://playogi.com/mullar) has inspired me to try targeting web

I have done a few things on web in the past, and the main pain point for me was always the debugging. Having to use a completely different debugger in the browser from the one I'm used to using for native was a big drawback. So being able to target web without having to debug on the web sounded like a good idea.

## Honeymoon phase
Everything was great on the native side of things. After having briefly tested [Clay](https://www.nicbarker.com/clay) and [MicroUI](https://github.com/rxi/microui) for UI layout I decided to make [my own tiny immediate mode UI layout](https://offgrd.xyz/git/Synthasmagoria/snths_ui) library. I vendored in the latest Raylib and used its makefile to remove any parts I didn't need. To my delight I managed to get a working build down to 140kb on linux. I ended up making [my own Raylib template](https://offgrd.xyz/git/Synthasmagoria/raylib_project_template) with the custom settings made easy to access, Raylib+Raygui source code and the [odin-c-bindgen](https://github.com/karl-zylinski/odin-c-bindgen) sjson configs so that I can keep updating Raylib for my Odin projects in the future. My project was compiling for web, and things were going great so I added a bunch of features. Many features later I wanted to make a test build to put on itch, and that's when I realized how wrong things had been going without me noticing.

## Here be dragons
