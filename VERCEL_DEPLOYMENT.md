# Deploy Frontend to Vercel

## Quick Deploy (Easiest Method)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New Project"**
3. **Import your GitHub repository** (`hammad-haque/cme-analysis-platform`)
4. **Configure the project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   REACT_APP_API_URL=https://g4dzem9rtk.execute-api.us-east-1.amazonaws.com/prod
   REACT_APP_USER_POOL_ID=your-cognito-pool-id
   REACT_APP_USER_POOL_CLIENT_ID=your-cognito-client-id
   REACT_APP_REGION=us-east-1
   ```

6. **Click "Deploy"**
   - Vercel will automatically build and deploy
   - You'll get a URL like: `https://cme-analysis-platform.vercel.app`

---

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel

# Deploy to production
vercel --prod
```

**When prompted:**
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **cme-analysis-platform** (or your choice)
- Directory? **./frontend** (or just `.` if already in frontend)
- Override settings? **No**

**Set environment variables:**
```bash
vercel env add REACT_APP_API_URL
# Enter: https://g4dzem9rtk.execute-api.us-east-1.amazonaws.com/prod

vercel env add REACT_APP_USER_POOL_ID
# Enter your Cognito User Pool ID

vercel env add REACT_APP_USER_POOL_CLIENT_ID
# Enter your Cognito Client ID

vercel env add REACT_APP_REGION
# Enter: us-east-1
```

---

## Deploy to Render (Alternative)

### Option 1: Static Site on Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Static Site"**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Name:** `cme-analysis-platform`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

5. **Add Environment Variables:**
   ```
   REACT_APP_API_URL=https://g4dzem9rtk.execute-api.us-east-1.amazonaws.com/prod
   REACT_APP_USER_POOL_ID=your-cognito-pool-id
   REACT_APP_USER_POOL_CLIENT_ID=your-cognito-client-id
   REACT_APP_REGION=us-east-1
   ```

6. **Click "Create Static Site"**

---

## Important Notes

### API URL
Make sure your API Gateway URL is correct. Check your AWS CDK deployment output or:
```bash
aws cloudformation describe-stacks \
  --stack-name CMEAnalysisPlatformStack \
  --query 'Stacks[0].Outputs[?OutputKey==`APIURL`].OutputValue' \
  --output text
```

### CORS Configuration
Your API Gateway needs to allow requests from your Vercel domain. Update your Lambda CORS headers to include:
```
Access-Control-Allow-Origin: https://your-app.vercel.app
```

Or for development:
```
Access-Control-Allow-Origin: *
```

### Custom Domain (Optional)
1. In Vercel dashboard, go to your project → Settings → Domains
2. Add your custom domain (e.g., `cme.yourlawfirm.com`)
3. Follow DNS configuration instructions

---

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18+ by default)

### API Calls Fail
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on API Gateway
- Check browser console for errors

### Environment Variables Not Working
- Make sure variables start with `REACT_APP_` prefix
- Redeploy after adding new environment variables
- Check Vercel dashboard → Settings → Environment Variables

---

## After Deployment

Your app will be live at:
- **Vercel:** `https://cme-analysis-platform.vercel.app` (or your custom domain)
- **Render:** `https://cme-analysis-platform.onrender.com` (or your custom domain)

Every push to `main` branch will automatically trigger a new deployment! 🚀

