# WebXR Control Interface – WebXR + Three.js

This project is a WebXR-based VR interface using [Three.js](https://threejs.org/) that features:
- A 3D UI panel with interactive buttons
- A live in-VR logger panel for displaying messages
- Support for loading and interacting with a `.glb` 3D model button
- Controller raycasting and click detection

---

## 🚀 Features

- 🔲 **Interactive Buttons:** Toggle grip and command actions in VR.
- 📦 **GLB Model Button:** Load a custom 3D button (e.g. SOS).
- 📝 **Logger Panel:** Displays recent log messages in a 3D panel.
- 🎮 **WebXR Support:** Works with Meta Quest and other WebXR-enabled headsets.
- 🎯 **Raycast-based Controller Interaction:** Use XR controllers to trigger actions.

---

## 🧰 Tech Stack

- [Three.js](https://threejs.org/)
- WebXR Device API
- Webpack (for local development)
- GLTFLoader + FontLoader
- `helvetiker_regular.typeface.json` (Three.js font for 3D text)

---

## 🛠️ Setup Instructions

1. **Clone this repo** (or copy the files):

```bash
git clone <your-repo-url>
cd <your-project-folder>

```
2.  Install dependencies
```bash 
npm Install
```
3. Run the dev server
```bash
npm run dev
```

Then open the https://localhost:8081/ URL in a WebXR-supported browser (like Chrome on Meta Quest with developer mode).

**Note**: Use adp to run in headset.
```bash
adb reverse tcp:8081 tcp:8081
```
-----------
🧪 Controls
-----------

| Action             | How                                  |
|--------------------|---------------------------------------|
| Toggle Grip        | Point and press trigger on controller |
| Send Command       | Same as above                         |
| Trigger GLB Button | Point and click on the loaded model   |
| View Logs          | Look down toward the black log panel  |

---


✅ Tested On
-----------

- Meta Quest 2 (WebXR via Oculus Browser / Chrome)
- Chrome with WebXR Emulator (desktop)

---

📁 File Structure
-----------------
```bash
<your-project-folder>:
│   .babelrc
│   .gitattributes
│   index.html
│   package-lock.json
│   package.json
│   webpack.config.cjs
│
├───dist
│   └───models
│           b4.glb
│           botton4.fbx
│
├───node_modules # has subdirectories
└───src
        index.mjs
```
---
