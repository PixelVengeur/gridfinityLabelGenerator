# Gridfinity Label Generator

Web app to generate STL labels from a base STL with:
- one clipart icon (SVG)
- two lines of text
- embossed geometry at **0.4 mm**

## Implemented behavior

- Uses `GridfinityBinLabel.stl` as the base model.
- Layout area for icon + text is treated as **34.5 x 10.5 mm**.
- Coordinate convention: **x=0, y=0 is lower-left corner** of the usable area.
- Icon size is fixed; text scales down to fit the remaining width.
- Custom single-label mode: downloads one `.stl`.
- Predefined multi-select mode: one selection returns `.stl`, multiple selections return `.zip`.

## Project structure

- `server/` Express API + STL generation logic
- `web/` React UI
- `server/src/data/predefinedLabels.ts` static predefined CNCKitchen-style list

## Run locally

### 1) Start API

```powershell
cd server
npm install
npm run dev
```

API runs on `http://localhost:4000`.

### 2) Start Web UI

In a second terminal:

```powershell
cd web
npm install
npm run dev
```

UI runs on `http://localhost:5173`.

## Build check

```powershell
cd server
npm run build

cd ..\web
npm run build
```

## Notes

- Geometry is exported as a combined STL (base + embossed solids).
- For production, verify generated labels in your slicer before printing.
- Predefined labels are currently static and can be edited in `server/src/data/predefinedLabels.ts`.
