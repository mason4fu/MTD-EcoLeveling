# MTD EcoLeveling

# 4/28/2025
# OTP Setup Instructions

This project requires a local `otp/` folder containing OpenTripPlanner files.

## Download OTP bundle

🔗 [Download otp.zip](https://drive.google.com/file/d/1QnR83oJMbAyCItMtS11ObnHWzUokNCKO/view?usp=sharing)

> **Note:** You must be logged into your University of Illinois Google account (`@illinois.edu`) to access the file.  
> If you get a "No Access" error, check your login or request permission.

## Setup Steps

1. Download and unzip the file into the **parent directory** of the project.

2. After unzipping, you should see:

```
/otp/
  ├── graph.obj
  ├── mtd urbana champaign.osm.pbf
  ├── mtd.gtfs.zip
  └── otp-2.6.0-shaded.jar
```

3. Make sure `otp/` is **at the same level** as the project folder (e.g., `sp25-cs411-team099-BigBallers/`).

4. Run the project startup script:

```bash
./start.sh
```

This will start the Flask backend, React frontend, and OTP server.

---

## Example Project Structure After Setup

```
parent-folder/
  ├── otp/
  └── sp25-cs411-team099-BigBallers/
```

# Jay 4/2/2025

# to access just the backend run the app.py backend which outputs at localhost:5000/api/data

# to access the actual app run the app.py with output localhost:5173

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
