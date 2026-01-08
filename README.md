# 🚀 Algoryth

A modern, beautiful coding practice platform for competitive programming and algorithm challenges. Practice coding problems, prepare for contests, and improve your problem-solving skills with an intuitive interface.

**Live Demo:** [algoryth.vercel.app](https://algoryth.vercel.app)

![Algoryth](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

### 🎨 Beautiful UI/UX
- **Dark & Light Theme**: Seamlessly switch between dark and light modes with a beautiful, consistent design
- **Modern Design**: Clean, minimalist interface with warm cream tones in light mode and sleek black/grey in dark mode
- **Responsive Layout**: Fully responsive design that works perfectly on all devices

### 💻 Code Editor
- **Monaco Editor Integration**: Full-featured code editor powered by Monaco (VS Code editor)
- **Syntax Highlighting**: Support for multiple programming languages (JavaScript, TypeScript, C++, Python - coming soon)
- **Theme Sync**: Editor theme automatically syncs with your app theme preference
- **Split Pane Layout**: Resizable panels for optimal coding experience

### 📚 Problem Management
- **Problem Browser**: Browse through a curated list of coding problems
- **Difficulty Levels**: Problems categorized by difficulty (Easy, Medium, Hard)
- **Tags & Filtering**: Filter problems by tags and difficulty
- **Problem Details**: Comprehensive problem statements with examples, constraints, and test cases

### 🎯 Additional Features
- **Search Functionality**: Quick search for problems
- **User Statistics**: Track your rating and contributions
- **Contest Information**: Stay updated with ongoing contests
- **Recommended Problems**: Get started with curated problem recommendations

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.2.3](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@monaco-editor/react`
- **Fonts**: [Geist](https://vercel.com/font) (Sans & Mono)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dinesh-2047/Algoryth.git
   cd Algoryth
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
Algoryth/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── health/        # Health check endpoint
│   │   │   └── problems/       # Problems API endpoints
│   │   ├── problems/          # Problems pages
│   │   │   ├── [slug]/       # Dynamic problem detail page
│   │   │   └── page.jsx       # Problems list page
│   │   ├── layout.jsx         # Root layout with theme toggle
│   │   ├── page.jsx           # Home page
│   │   └── globals.css        # Global styles & theme config
│   ├── components/            # React components
│   │   ├── CodeEditor.jsx     # Monaco editor wrapper
│   │   ├── ProblemWorkspace.jsx  # Problem detail workspace
│   │   ├── SplitPane.jsx     # Resizable split pane
│   │   └── ThemeToggle.jsx   # Dark/light theme toggle
│   └── lib/                   # Utility functions
│       └── problems.js       # Problem data & helpers
├── public/                    # Static assets
├── package.json
├── next.config.mjs
├── tailwind.config.js
└── README.md
```

## 🎨 Theme System

Algoryth features a sophisticated theme system:

- **Light Mode**: Warm cream/orange tones (`bg-amber-50`, `bg-amber-100`) for a comfortable, eye-friendly experience
- **Dark Mode**: Pure black background (`bg-black`) with dark grey cards (`bg-zinc-900`, `bg-zinc-950`) for a modern, sleek look
- **Theme Persistence**: Your theme preference is saved in localStorage
- **System Preference**: Automatically detects and applies your system theme preference

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Quick Start

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Algoryth.git
   cd Algoryth && npm install
   ```

2. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style
   - Ensure both light/dark themes work
   - Test your changes

4. **Commit & Push**
   ```bash
   git commit -m "feat: add feature description"
   git push origin feature/your-feature-name
   ```

5. **Open Pull Request** on GitHub with a clear description

### Guidelines

- **Commit Format**: Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **Code Style**: Follow React/Next.js best practices, use Tailwind CSS
- **Theme Support**: All components must work in light and dark modes
- **Testing**: Test your changes before submitting

### What to Contribute

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

Check [Issues](https://github.com/dinesh-2047/Algoryth/issues) for ideas or open a new one to discuss your contribution!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [algoryth.vercel.app](https://algoryth.vercel.app)
- **GitHub Repository**: [github.com/dinesh-2047/Algoryth](https://github.com/dinesh-2047/Algoryth)
- **Issues**: [GitHub Issues](https://github.com/dinesh-2047/Algoryth/issues)
- **Pull Requests**: [GitHub Pull Requests](https://github.com/dinesh-2047/Algoryth/pulls)

## 🐛 Known Issues

Check out our [Issues](https://github.com/dinesh-2047/Algoryth/issues) page for known bugs and feature requests.

## 📧 Support

For support, please open an issue on GitHub or check our [Support Guide](SUPPORT.md).

---

Made with ❤️ by the Algoryth team

**Star ⭐ this repo if you find it helpful!**
