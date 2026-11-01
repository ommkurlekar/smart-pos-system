# Setup & Deployment Steps

## Requirements
- Python 3.9+
- Node.js 18+
- MongoDB instance running locally (e.g. via MongoDB Compass) at `mongodb://localhost:27017`
- `demand_model.h5` placed in the `backend/` root relative path context.

## 1. Backend Deployment 

The backend runs on FastAPI and uses a Virtual Environment.
1. Navigate to the backend root directory (inside `Website 2`).
2. Activate the virtual environment: `source venv/bin/activate` or `.\venv\Scripts\activate` on Windows.
3. Install dependencies manually if missing: `pip install -r requirements.txt`. (The necessary packages have been set up in our venv).
4. Run the Uvicorn server:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
5. Note: The backend loads `demand_model.h5` upon startup into the forecasting service. Make sure it stays accessible.

## 2. Frontend Deployment

The frontend is a Vite + React application.
1. Navigate to `frontend/`.
2. Install NodeJS libraries: `npm install`.
3. To start development server:
   ```bash
   npm run dev
   ```
4. Build for deployment:
   ```bash
   npm run build
   ```
5. Serve the built files using an NGINX proxy or Vercel depending on the production setup.

## 3. Production Guidelines
- **Scalability:** The backend connects to MongoDB via Motor AsyncIO. Replace the connection string `mongodb://localhost:27017` in `SQLALCHEMY_DATABASE_URL` / `os.getenv("MONGO_URL")` with your production cluster URI in environment variables.
- **Model Updating:** Retraining the model should happen out-of-band as requested. After retraining, overwrite `demand_model.h5` and perform a rolling restart of the backend servers.
- **Performance:** Ensure Redis cache is implemented in front of the `/api/dashboard/stats` endpoint as the dataset grows massively to satisfy the `< 1 sec` and `< 500ms` strict time SLAs.
