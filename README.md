# 🚗 Car Insurance Application 🛡️

## Overview

A modern web-based car insurance system built with **Next.js** and **TypeScript**, designed to simplify policy management, claims, and visual damage detection. It integrates cloud infrastructure and form validation to provide a seamless insurance experience for users and organizations.

## Features

- 📄 Easy claims filing and policy tracking  
- 🔍 Visual damage analysis using external API  
- 📦 Secure file uploads via AWS S3  
- 🧾 Detailed incident report generation  
- 🧭 Search and filtering of records  

## Technologies Used

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-000000?style=for-the-badge&logo=typescript&logoColor=3178C6" height="30"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" height="30"/>
  <img src="https://img.shields.io/badge/TailwindCSS-000000?style=for-the-badge&logo=tailwind-css&logoColor=06B6D4" height="30"/>
  <img src="https://img.shields.io/badge/AWS_SDK-000000?style=for-the-badge&logo=amazonaws&logoColor=FF9900" height="30"/>
  <img src="https://img.shields.io/badge/Radix_UI-000000?style=for-the-badge&logoColor=3E63DD" height="30"/>
  <img src="https://img.shields.io/badge/Zod-000000?style=for-the-badge&logoColor=3E63DD" height="30"/>
  <img src="https://img.shields.io/badge/React_Hook_Form-000000?style=for-the-badge&logo=reacthookform&logoColor=EC5990" height="30"/>
  <img src="https://img.shields.io/badge/pnpm-000000?style=for-the-badge&logo=pnpm&logoColor=F69220" height="30"/>
</div>

## 🔧 Setup Instructions

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yatharthbhatia/car-insurance.git
    cd car-insurance
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

3. **Configure environment variables:**

    ```bash
    cp .env.example .env
    ```

    Fill in the `.env` file with your credentials:

    ```env
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=

    AWS_REGION=
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    S3_BUCKET_NAME=
    NEXT_PUBLIC_S3_BUCKET_NAME=

    DAMAGE_DETECTION_API_URL=
    REPORT_GENERATION_API_URL=
    ```

4. **Run the application:**

    ```bash
    pnpm dev
    ```

5. Visit `http://localhost:3000` in your browser 🌐

---

## 🎥 Demo Video

Watch the full walkthrough on how to manage policies, detect car damage, and generate reports:

<p align="center">
  <a href="https://www.youtube.com/watch?v=tAbHMOod0Kg&autoplay=1" title="🚗 AI-Based Car Damage Analysis | AWS Cloud Project">
      <img src="https://github.com/user-attachments/assets/5ca1de38-f633-4e9f-a5af-1af1ceeaf039" alt="🚗 AI-Based Car Damage Analysis | AWS Cloud Project" width="720">
</p>

###### 🔄 *Tip: Use ⚙️ in the video player or press `Shift + >` to increase speed to 1.5×*
---

## 🚀 Future Enhancements

- 💳 **Premium payment integration**
- 🔐 **Role-based dashboards** (Admin/User)
- 📬 **Email and push notifications**
- 📊 **Analytics for insurers**

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: Add new feature"
git push origin feature/your-feature-name
```

Then open a Pull Request. </br>
Please ensure your code follows project conventions and includes relevant tests.
