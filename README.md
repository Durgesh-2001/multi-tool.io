# multi-tool.io

> One platform. Smarter Tools. Simpler Life.

Welcome to **multi-tool.io** — your digital Swiss Army knife! This project is a blend of nostalgia and next-gen tech, designed for creators, students, and anyone who loves making digital life easier. Why juggle a dozen apps when you can have all the magic in one place?

---

## ✨ What is multi-tool.io?

multi-tool.io is a full-stack web platform that brings together a suite of powerful, user-friendly tools:

- **Audio Converter**: YouTube/video to MP3, WAV, FLAC. Make your own mixtapes (without the cassette hassle).
- **File Converter**: PDF ↔ DOC/DOCX. No more "can't open this file" drama.
- **Smile-Cam**: Real-time camera with smile detection. Because life's better when you're smiling.
- **Image Resizer**: Resize, crop, and convert images. Perfect pixels, every time.
- **AI Image Generator**: Turn words into art with free AI (Stable Diffusion via Hugging Face). No drawing skills required!
- **Password Reset**: Secure, modern reset via email or SMS (with Twilio/Ethereal for dev).
- **Payments**: Razorpay integration for premium features (because servers aren't free!).

And more tools are coming soon: AI video editing, voice cloning, code generation, and data analysis. Stay tuned!

---

## 🚀 Features at a Glance

- 🎵 **Audio Converter**: Extract audio from videos, YouTube, and more.
- 📄 **File Converter**: Seamlessly convert between PDF and DOC/DOCX.
- 📸 **Smile-Cam**: Capture smiles with real-time facial detection.
- 🖼️ **Image Resizer**: Resize, crop, and optimize images for any use.
- 🎨 **AI Image Generator**: Create images from text prompts, powered by free AI.
- 🔒 **Password Reset**: Secure, multi-channel reset (email/SMS).
- 💸 **Payments**: Integrated with Razorpay for easy upgrades.
- 🛠️ **Extensible**: Modular codebase for adding new tools.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, modern CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI/ML**: Hugging Face (Stable Diffusion), OpenAI (for future features)
- **Auth**: JWT, Google OAuth
- **Email/SMS**: Nodemailer, Twilio, Ethereal (dev)
- **Payments**: Razorpay

---

## 🧑‍💻 Local Setup (Quickstart)

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local or cloud)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/multi-tool.io.git
cd multi-tool.io
```

### 2. Backend Setup
```bash
cd backend
npm install
cp ENV_SETUP.md .env # (Edit .env with your secrets)
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:5173](http://localhost:5173)

---

## 🔐 Environment Variables
See [`backend/ENV_SETUP.md`](./backend/ENV_SETUP.md) for all required secrets and setup tips. Never commit your `.env` files!

---

## 🤖 AI Image Generation (Free!)
- Uses Hugging Face's free API (no token needed, but optional for higher limits)
- Multiple Stable Diffusion models supported
- See ENV_SETUP.md for details

---

## 🔄 Password Reset
- Email (Ethereal for dev, Gmail for prod)
- SMS (Twilio for prod, console for dev)
- Secure tokens, expiry, and validation
- See [`backend/README_PASSWORD_RESET.md`](./backend/README_PASSWORD_RESET.md)

---

## 🧙‍♂️ Coming Soon
- AI Video Editor
- Voice Cloner
- Code Generator
- Data Analyzer

---

## 🤝 Contributing
Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change. (Or just send memes, we like those too.)

---

## 📜 License
This project is licensed under the MIT License.

---

## 🙏 Credits
- Built with love by humans and a little help from AI.
- Thanks to all open-source libraries and APIs used.

---

> "The best way to predict the future is to invent it." – Alan Kay 
