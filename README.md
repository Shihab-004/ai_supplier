# 🎯 Selectly

**AI-Powered Supplier Selection And Data Analysis**

A modern, intelligent supplier selection system built with React and AI integration for analyzing and ranking suppliers based on multiple criteria.

![Selectly Demo](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3.2-38bdf8)

## ✨ Features

- 🤖 **AI-Powered Analysis** - Optional Google Gemini integration
- 📊 **Smart Ranking Algorithm** - Multi-criteria supplier scoring
- 📁 **CSV Upload** - Easy data import
- 🔍 **Advanced Filtering** - Location, certification, price-based filtering
- 🌐 **Bilingual Support** - Bengali & English
- 🎨 **Modern UI** - Dark theme with glassmorphism effects
- ⚡ **Real-time Analysis** - Instant results

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Build Tool:** Vite
- **AI Integration:** Google Gemini API (Optional)

## 📦 Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/selectly.git

# Navigate to project directory
cd selectly

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Usage

1. **Upload CSV File** - Upload your supplier data in CSV format
2. **Ask Questions** - Type queries in Bengali or English
   - "টপ 5 সাপ্লায়ার দেখাও"
   - "Show suppliers with OEKO-TEX certification"
   - "Low price high quality suppliers"
3. **Get Results** - Receive instant ranked supplier recommendations

## 📋 CSV Format

Your CSV should include these columns:
- Supplier Name
- Location
- Price per meter (USD)
- Lead Time days
- Quality Rating (1-10)
- Reliability (%)
- Financial Stability (1-10)
- Communication Score (1-10)
- Sustainability Compliance
- Past Performance (1-10)

## 🔑 API Key (Optional)

To enable AI-enhanced insights:
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enter the key in the app interface
3. **Note:** The app works perfectly without an API key using smart algorithms!

## 🎯 Scoring Algorithm

The system evaluates suppliers based on:
- ✅ Price optimization (lower is better)
- ✅ Lead time efficiency (faster is better)
- ✅ Quality rating (higher is better)
- ✅ Reliability percentage
- ✅ Financial stability
- ✅ Communication effectiveness
- ✅ Sustainability compliance
- ✅ Past performance track record

## 📸 Screenshots

![Screenshot 1](screenshots/home.png)
![Screenshot 2](screenshots/results.png)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/YOUR_PROFILE)

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Lucide React for beautiful icons
- Tailwind CSS for styling

---

Made with ❤️ for RMG & Textile Industry
