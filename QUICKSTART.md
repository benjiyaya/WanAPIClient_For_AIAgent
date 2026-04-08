# 🚀 Quick Start - Webinar Video API Client

## 3-Step Setup

### Step 1: Configure API Key

Create a `.env` file in the `WanAPIClient` directory:

```bash
cd C:\Users\benja\.openclaw\workspace\WanAPIClient
notepad .env
```

Add your API key:
```
ALICLOUD_API_KEY=your-actual-api-key-here
```

### Step 2: Install & Build

```bash
npm install
npm run build
```

### Step 3: Run Pre-Flight Check

```bash
npm run webinar:check
```

If all checks pass, you're ready to go! 🎉

---

## 🎪 Demo Commands

### Single Video Generation (Recommended for Webinar)
```bash
npm run webinar:video
```

### Full Pipeline Demo
```bash
npm run webinar:pipeline
```

### Video Editing Demo
```bash
npm run webinar:video-edit
```

---

## 📋 What You Have

### ✅ Core Clients
- `WanClient` - Image generation
- `WanVideoClient` - Video generation (Image-to-Video)
- `WanVideoEditClient` - Video editing & style modification

### ✅ API Features
1. **Text-to-Image** - Generate images from prompts
2. **Image-to-Video** - Transform images to videos
3. **Video Style Transfer** - Apply artistic styles
4. **Instruction-Based Editing** - Edit with text prompts
5. **Multi-Reference Editing** - Complex transformations

### ✅ Demo Scripts
- `webinar-video-single.ts` - Focused single video demo
- `webinar-video-edit.ts` - All editing capabilities
- `webinar-demo-pipeline.ts` - Complete end-to-end workflow

### ✅ Documentation
- `WEBINAR-PREP.md` - Complete preparation guide
- `IMPLEMENTATION-SUMMARY.md` - Technical overview
- This file - Quick reference

---

## 🔧 Common Commands

```bash
# Test API connectivity
npm run webinar:check

# Generate a single video (test mode by default)
npm run webinar:video

# Run full pipeline demo
npm run webinar:pipeline

# Show help for video generation
npx ts-node scripts/examples/webinar-video-single.ts --help
```

---

## 🎯 Next Steps

1. ✅ Run `npm run webinar:check`
2. ✅ Configure your API key in `.env`
3. ✅ Review `WEBINAR-PREP.md` for presentation script
4. ✅ Run `npm run webinar:pipeline` to test full demo
5. ✅ Download sample assets as backups

---

## 📞 Troubleshooting

### "API key not found"
- Check `.env` file exists in `WanAPIClient` directory
- Verify `ALICLOUD_API_KEY=your-key` (no quotes around key)

### "Failed to connect to API"
- Check internet connection
- Verify API key is valid
- Run `npm run webinar:check` to diagnose

### "TypeScript compilation failed"
- Run `npm run build`
- Check for syntax errors in code

---

## 🎬 Webinar Ready!

Your pipeline is production-ready with:
- ✅ Complete Wan 2.7 video API coverage
- ✅ Production error handling
- ✅ Progress tracking
- ✅ Pre-flight validation
- ✅ Professional documentation

**You're all set for the webinar!** 🎉

For detailed guidance, see `WEBINAR-PREP.md`.
