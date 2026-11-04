# SyncDock (syncdock.tech) — Full Application & Server Suite v0.9.4-RC3

Tactile Cross-Device Workspace & Spatial Dock bridging desktop workstations (macOS, Linux, Windows/WSL2) and handheld OLED companions (iOS 18, Android 15) in under 1 millisecond.

## Included Files in This Archive
- `index.html`: The full interactive multi-page SyncDock web application (3D Spatial Stage, Scroll CAD Disassembly, Hot-Swappable Cartridges, 60fps Protocol Oscilloscope, Optical Loupe, Ultrasonic GFSK Chirp + 21x21 QR Generator, Pricing & ROI Calculator, OS Downloads, CLI & TOML Docs, Beta Lab Bug Bounty, Visual `.syncdock.toml` Studio, WAF Security Center, and Auth/SMTP Portal).
- `companion.html`: Standalone iPhone 16 Pro (120Hz OLED) receiver window linked via `BroadcastChannel('syncdock_live_bus')`.
- `manifest.json`: Installable Desktop & Mobile PWA manifest.
- `config/.syncdock.toml`: Default repository workspace cartridge configuration.
- `config/nginx-security-headers.conf`: Production NGINX WAF, CSP, and HSTS security headers.
- `server/package.json` & `server/server.js`: Ready-to-run Node.js Express + Nodemailer SMTP relay and WebSocket LAN signaling server.

## Quickstart
1. Extract `syncdock-full-suite-v0.9.4-rc3.zip`.
2. Open `index.html` in any modern browser (works directly on `file://` or via `npx serve .`).
3. Open `companion.html` side-by-side in a second browser window and drag any file onto the 3D Stage in `index.html` to watch live SHA-256 verification and cross-window DMA transfer.
