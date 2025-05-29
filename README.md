# MTD EcoLeveling Setup Guide

_Last updated: 4/28/2025_

## 1. Prerequisites

- Python environment (for Flask backend)
- Node.js and npm (for React frontend)
- Java 17 or higher (for OTP server)
- Access to University of Illinois Google account (for OTP files)

## 2. Download OTP Bundle

This project requires a local `otp/` folder containing OpenTripPlanner files.

🔗 [Download otp.zip](https://drive.google.com/file/d/1QnR83oJMbAyCItMtS11ObnHWzUokNCKO/view?usp=sharing)

> **Note:** You must be logged into your University of Illinois Google account (`@illinois.edu`) to access the file.  
> If you get a "No Access" error, check your login or request permission.

### After Downloading:

1. Download and unzip `otp.zip` into the **parent directory** of the project folder.
2. After unzipping, your folder structure should look like:

```
parent-folder/
  ├── otp/
  │    ├── graph.obj
  │    ├── mtd urbana champaign.osm.pbf
  │    ├── mtd.gtfs.zip
  │    └── otp-2.6.0-shaded.jar
  └── sp25-cs411-team099-BigBallers/
```

`otp/` must be at the same level as `sp25-cs411-team099-BigBallers/`.

---

## 3. Starting the Application

Navigate to the `sp25-cs411-team099-BigBallers/` folder and run the startup script:

```bash
./start.sh
```

This will:

- Start the Flask backend server on `http://localhost:5001`
- Start the React frontend (Vite dev server) on `http://localhost:5173`
- Start the OTP server from the `otp/` folder

After a few seconds, your default browser will automatically open at [http://localhost:5173](http://localhost:5173).

If you press `CTRL+C`, the script will cleanly stop all three servers.

---

## 4. Accessing Services

| Service      | URL                          |
| :----------- | :--------------------------- |
| Backend API  | `http://localhost:5001/api/` |
| Frontend App | `http://localhost:5173/`     |

- **Backend (Flask):** Handles authentication, travel history, trip generation, and leveling API endpoints.
- **Frontend (React + Vite):** Provides the user interface for trip planning, viewing history, and gamification features.
- **OTP Server (Java):** Provides trip planning based on static Urbana-Champaign GTFS data.

---

## 5. Additional Notes

- This template uses Vite for the frontend dev server with React.
- ESLint and TypeScript options are available if you wish to expand frontend validation (optional for basic usage).

---

## 6. Troubleshooting

- **Ports already in use?**

  - Kill old processes or change ports in `start.sh`.

- **OTP server errors?**

  - Ensure Java is installed (`java -version`).
  - Verify `graph.obj` exists inside `otp/`.

- **Frontend not opening?**
  - Check that `npm install` has been run inside the project to install dependencies.

---

# Quick Commands

```bash
# Start all servers
./start.sh

# Kill all running servers
CTRL+C
```

---

# Authors

- Yu Fu
- Jay Malavia
- Rahul Reddy
- Allen Kaile Yuan

# Project Description - MTD EcoLeveling

## Project summary

This application is a gamified bus trip planner built on static MTD GTFS data. Users can plan trips, track travel history, earn XP based on bus usage, and level up. The app calculates environmental impact (CO₂ saved) and displays user rankings. Key features include trip planning, CRUD operations for travel history, XP/rank auto-updates via triggers, and stored procedures for leaderboard management.

## Team Information

| Info     | Description           |
| -------- | --------------------- |
| TeamID   | Team-099              |
| TeamName | BigBallers            |
| Captain  | Rahul Reddy           |
| Captain  | rahulr11@illinois.edu |
| Member1  | Yu Fu                 |
| Member1  | yuf7@illinois.edu     |
| Member2  | Jay Malavia           |
| Member2  | jmala3@illinois.edu   |
| Member3  | Allen Kaile Yuan      |
| Member3  | allenky2@illinois.edu |

## Project Information

| Info       | Description                                                         |
| ---------- | ------------------------------------------------------------------- |
| Title      | MTD EcoLeveling                                                     |
| System URL | link_to_system                                                      |
| Video Link | [link_to_video](https://mediaspace.illinois.edu/media/t/1_fpwgurkb) |
