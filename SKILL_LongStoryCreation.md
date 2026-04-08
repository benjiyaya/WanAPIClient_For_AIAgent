# Long Story Creator Skill

**Purpose:** Create long-form stories with consistent characters, visual scenes, and complete scripts using Wan 2.7 Image API

**Location:** `.openclaw\workspace\WanAPIClient`

---

## 🎯 What This Skill Does

This skill provides a complete workflow for creating long-form visual stories (comics, graphic novels, K-dramas, short films, children's books) with:

- ✅ **Consistent Characters** - Same character appearance across all scenes
- ✅ **Organized Project Structure** - Multi-project support with proper folder organization
- ✅ **Complete Scripts** - Full screenplay format with dialogue, action, and camera directions
- ✅ **Batch Generation** - Generate entire chapters/episodes efficiently
- ✅ **Quality Control** - Reference images and consistency checking
- ✅ **Scalable Workflow** - From single test scenes to full book episodes


## 🏗️ Project Structure

```
WanAPIClient/
├── outputs/
│   └── project-name/
│       ├── 01-character-grid/
│       │   ├── [character]-grid.png
│       │   └── ...
│       ├── 02-storyboards/
│       │   └── chapter-XX-keyframes/
│       ├── 03-chapter-01/
│       │   ├── chapter-1-scene-01/
│       │   │   ├── 2026-04-01_14-30-22_chapter-1-scene-01.png
│       │   │   └── 2026-04-01_14-30-22_chapter-1-scene-01.json
│       │   └── chapter-1-scene-02/
│       ├── 04-chapter-02/
│       └── project-meta.json
│   └── [another-project]/
├── projects/
│   ├── [project-name]/
│   │   ├── character-sheets/
│   │   ├── story-plans/
│   │   ├── scenes-chapter-XX.json
│   │   └── scripts/
│   │       ├── Episode-01-[Title]-Script.md
│   │       ├── Episode-02-[Title]-Script.md
│   │       ├── Episode-03-[Title]-Script.md
│   │       └── Episode-04-[Title]-Script.md
├── scripts/
│   ├── scene-generator.js          # Single scene testing
│   ├── batch-generate.js           # Batch chapter generation
│   ├── character-grid-generator.js # Character sheet creation
│   ├── episode-generator.js        # Full episode generation (script + images)
│   └── examples/
│       ├── scenes-template.json
│       ├── episode-template.json   # Episode structure template
│       └── script-template.md      # Script format template
├── STORY-WORKFLOW-GUIDE.md
├── SCRIPT-WORKFLOW-GUIDE.md        # Script writing workflow
├── SKILL.md (this file)
└── .env
```

---

## 📝 Script Workflow

### **Step 1: Create Script Template**

Before generating images, create a detailed script for each episode:

**Script Structure Template:**
```markdown
# K-Drama: [Story Title]
## Episode [X]: "[Episode Title]" - Full Script

**Episode Duration:** 60-90 minutes  
**Genre:** Romance, Drama, Comedy  
**Rating:** TV-14

---

## MAIN CHARACTERS

**CHARACTER NAME (Age)**
- Description of appearance and personality
- Key character traits
- Voice characteristics

---

## SCENE-BY-SCENE BREAKDOWN

### SCENE [X]: [SCENE TITLE]
**Time:** [Time of day]  
**Location:** [Scene location]  
**Tone:** [Emotional tone]

**[VISUAL]**
Description of what the scene looks like

**[CINEMATOGRAPHY]**
Camera angles, shot types, lighting

**[SOUND]**
Music, effects, ambient sounds

**[ACTION]**
Character movements and actions

**[DIALOGUE]**
Character dialogue with emotional context

**[CUT TO]**
Transition to next scene
```

### **Step 2: Write Full Script**

Create scripts for each episode with:
- ✅ Complete screenplay format
- ✅ Scene-by-scene breakdown
- ✅ Character dialogue
- ✅ Action descriptions
- ✅ Emotional context
- ✅ Camera directions
- ✅ Sound design notes
- ✅ Production notes

### **Step 3: Define Key Scenes**

From the script, identify key scenes to visualize:
- **Establishing shots** (no characters)
- **Character introductions** (single character)
- **Dialogue scenes** (2-3 characters)
- **Emotional moments** (close-ups)
- **Climactic scenes** (action/revelation)

### **Step 4: Map Script to Images**

Create a mapping between script scenes and image keyframes:

```json
{
  "episode": 1,
  "script": "Episode-01-Title-Script.md",
  "scenes": [
    {
      "scene": 1,
      "script_description": "Main character introduction",
      "image_prompt": "Full body shot of [character] in [location]...",
      "resolution": "1280*960",
      "references": ["character-grid.png"]
    },
    {
      "scene": 2,
      "script_description": "Emotional revelation",
      "image_prompt": "Close-up of [character]'s face showing emotion...",
      "resolution": "720*1280",
      "references": ["character-grid.png"]
    }
  ]
}
```

---

## 🚀 Quick Start

### **Step 1: Set Up Your Project**

```bash
# Create project folder
mkdir projects/my-story

# Copy scene template
cp scripts/examples/scenes-template.json projects/my-story/scenes-chapter-1.json

# Create scripts directory
mkdir projects/my-story/scripts
```

### **Step 2: Create Character Reference Grid**

Generate a character design sheet showing multiple views:

**Prompt Template:**
```
Character design reference sheet for [character name]. 
Professional 3x2 grid layout on white background.
Top row: Front full body, side profile, 3/4 turn view.
Bottom row: Close-up neutral, smiling, angry expressions.
[Detailed physical description: hair style/color, eye color/shape, clothing details]
Clean lines, flat even lighting, concept art style, photorealistic photography style
```

**Save to:** `projects/my-story/[character]-grid.png`

### **Step 3: Write Episode Script**

Create a detailed script for Episode 1:

```markdown
# K-Drama: Love in the Kitchen
## Episode 1: "The Collision" - Full Script

**Episode Duration:** 60-90 minutes  
**Genre:** Romance, Drama  
**Rating:** TV-14

---

## MAIN CHARACTERS

**MIN-JUN (28)**
- Cold, arrogant tech CEO
- Sharp features, immaculate appearance
- Wears expensive suits
- Emotionally unavailable

**SOO-JI (26)**
- Warm, resilient food truck owner
- Natural beauty, kind eyes
- Wears casual aprons, denim jackets
- Independent and determined

---

## SCENE-BY-SCENE BREAKDOWN

### SCENE 1: ESTABLISHING SHOT - SEOUL CITYSCAPE
**Time:** 6:00 AM - Early Morning  
**Location:** Modern Seoul Business District  
**Tone:** Professional, Modern, Cold

**[VISUAL]**
Wide aerial drone shot of Seoul skyline at sunrise.

**[CINEMATOGRAPHY]**
DRONE SHOT - PULLING BACK slowly

**[SOUND]**
Distant city traffic, soft electronic music

**[ACTION]**
Fast-paced montage of Seoul waking up...

**[CUT TO]**
```

### **Step 4: Define Scene Prompts from Script**

Extract prompts from your script:

```json
{
  "project": "my-story-chapter-1",
  "scenes": [
    {
      "chapter": 1,
      "scene": 1,
      "prompt": "Wide establishing shot of modern Seoul cityscape at sunrise, glass skyscrapers, professional photography, photorealistic, 8k",
      "ref": [],
      "size": "1280*720"
    },
    {
      "chapter": 1,
      "scene": 2,
      "prompt": "Min-jun (image 1 Min-jun) standing imposingly in front of office building, wearing dark charcoal suit, confident expression, dramatic lighting, cinematic photograph, photorealistic",
      "ref": ["projects/my-story/minjun-grid.png"],
      "size": "1280*960"
    }
  ]
}
```

### **Step 5: Test One Scene**

```bash
node scripts/scene-generator.js \
  --project "my-story" \
  --chapter 1 \
  --scene 1 \
  --ref "projects/my-story/minjun-grid.png" \
  --prompt "Min-jun standing in front of office building..."
```

### **Step 6: Batch Generate Episode**

```bash
node scripts/batch-generate.js \
  --project "my-story" \
  --scenes-file "projects/my-story/scenes-chapter-1.json"
```

---

## 📚 Workflow Overview

### **Phase 1: Pre-Production**

1. **Character Development**
   - Define character traits in writing
   - Generate character reference grids
   - Lock facial features, hairstyle, signature items

2. **Story Planning**
   - Outline episode structure (16 episodes for K-drama format)
   - Write full scripts for each episode
   - Define key scenes per episode
   - Identify character appearances per scene

3. **Style Guide**
   - Create art style reference (photorealistic, anime, etc.)
   - Define color palette
   - Specify lighting approach
   - Set resolution standards

### **Phase 2: Production**

1. **Test Scenes**
   - Generate 2-3 key scenes first
   - Verify character consistency
   - Adjust prompts if needed

2. **Batch Generation**
   - Generate full episodes
   - Monitor for drift
   - Regenerate if needed

3. **Quality Control**
   - Review each scene
   - Compare against character grid
   - Document any adjustments
   - Check script alignment

### **Phase 3: Post-Production**

1. **Assembly**
   - Organize scenes in order
   - Add captions/dialogue from script
   - Export for platform

2. **Iteration**
   - Gather feedback
   - Document lessons learned
   - Adjust for next episode

---

## 📝 Script Creation Best Practices

### **Script Format Requirements**

Every episode script must include:
- ✅ **Episode Title and Number**
- ✅ **Main Characters List** (with descriptions)
- ✅ **Scene-by-Scene Breakdown**
- ✅ **Visual Descriptions** ([VISUAL])
- ✅ **Cinematography Notes** ([CINEMATOGRAPHY])
- ✅ **Sound Design** ([SOUND])
- ✅ **Character Actions** ([ACTION])
- ✅ **Complete Dialogue** ([DIALOGUE])
- ✅ **Scene Transitions** ([CUT TO])

### **Writing Tips**

**Scene Descriptions:**
- Be specific about lighting, colors, and atmosphere
- Describe camera angles and movements
- Include emotional context
- Use sensory details (sound, texture, temperature)

**Dialogue:**
- Keep character voices consistent
- Include emotional subtext
- Add action beats between lines
- Avoid exposition dumps

**Visual Consistency:**
- Reference character grids in descriptions
- Note lighting and color palette
- Specify camera angles clearly
- Maintain continuity between scenes

---

## 🎨 Consistency Techniques

### **Character Lock Checklist**

Before generating scenes, lock these in writing:

```markdown
CHARACTER: [Name]
- Head shape: [round/oval/angular]
- Eye spacing and eyelid shape: [describe]
- Nose bridge and tip: [describe]
- Lip line and mouth width: [describe]
- Hairline and part direction: [describe]
- Signature accessory: [describe]
- Clothing motif: [describe]
```

### **Prompt Template for Consistency**

```
[SCENE DESCRIPTION], same character as reference,
preserve exact face geometry (eye spacing, jawline, nose shape),
maintain hairline and hairstyle, keep [signature accessory],
keep costume details, consistent with reference image,
keep facial proportions unchanged, [additional scene details]
```

### **Reference Image Best Practices**

- ✅ Always use character grid as reference
- ✅ Crop best face view from grid
- ✅ Store grids in project folder
- ✅ Use multiple references for multi-character scenes
- ❌ Never use previous scene outputs as new references
- ❌ Don't change multiple variables at once

---

## 🎭 Multi-Character Scenes

The Wan 2.7 API supports **up to 4 reference images** for scenes with multiple characters. This enables complex group shots, conversations, battles, and ensemble scenes.

### **Supported Character Combinations**

| Scene Type | References | Use Case |
|-----------|-----|---------|
| Single character | 1 | Solo shots, close-ups, establishing scenes |
| Two characters | 2 | Conversations, duets, partnerships |
| Three characters | 3 | Trios, team formations, rivalries |
| Four characters | 4 | Full team shots, battles, group scenes |

### **Command Line: Multiple --ref Flags**

For **single scene testing** with multiple characters:

```bash
# 2 Characters (conversation)
node scripts/scene-generator.js \
  --project "my-story" \
  --chapter 1 --scene 2 \
  --ref "projects/my-story/protagonist-grid.png" \
  --ref "projects/my-story/mentor-grid.png" \
  --prompt "John and his mentor having a deep conversation in the dojo"

# 3 Characters (action scene)
node scripts/scene-generator.js \
  --project "my-story" \
  --chapter 1 --scene 3 \
  --ref "projects/my-story/protagonist-grid.png" \
  --ref "projects/my-story/sidekick-grid.png" \
  --ref "projects/my-story/villain-grid.png" \
  --prompt "Epic battle with John, Sarah and the villain facing off"

# 4 Characters (team formation)
node scripts/scene-generator.js \
  --project "my-story" \
  --chapter 2 --scene 1 \
  --ref "projects/my-story/hero-1-grid.png" \
  --ref "projects/my-story/hero-2-grid.png" \
  --ref "projects/my-story/hero-3-grid.png" \
  --ref "projects/my-story/hero-4-grid.png" \
  --prompt "The four heroes standing together in formation against the dark army"
```

### **Batch JSON: Multi-Character Scenes**

For **batch generation**, define character references as an **array** in `scenes.json`:

```json
{
  "project": "my-story",
  "scenes": [
    {
      "chapter": 1,
      "scene": 1,
      "prompt": "Wide establishing shot of the cyberpunk city at night",
      "ref": [],
      "size": "1280*720"
    },
    {
      "chapter": 1,
      "scene": 2,
      "prompt": "Close-up of detective John's face showing determination",
      "ref": ["projects/my-story/protagonist-grid.png"],
      "size": "720*1280"
    },
    {
      "chapter": 1,
      "scene": 3,
      "prompt": "John and Sarah meeting for the first time at the coffee shop",
      "ref": [
        "projects/my-story/protagonist-grid.png",
        "projects/my-story/sarah-grid.png"
      ],
      "size": "1280*960"
    },
    {
      "chapter": 1,
      "scene": 4,
      "prompt": "Epic confrontation between John, Sarah and the villain in the alley",
      "ref": [
        "projects/my-story/protagonist-grid.png",
        "projects/my-story/sarah-grid.png",
        "projects/my-story/villain-grid.png"
      ],
      "size": "1280*960"
    },
    {
      "chapter": 1,
      "scene": 5,
      "prompt": "Full team victory pose - all four heroes standing together",
      "ref": [
        "projects/my-story/hero-1-grid.png",
        "projects/my-story/hero-2-grid.png",
        "projects/my-story/hero-3-grid.png",
        "projects/my-story/hero-4-grid.png"
      ],
      "size": "1280*960"
    }
  ]
}
```

### **Multi-Character Prompt Engineering**

When using multiple character references, **be explicit in your prompt** about which reference is which:

**Prompt Template:**
```
[SCENE DESCRIPTION] featuring [CHARACTER A] and [CHARACTER B].
Use reference image 1 for CHARACTER A's face, hairstyle and clothing.
Use reference image 2 for CHARACTER B's face, hairstyle and clothing.
[CHARACTER A] and [CHARACTER B] must maintain exact facial features from their references.
[Additional scene details: lighting, environment, action, camera angle]
```

**Examples:**

2 Characters:
```
Scene of John and Sarah having coffee at a rooftop cafe.
Use reference image 1 for John's face, white hair, and black trench coat.
Use reference image 2 for Sarah's face, red hair, and blue jacket.
Both characters must maintain exact facial features from references.
Warm sunset lighting, cinematic composition, romantic atmosphere.
```

3 Characters:
```
Epic battle scene with John, Sarah and the villain in the dark alley.
Use reference image 1 for John's face and heroic fighting pose.
Use reference image 2 for Sarah's face and tech gadgets.
Use reference image 3 for the villain's scarred face and dark armor.
All three must maintain exact facial features from references.
Neon lights reflecting on wet pavement, dramatic action composition.
```

4 Characters:
```
The four heroes standing together for their victory pose.
Use reference image 1 for John's confident smile and leader stance.
Use reference image 2 for Sarah's determined expression and staff weapon.
Use reference image 3 for Mike's friendly wave and camera.
Use reference image 4 for Luna's mysterious smile and glowing powers.
All four must maintain exact facial features from references.
Golden hour lighting, epic wide shot, team solidarity atmosphere.
```

### **Order Matters**

The **order of references** matters:
- **First reference** = Primary character (usually protagonist)
- **Second reference** = Secondary character
- **Third/Fourth references** = Additional characters

Always lead with the most important character to ensure the model prioritizes their features correctly.

### **Character Placement Tips**

| Camera Angle | Recommended Order | Example |
|------|-----|-------|-|
| Wide shot | Hero left, allies right | John on left, Sarah on right |
| Close-up duo | Primary center | John center, villain behind |
| Group line | Height order | Shortest left, tallest right |
| Battle formation | Facing camera | All facing forward, hero center |

### **Handling More Than 4 Characters**

For scenes with **5+ characters**:

1. **Prioritize main 4** - Focus on the 4 most important characters
2. **Background silhouettes** - Describe others as background figures
3. **Split scenes** - Create multiple shots showing different groupings
4. **Establishing + detail** - Wide shot without faces, then close-up of specific groups

**Example prompt for 6-character scene:**
```
Group celebration scene with John, Sarah, Mike and Luna in the foreground.
Use reference image 1 for John's face and celebratory pose.
Use reference image 2 for Sarah's joyful expression.
Use reference image 3 for Mike's happy grin and camera.
Use reference image 4 for Luna's content smile and glowing aura.
Two additional friends visible as silhouettes in the background.
Fireworks lighting, festive atmosphere, wide cinematic composition.
```

---

## 🔧 Scripts Reference

### **scene-generator.js**

Generate and test single scenes.

**Usage:**
```bash
node scripts/scene-generator.js \
  --project "project-name" \
  --chapter 1 \
  --scene 1 \
  --ref "projects/project-name/character-grid.png" \
  --prompt "Scene description..."
  --size "1280*960"
```

**Options:**
| Flag | Description | Default |
|------|--|------|
| `--project` | Project name (required) | |
| `--chapter` | Chapter number | |
| `--scene` | Scene number | |
| `--ref` | Reference image(s) - can specify multiple times for multi-character scenes (up to 4) | |
| `--prompt` | Scene description | |
| `--size` | Resolution | `1280*960` |

**Output:**
- Image saved to: `outputs/[project]/chapter-XX-scene-XX/timestamp_chapter-XX-scene-XX.png`
- Metadata saved to: `outputs/[project]/chapter-XX-scene-XX/timestamp_chapter-XX-scene-XX.json`

---

### **batch-generate.js**

Generate full chapters automatically.

**Usage:**
```bash
node scripts/batch-generate.js \
  --project "project-name" \
  --scenes-file "projects/project-name/scenes-chapter-1.json"
```

**Features:**
- Automatic retry on failure (2 attempts)
- 2-second delay between scenes
- Real-time progress tracking
- Metadata saved for each scene

**Output Summary:**
```
============================================================
📊 BATCH GENERATION SUMMARY
============================================================
Total Scenes: 8
✅ Completed: 8
❌ Failed: 0
⏱️  Duration: 142.3s
📈 Success Rate: 100.0%
============================================================
```

---

### **scenes-template.json**

Template for defining scenes:

```json
{
  "project": "project-name",
  "scenes": [
    {
      "chapter": 1,
      "scene": 1,
      "prompt": "Scene description...",
      "ref": ["projects/project-name/character-grid.png"],
      "size": "1280*960"
    }
  ],
  "styleGuide": {
    "artStyle": "Description...",
    "colorPalette": "Description...",
    "lighting": "Description...",
    "cameraAngles": "Description..."
  }
}
```

---

## 🎯 Output Naming Convention

All generated files follow this format:

```
YYYY-MM-DD_HH-mm-ss_chapter-XX-scene-XX.png
```

**Example:**
- `2026-04-01_14-30-22_chapter-1-scene-01.png`
- `2026-04-01_14-30-45_chapter-1-scene-02.png`

**Benefits:**
- ✅ Chronological ordering
- ✅ Unique filenames (no conflicts)
- ✅ Easy to identify content
- ✅ Timestamp for tracking

---

## 📊 Resolution Options

| Aspect Ratio | Size | Use Case |
|-----|--|---|
| 16:9 (Landscape) | `1280*720` | Cinematic wide shots, establishing scenes |
| 16:9 (Landscape) | `1280*960` | Standard scenes, comic panels |
| 9:16 (Portrait) | `720*1280` | Close-ups, character intros, mobile |
| 1:1 (Square) | `1280*1280` | Character grids, profile shots |
| 2:3 (Portrait) | `800*1200` | Book illustrations, posters |

---

## ⚠️ Important Notes

### **API Rate Limits**
- Batch generator uses 2-second delay between requests
- Adjust `delayBetweenScenes` in `batch-generate.js` if needed
- Monitor API usage in Alibaba Cloud console

### **Image URLs Expire**
- URLs expire in 24 hours
- Scripts automatically download images
- Files saved to `outputs/[project]/` permanently

### **Cost Management**
- Charged per successful image generation
- Test scenes first before batch generation
- Use `n: 1` for testing
- Batch with confidence after successful tests

### **Character Drift**
- If character starts looking different:
  1. Stop generating new scenes
  2. Go back to original character grid
  3. Regenerate affected scenes from original reference
  4. Use stronger consistency language in prompts

---

## 🛠️ Troubleshooting

### **Problem: Character looks different**

**Solution:**
1. Check reference image is being loaded
2. Strengthen consistency language in prompt
3. Go back to original character grid
4. Regenerate from original reference (not from previous scene)

### **Problem: "InvalidParameter - size must be in H*W format"**

**Solution:**
```javascript
//  Wrong:
size: '1K'

//  Right:
size: '1280*960'
```

### **Problem: API Error 404**

**Solution:**
- Check you're using `/api/v1` (not `/compatible-mode/v1`)
- Verify API key is valid
- Check region matches (Singapore, Virginia, or Beijing)

### **Problem: Images not downloading**

**Solution:**
- Check `outputs/` folder permissions
- Verify network connection
- Check 24-hour URL expiry (regenerate if expired)

### **Problem: Generation quality low**

**Solution:**
- Increase resolution (try 1280*1280)
- Add more detail to scene descriptions
- Use `promptExtend: true`
- Generate test first to verify consistency

---

## 📈 Multi-Project Management

### **Running Multiple Stories**

Each project is completely isolated:

```bash
# Project A
node scripts/batch-generate.js --project "cyberpunk-detective" --scenes-file "projects/cyberpunk-detective/scenes-chapter-1.json"

# Project B (different terminal or after completing A)
node scripts/batch-generate.js --project "fantasy-adventure" --scenes-file "projects/fantasy-adventure/scenes-chapter-1.json"
```

### **Switching Between Projects**

1. Keep all projects in `projects/` folder
2. Reference correct project with `--project` flag
3. Outputs automatically go to `outputs/[project]/`
4. No conflicts between projects

---

## 📖 Example Workflow

```bash
# 1. Create character grid (using edit-to-anime.js or similar)
node edit-to-anime.js "reference.jpg"
# Save output to: projects/my-story/protagonist-grid.png

# 2. Define scenes
cp scripts/examples/scenes-template.json projects/my-story/scenes-chapter-1.json
# Edit scenes-chapter-1.json with your scene descriptions

# 3. Test first scene
node scripts/scene-generator.js \
  --project "my-story" \
  --chapter 1 --scene 1 \
  --ref "projects/my-story/protagonist-grid.png" \
  --prompt "Detective John standing under neon sign in rainy cyberpunk street"

# 4. If test successful, batch generate full chapter
node scripts/batch-generate.js \
  --project "my-story" \
  --scenes-file "projects/my-story/scenes-chapter-1.json"

# 5. Check results
ls outputs/my-story/
```

---

## 🎯 Success Metrics

**Good Consistency:**
- ✅ Character recognizable across all scenes
- ✅ Facial features match reference grid
- ✅ Clothing details consistent
- ✅ Style uniform throughout chapter

**Quality Indicators:**
- ✅ Successful generation rate > 90%
- ✅ Minimal need for regeneration
- ✅ Scenes match storyboard expectations
- ✅ Emotional expressions convey story moments

**Script Quality:**
- ✅ Clear scene descriptions
- ✅ Consistent character voices
- ✅ Complete dialogue and action
- ✅ Proper camera directions
- ✅ Logical scene progression

---

## 📚 Additional Resources

- **Full Documentation:** `STORY-WORKFLOW-GUIDE.md`
- **Script Writing Guide:** `SCRIPT-WORKFLOW-GUIDE.md`

---

**Happy creating! Build amazing visual stories with consistent characters, complete scripts, and photo realistic images. 🎬✨**
