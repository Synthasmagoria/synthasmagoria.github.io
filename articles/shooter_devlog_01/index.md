# Shooter Devlog 01
Over a game of poker after my good friends asked about my financial situation I puzzlingly told them that I'd be able to finish and distribute a game on Steam within a month if I lock in 100%. Doing so would do nothing to address my lack of money, it would actually take away precious time from looking for jobs and worrying about responsible adult things. However, after showing them my willingness to commit - and weirdly they didn't stop me there - my good homie Jorge decided to help with the project management aspect and newly made acquaintance; Ollie said he might be able to help with sound design. That got me excited to commit.

The next day I met up with Jorge. I explained to him that my idea was to make a [THOTH](https://store.steampowered.com/app/510620/THOTH/)-inspired twin stick shooter with a wacky gimmick to increase the difficulty. After discussing the concept in detail we agreed that this game idea would be very doable to finish developing within the given time period. Now, 2 weeks in, and I've almost got a game loop to show for it.

2 weeks for a game loop is not that great of a speed considering people create finished games in 2 days at game jams. But I don't get much joy from taking all of the shortcuts. My goal is to learn from the experience while making something that is of high quality. And to me that - in part - means culling anything I deem to be unnecessary from the code base. As such, I've chosen to make the game using [Raylib](https://www.raylib.com/) and [Odin](https://odin-lang.org/). The modern famous combo for indie code-nerd solo devs.

## The idea for the game
A while ago I experimented with some wobbly physics based movement for a game I made in collaboration with PrinceOfLight.
![](seeker.mp4)
It's somewhat hard to spot from the footage alone, but the player is a polygon consisting of several points affected by physics. In an attempt to keep its own structural integrity it ends up wobbling around violently challenging the player to a dance of speed and control.

For "Shooter" (working title) I'm going to implement the same thing, and apply it gradually as the player progresses. The idea is that the player will start a run with completely tight control over the player, and become gradually more loose as they score more points. All the while having to fend of murderous shapes and an ever-morphing level layout.

The goal is to aim for the high score by defeating as many enemies as possible. Here's what a test build of the game looks like so far:

![](game.mp4)

The idea is very simple: You enter an arena with a few enemies. You kill them while avoiding them and the deadly walls surrounding you. And then, the next level phases in. You get one point per enemy you defeat.
One thing I want to implement to set the game apart from its contemporaries, is having new levels phase in over the old ones in order to give the player a limited preview of the next level, allowing them to position themselves favorably before the next level activates.

There are a lot of other gimmicks that I'm planning on adding to the game but, for now I just want to focus on nailing the design of the basic formula. I might go into detail about those ideas in a future blog post.

## Technical things
I was inspired by interviews and videos about data driven systems such as this video of Anton livecoding a "system of things" on the Wookash podcast
[](https://www.youtube.com/watch?v=ShSGHb65f3M)
Therefore, I decided to make everything in the game based around a single entity fat-struct with traits and type fields. The idea is that I wont have to balance a bunch of different types. It reduces complexity at the cost of introducing some redundancy in the data and a little bit of bug-proneness like in the lantern example given in Casey's interview of Mahk le Blanc.
[](https://www.youtube.com/watch?v=73Do0OScoOU)
Mahk describes how the lantern used the `hp` field of the common entity for fuel. And since it is common behavior for things to lose `hp` when thrown at a wall the engine would consider the lantern as having been *killed* upon hitting the wall at low fuel, making it disappear outright. 
I'm not worried about the redundancy nor the "lack of sophistication" of fat structs since the game wont ever have a terribly high amount of entities and entity types/traits. Here's the current Entity struct:

```odin
Entity :: struct {
	state: EntityState,
	type: EntityType,
	traits: bit_set[EntityTrait],
	id: int,
	owner: ^Entity,
	level_instance: ^LevelInstance,
	position, velocity: v2,
	target: v2,
	size: v2,
	speed: f32,
	hp, hp_max: f32,
	hp_regeneration_rate: f32,
	point_count: int,
}
```
The current entity struct is 88 bytes in size which means I can fit around 760 of them in 64kb which google tells me is a common L1 cache size. So I'm not too worried about running performance problems on the account of the sheer amount of entities.

This approach has been working out beautifully so far. It is flexible and simple. This will most likely hold up for the duration of the development of the game.

## Bug blooper reel
I accidentally gave the player's projectile pool the wrong entities. So whenever I wanted to fire projectiles it would use the level's walls and enemies instead.
![](entities_bug.mp4)
This is what happens when you forget to clear the framebuffer. (classic)
![](screenbuffer.mp4)

## Code status
```
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
Odin                            10            351             14           2639
GLSL                            11             67              0            425
JSON                             2              0              0             36
Bourne Shell                     1              0              0              1
Markdown                         1              0              0              1
-------------------------------------------------------------------------------
SUM:                            25            418             14           3102
-------------------------------------------------------------------------------
```
*jesus christ its JSON Bourne Shell*
