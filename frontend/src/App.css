/* ========================================
   云上田园 - 东方田园诗意风格
   ======================================== */

@import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap');

/* === CSS Variables === */
:root {
  /* 大地色系 */
  --earth-brown: #8B7355;
  --earth-dark: #5D4E37;
  --earth-light: #A69278;

  /* 植物色系 */
  --leaf-green: #5A7247;
  --grass-green: #6B8E23;
  --moss-green: #7A8B6E;

  /* 天空色系 */
  --sky-blue: #87CEEB;
  --dawn-orange: #E8A87C;
  --sunset-gold: #DAA520;

  /* 背景色 */
  --rice-white: #FAF8F5;
  --paper-cream: #F5F1E8;
  --ink-gray: #4A4A4A;

  /* 功能色 */
  --primary: #5A7247;
  --primary-light: #7A9267;
  --danger: #C75050;
  --warning: #DAA520;

  /* 文字 */
  --text-primary: #2D2D2D;
  --text-secondary: #5A5A5A;
  --text-muted: #8A8A8A;

  /* 边框与阴影 */
  --border-light: rgba(139, 115, 85, 0.15);
  --shadow-soft: 0 4px 20px rgba(93, 78, 55, 0.08);
  --shadow-medium: 0 8px 32px rgba(93, 78, 55, 0.12);

  /* 字体 */
  --font-display: 'ZCOOL XiaoWei', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
}

/* === Global Styles === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background: var(--rice-white);
  color: var(--text-primary);
  line-height: 1.7;
  overflow-x: hidden;
}

/* Paper Texture Overlay */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  z-index: 9999;
}

/* === Typography === */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* === App Layout === */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* === Header === */
.app-header {
  background: linear-gradient(180deg,
    rgba(250, 248, 245, 0.98) 0%,
    rgba(250, 248, 245, 0.95) 100%
  );
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--earth-dark);
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--leaf-green) 0%, var(--grass-green) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(90, 114, 71, 0.25);
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.logo-text {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--earth-dark) 0%, var(--earth-brown) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 10px 24px;
  border-radius: 24px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: calc(100% - 48px);
}

.nav-link.active {
  color: var(--primary);
  background: rgba(90, 114, 71, 0.08);
}

.nav-link.active::after {
  width: calc(100% - 48px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.weather-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--paper-cream);
  border-radius: 24px;
  border: 1px solid var(--border-light);
  font-size: 14px;
}

.weather-badge.warning {
  background: rgba(218, 165, 32, 0.1);
  border-color: rgba(218, 165, 32, 0.3);
}

.weather-icon {
  font-size: 20px;
}

.weather-temp {
  font-weight: 600;
  color: var(--earth-dark);
}

/* === Main Content === */
.app-main {
  flex: 1;
  margin-top: 72px;
}

/* === Hero Section === */
.hero-section {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: linear-gradient(180deg,
    var(--rice-white) 0%,
    var(--paper-cream) 100%
  );
  position: relative;
  overflow: hidden;
}

/* Decorative Background Elements */
.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(90, 114, 71, 0.05) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 115, 85, 0.05) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-title {
  font-size: clamp(48px, 8vw, 88px);
  color: var(--earth-dark);
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-title::after {
  content: '';
  display: block;
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  margin: 24px auto 0;
}

.hero-subtitle {
  font-size: clamp(16px, 2.5vw, 22px);
  color: var(--text-secondary);
  text-align: center;
  max-width: 600px;
  margin-bottom: 48px;
  line-height: 1.8;
  position: relative;
  z-index: 1;
}

/* === Page Container === */
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 32px;
}

/* === Cards === */
.card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-light);
  padding: 28px;
  box-shadow: var(--shadow-soft);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--grass-green));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover::before {
  opacity: 1;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--earth-dark);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title svg {
  width: 20px;
  height: 20px;
  color: var(--primary);
}

/* === Grid System === */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .grid-3, .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}

/* === Buttons === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--leaf-green) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(90, 114, 71, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(90, 114, 71, 0.4);
}

.btn-secondary {
  background: var(--paper-cream);
  color: var(--earth-dark);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: white;
  border-color: var(--primary);
  color: var(--primary);
}

.btn-lg {
  padding: 18px 40px;
  font-size: 17px;
  border-radius: 16px;
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 45, 45, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 36px;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-medium);
  animation: slideUp 0.4s ease;
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--grass-green), var(--sunset-gold));
}

.modal-title {
  font-size: 24px;
  color: var(--earth-dark);
  text-align: center;
}

/* === Badge === */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
}

.badge-success {
  background: rgba(90, 114, 71, 0.1);
  color: var(--primary);
}

.badge-warning {
  background: rgba(218, 165, 32, 0.1);
  color: var(--warning);
}

.badge-info {
  background: rgba(135, 206, 235, 0.15);
  color: #5A8BA8;
}

/* === Progress Bar === */
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--paper-cream);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-fill.green { background: linear-gradient(90deg, var(--primary), var(--grass-green)); }
.progress-fill.yellow { background: linear-gradient(90deg, var(--dawn-orange), var(--sunset-gold)); }
.progress-fill.red { background: var(--danger); }

/* === Animations === */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.6s ease both;
}

.slide-up {
  animation: slideUp 0.5s ease both;
}

/* === Scrollbar === */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--paper-cream);
}

::-webkit-scrollbar-thumb {
  background: var(--earth-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--earth-brown);
}

/* === Utility Classes === */
.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }
.text-primary { color: var(--primary); }
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }

/* === Responsive === */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    height: 64px;
  }

  .logo-text {
    display: none;
  }

  .nav-link {
    padding: 8px 16px;
    font-size: 14px;
  }

  .hero-section {
    padding: 60px 16px;
    min-height: 50vh;
  }

  .page-container {
    padding: 24px 16px;
  }

  .card {
    padding: 20px;
  }
}

/* Fertilizer Calculator - Range Slider */
.fertilizer-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, var(--primary) var(--fill-percent, 50%), #E8E4D9 var(--fill-percent, 50%));
  outline: none;
  cursor: pointer;
}

.fertilizer-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.15s;
}

.fertilizer-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.fertilizer-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  cursor: pointer;
}
