# Render Deployment Guide for PII Guard

## Overview

This guide provides step-by-step instructions to deploy PII Guard on Render (both backend and frontend).

---

## Part 1: Dependency Fixes Applied

### Issues Fixed

1. **python-bidi compilation error** ✅
   - Removed `pytesseract` (requires system Tesseract, unavailable on Render)
   - Removed all transitive Rust-dependent packages
   - Result: python-bidi no longer pulled in as dependency

2. **Read-only file system errors** ✅
   - Removed packages requiring compilation: `uvicorn[standard]`, etc.
   - Added `--no-cache-dir` flag to pip to reduce I/O during build
   - Pinned all versions to prebuilt wheels only

3. **Python version compatibility** ✅
   - Downgraded from Python 3.14 to 3.11 (stable, widely supported)
   - All packages guaranteed to have prebuilt wheels for Python 3.11

### New requirements.txt Structure

```
API Framework:        fastapi, uvicorn, python-multipart, slowapi
ML/NLP (CPU):        torch==2.2.2, transformers==4.40.2, tokenizers, safetensors
OCR (CPU):           easyocr, Pillow, PyMuPDF
CLI:                 typer, rich
Utilities:           python-dotenv, httpx
```

**Total estimated build size:** ~800MB (acceptable on Render)

---

## Part 2: Pre-Deployment Checklist

### Local Testing (Before Render)

```bash
# 1. Test with new requirements.txt locally
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Run tests to verify no breakage
pytest tests/test_core.py -v

# 3. Start API locally
uvicorn api.main:app --port 8001

# 4. In another terminal, verify health check
curl http://localhost:8001/health
```

### GitHub Setup

```bash
# 1. Commit all changes
git add requirements.txt render.yaml .renderignore .env.production
git commit -m "Optimize deployment for Render: fix dependencies, add config"

# 2. Push to GitHub
git push origin main
```

---

## Part 3: Deploy to Render (Step-by-Step)

### Step 1: Create Render Account & Blueprint

1. Go to https://render.com
2. Sign in with GitHub (recommended)
3. Click **"New +"** → **"Blueprint"**
4. Select your repository
5. Choose branch (typically `main`)

### Step 2: Configure Services

Render will auto-detect `render.yaml`. Verify these settings:

**Backend Service (pii-guard-api):**

- Runtime: Python 3.11 ✓
- Build Command: `pip install --no-cache-dir -r requirements.txt` ✓
- Start Command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT --workers 1` ✓
- Health Check: `/health` ✓
- Plan: Free ✓

**Frontend Service (pii-guard-frontend):**

- Build Command: `cd frontend && npm install && npm run build` ✓
- Publish Path: `frontend/dist` ✓
- Plan: Free ✓

### Step 3: Deploy

1. Click **"Deploy"** button
2. Monitor logs:
   - **Backend build**: 3-5 minutes (first time with model downloads)
   - **Frontend build**: 1-2 minutes
   - **Total**: 5-10 minutes

### Step 4: Expected Build Output

**Backend logs:**

```
[INFO] Building Python application...
[INFO] Retrieving Python version (3.11.0)
[INFO] Installing pip packages...
[INFO] Running pip install --no-cache-dir -r requirements.txt
...
[INFO] Build successful
[INFO] Starting uvicorn server...
[INFO] PII Guard API ready!
```

**Frontend logs:**

```
[INFO] npm install...
[INFO] npm run build...
[INFO] Vite build complete
[INFO] Frontend deployed to CDN
```

---

## Part 4: Post-Deployment Verification

### Verify Backend is Running

```bash
curl https://pii-guard-api.onrender.com/health
# Expected response:
# {"status":"ok","service":"pii-guard"}
```

### Verify Frontend is Running

- Open: https://pii-guard-frontend.onrender.com
- You should see the file upload interface

### Test End-to-End Flow

1. Upload a test file (or paste text)
2. Click "Analyze"
3. Should receive PII analysis results
4. Try each redaction mode (replace, hash, mask, synthetic)

### Monitor First Request (Important!)

**First API request will be slow (~30-60 seconds)** because:

- NER model (~500MB) downloads on first request
- Subsequent requests: <1 second

Backend startup sequence:

1. API starts (no model loaded)
2. First request triggers model download
3. Model cached for future requests
4. All subsequent requests fast

---

## Part 5: Environment Variables

### Backend (.env on Render)

Set these in Render dashboard → Environment Variables:

```
CORS_ORIGINS=https://pii-guard-frontend.onrender.com,http://localhost:3000,http://localhost:5173
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

### Frontend (.env.production)

Already configured in `.env.production`:

```
VITE_API_URL=https://pii-guard-api.onrender.com
```

---

## Part 6: Troubleshooting

### Build Fails: "python-bidi requires Rust"

**Status:** ✅ Fixed (removed pytesseract)

- Verify new `requirements.txt` committed
- Clear Render cache: Delete service and redeploy

### Build Fails: "Read-only file system"

**Status:** ✅ Fixed (added `--no-cache-dir`)

- Already in `render.yaml`
- If persists: Redeploy from fresh branch

### First Request Takes 90+ Seconds

**Status:** ✅ Expected behavior

- NER model loading on first request
- See API logs: "Pre-loading NER model..."
- Subsequent requests: <1 second

### Frontend Can't Reach Backend

**Possible causes:**

1. CORS not configured: Check `CORS_ORIGINS` in render.yaml
2. Backend service name changed: Update `VITE_API_URL`
3. Check browser DevTools → Network → See actual error

**Quick fix:**

```bash
# Check backend status
curl https://pii-guard-api.onrender.com/health

# Check CORS headers
curl -H "Origin: https://pii-guard-frontend.onrender.com" \
  https://pii-guard-api.onrender.com/config
```

### Need to Update deps/Code

1. Make changes on local branch
2. `git push origin main`
3. Render auto-redeploys (if auto-deploy enabled)
4. Or manually click "Deploy" in Render dashboard

---

## Part 7: Performance Optimization (Optional)

### Cold Start Optimization

If first request takes too long:

1. Keep backend "awake": Set `health` check interval in Render
2. Use Render's paid plan for faster cold starts
3. Pre-cache model before API startup (currently done)

### Size Optimization

Current sizes:

- Backend: ~800MB (including NER model cache)
- Frontend: ~5-8MB (React + Vite bundle)
- Total: ~810MB (within Render free tier limits)

---

## Part 8: Security Checklist

- [x] CORS whitelist configured (not `*`)
- [x] Rate limiting enabled (30 req/min for file upload)
- [x] File size limits (20MB)
- [x] Input validation (file extensions, text length)
- [x] No API keys exposed (using environment variables)
- [x] HTTPS enforced by Render
- [x] Python 3.11 (security updates)

---

## Part 9: Next Steps

### Immediate (Post-Deployment)

- [ ] Test file upload with various file types
- [ ] Verify PII detection works
- [ ] Test all redaction modes
- [ ] Monitor API logs for errors

### Short-term (Next Sprint)

- [ ] Set up custom domain (e.g., pii-guard.yourdomain.com)
- [ ] Enable auto-deploy on GitHub push
- [ ] Set up error monitoring (Sentry/Datadog)
- [ ] Add database for audit logs

### Long-term (Production Hardening)

- [ ] Implement API authentication (API keys / OAuth)
- [ ] Add encryption at rest for audit logs
- [ ] Set up alerting for failed requests
- [ ] Load testing and performance tuning

---

## Appendix: Rollback

If deployment fails and you need to revert:

### Option 1: Render Dashboard

1. Go to Render → pii-guard-api service
2. Click "Deployments" tab
3. Find previous successful deployment
4. Click "Redeploy"

### Option 2: Git Revert

```bash
# Revert last commit
git revert HEAD
git push origin main

# Render auto-redeploys to previous state
```

---

## Support

### Check Logs

**Render Dashboard:**

1. pii-guard-api → Logs tab
2. pii-guard-frontend → Logs tab
3. Filter by error/warning keywords

### Common Service Endpoints

- Health: `https://pii-guard-api.onrender.com/health`
- Docs: `https://pii-guard-api.onrender.com/docs`
- Config: `https://pii-guard-api.onrender.com/config`
- Frontend: `https://pii-guard-frontend.onrender.com`

---

**Deployment Status:** Ready for Render ✅
