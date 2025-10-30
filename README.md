# VisionEdge Tool🌍🛰️
![VE logo](logo.gif)
## For AirGuard Mobile App
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Issues](https://img.shields.io/github/issues/aimtyaem/visionedge)
![Forks](https://img.shields.io/github/forks/aimtyaem/visionedge)
![Stars](https://img.shields.io/github/stars/aimtyaem/visionedge)

**An advanced system for near-real-time greenhouse gas (GHG) anomaly detection using a fusion of Edge AI and satellite data.**



---

## 🎯 Core Mission

**Airguard VisionEdge** empowers environmental researchers and on-site analysts to detect, visualize, and interpret GHG anomalies with unprecedented speed and accuracy. By fusing powerful, low-power Edge AI with comprehensive satellite imagery, VisionEdge provides actionable insights directly in the field.

---

## ✨ Key Features

* **On-Device AI:** Runs optimized TinyML models on edge nodes for local, real-time emission pattern detection.
* **Sensor Fusion:** Combines satellite raster tiles with ground sensor data ($CO_2$, $PM_{2.5}$, etc.) for higher confidence alerts.
* **Interactive Dashboard:** An Android-first web dashboard visualizes fused insights through maps, charts, and anomaly markers.
* **Deep Analysis:** Seamlessly syncs with Google Colab notebooks for advanced analytics and deep-dive visualization.
* **AI-Powered Assistant:** An on-device LLM, the **VisionEdge Copilot**, explains observed trends and provides context for data anomalies.

---

## 🏗️ System Architecture

The system is designed with three core, interconnected layers:

1.  **Edge Impulse Node:**
    * Runs highly optimized Machine Learning models (TinyML) for local emission pattern detection.
    * Performs direct inference on satellite raster tiles and live ground sensor data.
    * Operates with low power, enabling deployment in remote locations.

2.  **Web Dashboard (Android-first):**
    * Displays fused insights through interactive maps, charts, and clear anomaly markers.
    * Syncs with Google Colab notebooks for advanced, customizable analytics.
    * Provides a central hub for monitoring all connected edge nodes.

3.  **LLM Assistant (VisionEdge Copilot):**
    * An on-device Large Language Model assistant that interprets and explains observed data trends in natural language.
    * Recommends research insights and provides crucial context for data anomalies (e.g., "This spike correlates with regional agricultural burn patterns observed last year.").

---

## 📱 Application Flow & UI

### **1. Login & Device Sync Screen**
* Secure sign-in via Google or institutional accounts.
* Sync connected Edge Impulse devices via Bluetooth/WiFi.
* The **"Add New Station"** feature automatically detects and registers a local AI node.

### **2. Home Dashboard**
* **Top Bar:** Quick filters for `Region | Model | Timeframe`.
* **Live Map Panel:** Displays satellite raster data with overlay layers for GHG, $NO_2$, and temperature. Edge inferences are highlighted as colored, pulsating hotspots.
* **Mini Stats Bar:** Shows key metrics like `Emission Index`, `Confidence Level`, and `Anomaly Count`. Tapping expands the view.

### **3. Analysis Panel**
* Organized into clear tabs: `AI Inference` | `Time Series` | `Correlations` | `Ground Data`.
* Features interactive plots generated directly from edge node outputs.
* An **"Open in Colab"** button instantly launches a pre-populated notebook session for deeper analysis.

### **4. VisionEdge Copilot Assistant**
* A floating chat widget allows users to **"Ask VisionEdge Copilot."**
* Users can query the system with natural language, e.g., *“Explain today’s emission spike in the Cairo region.”*

### **5. Export & Share**
* Download comprehensive reports as **PDF** or **GeoTIFF** files.
* Push results directly to a shared research group or an institutional drive.

---

## 🎨 Design Direction

* **Theme:** A modern space black background with vibrant green-cyan gradients to represent emission heatmaps.
* **UI Style:** Sleek and minimal, following Material 3 design principles with a clean, card-based layout.
* **Data Visualization:** 2D raster overlays with opacity controls and dynamic graphs for comparing local inferences with historical data.

---

## 🚀 Getting Started

Instructions for setting up the project locally will be added here.


View interactive mockup designing or use the repository index.html 

---
### 🤝 Contributing
Contributions, issues, and feature requests are welcome! For significant contributions, please open an issue first to discuss what you would like to change.
### 📜 License
**This project is licensed under the MIT License. See the LICENSE file for details.**
---
