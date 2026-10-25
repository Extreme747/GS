# 💌 Special Interactive Surprise Card for Gauri

Ek bohot pyara aur modern interactive surprise web card jo dost ki girlfriend (Gauri) ke liye banaya gaya hai.

---

## ✨ Features
1. **Interactive 3D Wax-Sealed Envelope**: Tap karke seal break hoti hai aur letter slide hoke bahar aata hai.
2. **Dil Ki Baat (4 Flip Cards)**: Personalized cute compliment & reason cards.
3. **Digital Guldasta (Interactive Bouquet)**: Har tap pe naya phool bloom hota hai with sweet notes.
4. **Mini Game (Catch 5 Flying Hearts)**: Real-time physics ke sath hearts pakad ke secret card unlock hota hai.
5. **Grand Finale Card**:
   - Runaway "Nahi" button jo mouse/tap aane par bhaag jata hai 😜
   - "Haan Bilkul!" click hone par sound chords + confetti blast 🎉
   - VIP Date Coupon selector + 1-Tap WhatsApp Claim button!
6. **Romantic Sound Synthesizer**: Custom Web Audio synth bina kisi external heavy mp3 ke.

---

## 🚀 Local Run Kaise Kare

```bash
# Project folder me jaye
cd C:\Users\Asus\.gemini\antigravity\scratch\for-gauri

# Dev server start kare
npm run dev
```
Browser me `http://localhost:5173` khole.

---

## 🌐 Vercel Pe Deploy Karne Ka Tarika

### Option 1: Direct Terminal Se (Sabse Tez - 2 Minutes)
Project directory me terminal khole aur run kare:
```bash
npx vercel
```
1. Browser me login ka prompt aayega -> Login with GitHub/Email kare.
2. Terminal me sabhi questions pe simple **Enter** press karte jaye (Default settings perfect hain).
3. Production link ke liye run kare:
```bash
npx vercel --prod
```
Aapko live URL mil jayega (e.g., `https://for-gauri.vercel.app`)!

---

### Option 2: GitHub Ke Through (Recommended)
1. GitHub pe ek new repo banaye: `for-gauri`
2. Push kare:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/for-gauri.git
git push -u origin main
```
3. [Vercel Dashboard](https://vercel.com/dashboard) pe jaye -> **Add New...** -> **Project** -> GitHub repo select kare -> **Deploy** pe click kare.
4. Done! 🚀
