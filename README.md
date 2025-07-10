#  NERF-BASED 3D PRODUCT RENDERING SYSTEM

**An AI-powered web platform for automatically generating high-quality interactive 3D product renders from user-uploaded videos.**

---

## 🚀 Overview

This project is my **Final Year Project** designed to make **professional-quality intercative 3D renders accessible and easy**. Instead of relying on expensive manual 3D modeling, users simply **upload a video**, and the system generates a **realistic interactive 3D render** automatically.

Key goals:

* Remove the need for manual 3D modeling.
* Streamline the creation of e-commerce-ready product visuals.
* Provide an intuitive interface for uploads, project management, and result viewing.

---

## 🎯 Key Features

* ✅ **Resumable Uploads** using the TUS protocol for large video files.
* ✅ **Cloud Storage Integration** with Amazon S3.
* ✅ **Project Management** with thumbnails, descriptions, and metadata.
* ✅ **AI-Powered Rendering** using Neural Radiace Fields Frameworks (RunPod integration).
* ✅ **User Dashboard** to manage projects and view 3D outputs.

---

## 👥 Intended Users

* **E-commerce brands** needing quick, affordable product visuals.
* **Product designers** testing variations and mockups.
* **3D rendering agencies** automating workflows.

---

## ⚙️ Tech Stack

| Layer            | Technologies                                           |
| ---------------- | ------------------------------------------------------ |
| **Frontend**     | RemixJS, TailwindCSS, Playwright (testing)             |
| **Backend**      | NestJS (GraphQL, REST), MySQL                          |
| **Uploads**      | TUS Protocol server, Amazon S3                         |
| **AI Rendering** | Nerf Frameworks via RunPod API                         |

---

## 🛠️ How It Works (High Level)

*1️⃣ User uploads a video via TUS (resumable).
*2️⃣ File is saved to S3 and registered in the backend.
*3️⃣ User creates a **Project** with a thumbnail.
*4️⃣ User attaches a **Scan** (video) to the project.
*5️⃣ Backend triggers AI-based **NeRF** render.
(6️⃣ Rendered 3D output is stored and shown to the user.

---

## 🔒 Code Access Policy

⚠️ **Important:**
This project is **private** and the source code is **not publicly available** in this repository.

However:

*✅ I am **happy to share** code samples or give a live code walk-through.
*✅ If you’re a **recruiter** or **hiring manager** and would like to review the code:

📧 **Please email me at:** \[[saadaxis51@gmail.com](mailto:saadaxis51@gmail.com)]
*I’ll be glad to provide access upon request.*

---


## 📬 Contact

* ✉️ **Email:** \[[saadaxis51@gmail.com](mailto:saadaxis51@gmail.com)]
* 💼 **LinkedIn:** \[[Muhammad-Saad-Aziz](https://www.linkedin.com/in/muhammad-saad-aziz-b2a053295/)]

---

## 📌 Notes for Recruiters

✅ This project showcases **real-world system design** with:

* User-friendly and resilient upload flows (TUS)
* Clean, modular NestJS backend with GraphQL
* Cloud-based rendering pipeline
* Integration with AI services (RunPod)
* Emphasis on maintainability, scalability, and testing

✅ I’m available for:

* Sharing code on request
* Live technical demo sessions
* Detailed discussions about architecture and design decisions

---

> Thank you for your interest! I look forward to discussing this and other projects with you.

