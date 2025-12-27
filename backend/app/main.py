from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, equipment, requests, teams, categories, users, reports, work_centers

app = FastAPI(title="GearGuard API", description="Maintenance Management System")

# CORS
origins = ["*"] # Allow all for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(equipment.router)
app.include_router(work_centers.router) # Added work_centers router
app.include_router(requests.router)
app.include_router(teams.router)
app.include_router(categories.router)
app.include_router(users.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to GearGuard API"}
