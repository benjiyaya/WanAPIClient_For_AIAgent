# Wan Video Prompting Skill

## Overview

This skill provides expert guidance for creating high-quality prompts for **Alibaba Cloud's Wan Video models** (Wan 2.2, 2.5, 2.6, 2.7). Master structured prompting to generate professional videos with precise control over visuals, motion, and audio.

## Core Prompt Formulas

### 1. Basic Formula (Text-to-Video)

**`Prompt = Entity + Scene + Motion`**

Simple, flexible prompts for creative exploration.

**Components:**
- **Entity**: Main subject (person, animal, plant, object, or imaginary)
- **Scene**: Environment (background + foreground, real or imaginary)
- **Motion**: Movement of entity and scene elements (still → slight → large → overall)

**Example:**
```
A fluffy kitten (Entity) in a snow-covered winter yard (Scene) 
rolls a snowball, then sneezes and tumbles (Motion).
```

---

### 2. Advanced Formula (Text-to-Video)

**`Prompt = Entity + Scene + Motion + Aesthetic Control + Stylization`**

Richer descriptions for professional quality.

**Components:**

#### Entity Description
- Appearance details (adjectives, short phrases)
- Example: "a young Miao girl with black hair in ethnic costume"
- Example: "a celestial fairy with tattered magnificent clothes and debris wings"

#### Scene Description  
- Environment details
- Background and foreground elements
- Example: "snow-covered yard with frosted branches and distant snowman"

#### Motion Description
- Movement amplitude, speed, and effect
- Example: "swaying violently," "moving slowly," "shattering glass"

#### Aesthetic Control
- **Light source**: Daylight, firelight, overcast, clear sky
- **Lighting**: Soft, hard, side, rim, high contrast
- **Shot size**: Close-up, close shot, wide-angle
- **Camera angle**: Over-the-shoulder, high-angle, aerial
- **Lens**: Long-focus, ultra-wide-angle fisheye
- **Camera movement**: Pushes in, moves left, fixed

#### Stylization
- Visual style keywords
- Example: "cyberpunk," "line art illustration," "wasteland style"

**Complete Example:**
```
A celestial fairy with tattered magnificent clothes and 
debris wings (Entity), in a ruined city with floating 
fragments (Scene), gracefully floats upward while debris 
circles around her (Motion), captured with soft lighting, 
low-angle shot, long-focus lens (Aesthetic), in a dreamy 
fantasy style (Stylization).
```

---

### 3. Image-to-Video Formula

**`Prompt = Motion + Camera Movement`**

Image defines entity, scene, style—describe motion only.

**Components:**
- **Motion**: Movement of elements in the image
  - Example: "people running," "animals waving"
  - Control speed: "quickly," "slowly"
- **Camera Movement**: Specific camera motion
  - Example: "camera pushes in," "camera moves left"
  - Static: "fixed camera"

**Example:**
```
The woman's hair flows gently in the breeze and her 
dress ripples softly (Motion), camera slowly pushes in 
toward her face (Camera Movement).
```

---

### 4. Sound Formula (Wan 2.5/2.6)

**`Prompt = Entity + Scene + Motion + Sound Description`**

Add voices, SFX, and BGM for synchronized audio.

#### Voice Formula
**`Voice = Character's Lines + Emotion + Tone + Speed + Timbre + Accent`**

Example:
```
A man says "Study hard and make progress every day" 
in a relaxed tone, moderate speed, clear voice, 
American English accent.
```

#### Sound Effect Formula
**`Sound Effect = Source Material + Action + Ambient Sound`**

Example:
```
A glass ball falls onto wooden floor making a "thud" 
sound in a quiet indoor environment.
```

#### Background Music Formula
**`BGM = Music/Score + Style`**

Example:
```
Suspenseful background music on a rainy night in 
a spooky corridor.
```

**Complete Sound Example:**
```
A fluffy kitten plays in snow (Entity+Scene+Motion).
Sound: Soft "crunch" of paws, "swish" of rolling snowball,
"kitten sneeze," gentle piano nursery rhyme BGM.
```

---

### 5. Reference-to-Video Formula (Wan 2.6)

**`Prompt = Character + Action + Lines + Scene`**

Reference character(s) from input video.

**Components:**
- **Character**: Use `character1`, `character2`, `character3`
- **Action**: Motion, expression, emotion, body movement
- **Lines**: Spoken content (single or dialogue)
- **Scene**: Environment

**Example:**
```
This is a whimsical fairytale scene. character1 (rabbit) 
is jumping on grass. character2 (dog) plays piano under 
apple tree. An apple falls on character2's head. character1 
points and says happily: "You're going to become a scientist!"
```

---

### 6. Multi-Shot Formula (Wan 2.6)

**`Prompt = Overall Description + [Shot # + Timestamp + Shot Content]`**

Coherent multi-shot narrative videos.

**Components:**
- **Overall Description**: Theme, narrative style, emotion
- **Shot Number**: Distinguish sequence
- **Timestamp**: Time range for each shot (e.g., `[0–3 s]`)
- **Shot Content**: Actions, speech, expressions, posture

**Complete Example:**
```
This story is a short play about hope, third-person perspective.

Shot 1 [0–3 s] A boy sits alone in playground corner, 
looking at letter, sighs softly, confused.

Shot 2 [4–6 s] Hard cut, fixed camera, close-up on 
boy's teary eyes, showing loss.

Shot 3 [7–10 s] Hard cut, classroom scene. Girl with 
gentle smile walks to boy to comfort him.
```

---

## Prompt Optimization Techniques

### 1. Automatic Optimization
Enable `prompt_extend: true` in API calls for automatic short-prompt enhancement.

**Input:** "A kitten plays with a snowball"
**Optimized:** Full detailed prompt with sound, lighting, motion

### 2. LLM-Assisted Prompt Generation
Use qwen3.6-plus or similar to generate structured prompts from formulas.

```python
client.chat.completions.create(
    model="qwen3.6-plus",
    messages=[
        {"role": "system", "content": "Prompt formula: Entity + Scene + Motion + Sound"},
        {"role": "user", "content": "A kitten plays with snowball"}
    ]
)
```

---

## Cinematic Aesthetic Control

### Light Source Types
- **Daylight**: Natural sunlight, warm tones
- **Firelight**: Warm flickering, cozy atmosphere
- **Overcast**: Soft, diffused, cool tones
- **Clear Sky**: Bright, high contrast

### Light Types
- **Soft Light**: Even, gentle shadows
- **Hard Light**: Sharp shadows, dramatic
- **Side Light**: Directional, depth
- **High Contrast**: Bold light/dark separation

### Time of Day
- **Daytime**: Bright, warm, energetic
- **Night**: Dark, practical light, intimate
- **Dawn**: Cool, hopeful, soft
- **Sunset**: Warm, golden, romantic

### Shot Sizes
- **Close-up**: Face, details, emotion
- **Close Shot**: Upper body, interaction
- **Wide-Angle**: Full scene, environment
- **Extreme Full**: Landscape, establishing

### Composition
- **Center**: Focused, balanced
- **Left/Right-Weighted**: Dynamic, asymmetric
- **Over-the-Shoulder**: Dialogue, perspective
- **High-Angle**: Dominance, overview
- **Aerial**: Grand scale, geography

### Camera Angles
- **Over-the-Shoulder**: Intimate conversation
- **High-Angle**: Vulnerability, overview
- **Low-Angle**: Power, grandeur
- **Aerial**: Epic scale

### Lens Types
- **Long-Focus**: Telephoto, compressed depth
- **Ultra-Wide/Fisheye**: Distorted, expansive
- **Wide-Angle**: Natural perspective

### Shot Types
- **Clean Single**: One subject, isolated
- **Two-Shot**: Two subjects, interaction
- **Group Shot**: Multiple subjects
- **Establishing**: Scene context, location

### Tones
- **Warm Tones**: Cozy, happy, nostalgic
- **Cool Tones**: Calm, professional, distant
- **Low Saturation**: Muted, artistic
- **High Saturation**: Vibrant, energetic

---

## Sound Generation Examples

### Voice Types

#### Single Speaker
```
Single speaker, low angle shot, daylight. 
A woman whispers: "Is this freedom... or just another kind of frame?"
Ambient: gentle orchestral strings.
```

#### Group Conversation
```
Group conversation, warm colors, daylight. 
Man: "We can't keep pretending." 
Woman: "But what if forgetting hurts more?"
```

#### Timbre (Voice Quality)
```
Young girl, innocent tenderness: "Don't be afraid, I'll protect you."
Voice barely above a breath.
```

#### Singing
```
Woman softly hums: "Follow the light, where wild flowers grow."
Accompanied by gentle folk guitar.
```

### Sound Effects

#### Natural
- **Footsteps**: "crunch" of snow, "clatter" of metal
- **Knocking**: Precise rhythm, "tap-tap-THUMP"
- **Object Falling**: "crisp tap" of ping-pong ball

#### Environmental
- **Fire**: "crackling" embers
- **Rain**: "patter" on leaves
- **Wind**: "whoosh" through trees

#### Synthetic
- **Electronic**: "glitch" sounds, "hum" of devices
- **Game**: 8-bit "ding!", "clank" of treasure chest
- **ASMR**: "hiss" of cutting, "crunch" of clouds

#### Animal
- **Birds**: "chirping," "cawing"
- **Dogs**: "barking," "whining"
- **Sheep**: "baa" in distance

### Ambient Sound

#### Natural Environment
```
Gentle rustling of leaves, distant birds chirping, 
breeze through petals.
```

#### Urban Environment
```
Train rumble on tracks, city hum, brake screech, 
muffled PA announcements.
```

#### Specific Space
```
Cosmic background radiation, slight metallic clicks 
from spacecraft temperature changes.
```

### Background Music

#### Emotional
```
Warm and happy atmospheric music, soft acoustic guitar, 
subtle fabric rustle.
```

#### Beat-Synced
```
Funk music with clear drum beat, groovy bassline, 
retro synthesizer.
```

#### Light
```
Quiet piano melody with crisp chimes, serene atmosphere.
```

---

## Best Practices

### ✅ Do's

1. **Use structured formulas** for precise control
2. **Be specific about motion** (speed, amplitude, direction)
3. **Describe lighting** (source, type, time of day)
4. **Include aesthetic keywords** (soft light, warm tones)
5. **Add sound elements** for synchronized audio (Wan 2.5+)
6. **Use prompt_extend: true** for short prompts
7. **Reference shots by timestamp** for multi-shot videos
8. **Specify camera movement** explicitly

### ❌ Don'ts

1. **Avoid vague prompts** like "nice video"
2. **Don't mix contradictory elements** (night + bright sunlight)
3. **Don't ignore motion** completely (results in static videos)
4. **Don't overcomplicate** with too many subjects
5. **Don't forget sound** if you want audio (it's optional)

---

## API Integration

### Basic Text-to-Video

```typescript
const result = await videoClient.videoFromFirstFrame({
  prompt: "A fluffy kitten plays with snow in winter yard, " +
          "rolls snowball, sneezes, jumps back, " +
          "soft daylight, low-angle shot, long-focus lens, " +
          "warm tones, cute and playful style",
  firstFrame: { url: "https://example.com/kitten.jpg" },
  size: "1280*720",
  duration: 5,
  fps: 8,
  motionStrength: 0.6,
  promptExtend: true,  // Enable auto-optimization
  watermark: false,
});
```

### With Sound (Wan 2.5+)

```typescript
const result = await videoClient.videoFromFirstFrame({
  prompt: "A fluffy kitten plays with snowball. " +
          "Sound: soft crunch of paws, sneeze, " +
          "gentle piano nursery rhyme BGM, " +
          "warm winter atmosphere",
  // ... other params
});
```

### Multi-Shot Video

```typescript
const result = await videoClient.videoFromFirstFrame({
  prompt: "Story about hope, third-person perspective. " +
          "Shot 1 [0-3s] Boy sits in playground, looks at letter. " +
          "Shot 2 [4-6s] Hard cut, close-up on teary eyes. " +
          "Shot 3 [7-10s] Hard cut, girl comforts boy.",
  // ... other params
});
```

---

## Quick Reference Card

| Formula | Use Case | Structure |
|---------|----------|-----------|
| **Basic** | Simple creative | Entity + Scene + Motion |
| **Advanced** | Professional quality | Entity + Scene + Motion + Aesthetic + Style |
| **Image-to-Video** | Motion from image | Motion + Camera Movement |
| **Sound** | Audio synchronization | + Sound Description |
| **Reference** | Character reuse | Character + Action + Lines + Scene |
| **Multi-Shot** | Narrative videos | Overall + [Shot # + Timestamp + Content] |

### Common Aesthetic Keywords
- **Lighting**: soft, hard, side, rim, daylight, firelight
- **Time**: daytime, night, dawn, sunset
- **Shot**: close-up, wide-angle, aerial, over-the-shoulder
- **Tone**: warm, cool, low saturation, high contrast
- **Style**: cyberpunk, fantasy, realistic, anime, film noir

### Motion Descriptors
- **Speed**: slowly, quickly, gradually, rapidly
- **Amplitude**: slight, moderate, violent, dramatic
- **Direction**: left to right, upward, downward, circular
- **Type**: swaying, floating, running, jumping, shattering

---

## Examples Library

### Example 1: Nature Scene
```
A majestic eagle soars through mountain peaks, 
wings spread wide, gliding on thermal currents, 
captured with wide-angle lens, golden hour lighting, 
epic cinematic style, thunder in distance.
```

### Example 2: Urban Life
```
A street musician plays violin on busy city corner, 
crowd gathers and applauds, golden afternoon light, 
medium shot, soft focus background, heartwarming atmosphere, 
violin music with crowd murmurs.
```

### Example 3: Fantasy
```
A celestial fairy floats through ancient ruins, 
debris orbits around her, ethereal mist swirls, 
soft lighting, low-angle shot, dreamy fantasy style, 
mystical ambient music with chimes.
```

### Example 4: Sci-Fi
```
A cyberpunk detective walks through neon-lit rainy alley, 
reflections on wet pavement, steam rises from vents, 
hard light, high contrast, noir aesthetic, 
synth-wave music with rain sounds.
```

---

## Troubleshooting

### Problem: Video too static
**Solution**: Add more motion descriptors (running, flowing, swaying)

### Problem: Colors too dull
**Solution**: Add "vibrant colors," "high saturation," "warm tones"

### Problem: Motion too chaotic
**Solution**: Specify motion amplitude (slight, moderate, controlled)

### Problem: Lighting too dark
**Solution**: Add "bright daylight," "soft lighting," "well-lit"

### Problem: Audio missing or unclear
**Solution**: Use Sound Formula explicitly (Voice + SFX + BGM)

### Problem: Characters inconsistent
**Solution**: Use Reference-to-Video formula with character1, character2

---

## Learning Resources

- [Wan Video API Reference](https://www.alibabacloud.com/help/en/model-studio/text-to-video-api-reference)
- [Image-to-Video API](https://www.alibabacloud.com/help/en/model-studio/image-to-video-api-reference)
- [Video-to-Video API](https://www.alibabacloud.com/help/en/model-studio/wan-video-to-video-api-reference)

---

*This skill is based on Alibaba Cloud's official Wan Video documentation. Use these formulas to create stunning AI-generated videos with professional quality.*
