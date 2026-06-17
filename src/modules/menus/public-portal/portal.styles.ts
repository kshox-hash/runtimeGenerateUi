export function portalStyles(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --accent:#2563eb;
  --accent2:#60a5fa;
  --bg:#eef2f7;
  --white:#ffffff;
  --border:#e2e8f0;
  --text:#0f172a;
  --muted:#64748b;
  --muted2:#94a3b8;
  --green:#16a34a;
  --r:16px;
}
html,body{min-height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}

/* ── PAGE ─────────────────────────────────────────────── */
.page{max-width:480px;margin:0 auto;padding:14px 14px 52px;display:flex;flex-direction:column;gap:12px}

/* ── HERO ─────────────────────────────────────────────── */
.hero{position:relative;background:linear-gradient(150deg,var(--accent) 0%,var(--accent2) 100%);padding:52px 24px 48px;overflow:hidden}
.hero-inner{max-width:480px;margin:0 auto;position:relative;z-index:1;text-align:center;display:flex;flex-direction:column;align-items:center}
.hero-glow{position:absolute;top:-80px;right:-60px;width:260px;height:260px;background:rgba(255,255,255,.1);border-radius:50%;pointer-events:none}
.hero-glow2{position:absolute;bottom:-40px;left:-60px;width:200px;height:200px;background:rgba(255,255,255,.07);border-radius:50%;pointer-events:none}
.hero-avatar{width:80px;height:80px;border-radius:22px;margin-bottom:16px;flex-shrink:0;box-shadow:0 4px 24px rgba(0,0,0,.18)}
.hero-avatar-img{object-fit:cover;border:3px solid rgba(255,255,255,.35)}
.hero-avatar-txt{display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.22);border:3px solid rgba(255,255,255,.4);color:#fff;font-size:28px;font-weight:800;letter-spacing:-.04em;user-select:none}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:5px 13px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px}
.hero-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulse 2.5s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.hero-title{font-size:36px;font-weight:800;color:#fff;letter-spacing:-.045em;line-height:1.1;margin-bottom:12px;max-width:360px}
.hero-sub{font-size:15px;color:rgba(255,255,255,.78);line-height:1.6;max-width:320px;margin:0 auto}

/* ── SECTION WRAPPER ──────────────────────────────────── */
.section-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:22px 20px}
.section-title{font-size:17px;font-weight:800;letter-spacing:-.03em;color:var(--text);margin-bottom:14px}

/* ── MODULE CARDS ─────────────────────────────────────── */
.mod-list{display:flex;flex-direction:column;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.mod-card{width:100%;background:var(--white);border:none;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;font-family:inherit;text-align:left;transition:background .15s;-webkit-tap-highlight-color:transparent}
.mod-card:hover{background:#f8fafc}
.mod-card:active{background:#f1f5f9}
.mod-icon-wrap{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mod-icon-wrap svg{stroke:#fff;stroke-width:2}
.mod-body{flex:1;min-width:0}
.mod-title{font-size:14px;font-weight:700;color:var(--text);letter-spacing:-.02em;margin-bottom:2px}
.mod-desc{font-size:12px;color:var(--muted);line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mod-arrow{flex-shrink:0;opacity:.35}
.mod-arrow svg{stroke:var(--text);display:block}

/* ── CONTACT ──────────────────────────────────────────── */
.contact-list{display:flex;flex-direction:column;gap:1px;background:var(--border);border-radius:12px;overflow:hidden}
.contact-row{display:flex;align-items:center;gap:14px;padding:14px 16px;text-decoration:none;color:var(--text);font-size:13.5px;font-weight:500;background:var(--white);transition:background .15s;-webkit-tap-highlight-color:transparent}
a.contact-row:hover{background:#f8fafc}
.contact-icon-wrap{width:34px;height:34px;border-radius:9px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.contact-icon{width:15px;height:15px;stroke:var(--muted);stroke-width:1.8}

/* ── FOOTER ───────────────────────────────────────────── */
.pg-footer{text-align:center;font-size:11.5px;color:var(--muted2);padding-top:4px}
.pg-footer strong{color:var(--muted);font-weight:600}

/* ── PANEL SLIDE-IN ───────────────────────────────────── */
.quote-panel{position:fixed;top:0;left:0;right:0;bottom:0;z-index:500;background:#fff;transform:translateX(100%);transition:transform .36s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;will-change:transform;padding-top:env(safe-area-inset-top)}
.quote-panel.open{transform:translateX(0)}
.qp-header{height:58px;display:flex;align-items:center;padding:0 8px 0 4px;background:rgba(255,255,255,.96);border-bottom:1px solid var(--border);backdrop-filter:blur(16px);flex-shrink:0}
.qp-back{background:none;border:none;color:var(--text);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:3px;padding:10px;-webkit-tap-highlight-color:transparent;flex-shrink:0;transition:opacity .15s}
.qp-back svg{width:17px;height:17px;flex-shrink:0;stroke:var(--text);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.qp-back:hover{opacity:.5}
.qp-back:active{opacity:.3}
.qp-title{flex:1;text-align:center;font-size:15px;font-weight:700;letter-spacing:-.03em;color:var(--text)}
.qp-spacer{width:72px;flex-shrink:0}
.qp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 20px;background:#fff}
.qp-footer{padding:10px 16px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid var(--border);backdrop-filter:blur(16px);flex-shrink:0}
.qp-section-title{font-size:11px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;padding:18px 0 10px}
.qp-input{display:block;width:100%;background:#f8fafc;border:1px solid var(--border);border-radius:var(--r);padding:13px 16px;color:var(--text);font-size:15px;font-family:inherit;outline:none;-webkit-appearance:none;transition:border-color .2s;margin-bottom:10px}
.qp-input:focus{border-color:var(--accent)}
.qp-input:disabled{opacity:.4}
.qp-input::placeholder{color:var(--muted2)}
.qp-error{font-size:12.5px;color:#dc2626;display:none;padding:0 2px 8px}
.qp-btn{display:block;width:100%;background:var(--accent);border:none;border-radius:var(--r);padding:14px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.04em;transition:opacity .15s,transform .12s;-webkit-tap-highlight-color:transparent}
.qp-btn:hover{opacity:.85}
.qp-btn:active{transform:scale(.98)}
.qp-btn:disabled{opacity:.28;cursor:default}
.qp-cart-bar{display:flex;align-items:center;justify-content:space-between;background:#f8fafc;border:1px solid var(--border);border-radius:var(--r);padding:11px 14px;margin-bottom:10px}
.qp-cart-info{font-size:13px;color:var(--muted)}
.qp-cart-total{font-size:14px;font-weight:700;color:var(--text)}
.qp-summary{background:#f8fafc;border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;margin-bottom:4px}
.product-cards{display:flex;flex-direction:column;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-top:4px}
.product-card{background:#fff;padding:13px 14px;display:flex;align-items:center;gap:12px}
.product-info{flex:1;min-width:0}
.product-name{font-size:14px;font-weight:600;margin-bottom:2px;color:var(--text)}
.product-desc{font-size:12px;color:var(--muted);line-height:1.35;margin-bottom:4px}
.product-price{font-size:13px;font-weight:700;color:var(--accent)}
.qty-ctrl{display:flex;align-items:center;gap:7px;flex-shrink:0}
.qty-btn{width:28px;height:28px;border-radius:6px;background:#f8fafc;border:1px solid var(--border);color:var(--text);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;-webkit-tap-highlight-color:transparent;font-family:inherit}
.qty-btn:hover{background:var(--border)}
.qty-btn:active{transform:scale(.88)}
.qty-btn:disabled{opacity:.22;cursor:default}
.qty-num{font-size:15px;font-weight:700;min-width:18px;text-align:center;color:var(--text)}
.cart-summary{margin-top:10px;background:#f8fafc;border:1px solid var(--border);border-radius:var(--r);padding:11px 13px;display:none}
.cart-summary.visible{display:block}
.cart-line{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:5px}
.cart-total{display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--text);padding-top:7px;border-top:1px solid var(--border);margin-top:3px}
.cart-hint{font-size:12.5px;color:var(--muted);text-align:center;padding:2px 0}
.cart-confirm-btn{margin-top:12px;width:100%;background:var(--accent);border:none;border-radius:var(--r);padding:13px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.04em;transition:opacity .15s,transform .12s;-webkit-tap-highlight-color:transparent}
.cart-confirm-btn:hover{opacity:.85}
.cart-confirm-btn:active{transform:scale(.98)}
.cart-confirm-btn:disabled{opacity:.28;cursor:default}
.bp-dates{display:flex;flex-direction:column;gap:6px}
.bp-date-card{background:#f8fafc;border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;display:flex;align-items:center;gap:13px;cursor:pointer;transition:border-color .2s,background .2s;-webkit-tap-highlight-color:transparent}
.bp-date-card:hover{background:#f1f5f9;border-color:#cbd5e1}
.bp-date-card:active{transform:scale(.97)}
.bp-date-icon{width:44px;height:44px;border-radius:8px;background:var(--accent);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;gap:1px}
.bp-provider-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;font-weight:700}
.bp-date-day{font-size:9px;font-weight:700;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.06em}
.bp-date-num{font-size:19px;font-weight:700;color:#fff;line-height:1}
.bp-date-info{flex:1;min-width:0}
.bp-date-label{font-size:14px;font-weight:600;margin-bottom:2px;color:var(--text)}
.bp-date-slots{font-size:12px;color:var(--muted)}
.bp-date-arrow{width:14px;height:14px;stroke:var(--muted2);flex-shrink:0;stroke-width:2;opacity:.5}
.bp-times{display:flex;flex-wrap:wrap;gap:6px}
.bp-time-chip{background:#f8fafc;border:1px solid var(--border);border-radius:6px;padding:10px 16px;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;transition:all .2s;-webkit-tap-highlight-color:transparent;font-family:inherit}
.bp-time-chip:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.bp-time-chip:active{transform:scale(.93)}
.qp-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 0;gap:14px;color:var(--muted);font-size:14px}
.qp-loading-spinner{width:26px;height:26px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.qp-empty{display:flex;flex-direction:column;align-items:center;padding:48px 8px 16px;gap:6px;text-align:center}
.qp-empty-icon{font-size:36px;margin-bottom:6px;opacity:.5}
.qp-empty-msg{font-size:14px;color:var(--muted);line-height:1.55;margin-bottom:12px}
.qp-empty-actions{display:flex;flex-direction:column;gap:8px;width:100%}
.qp-empty-btn{background:#f8fafc;border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;font-size:14px;font-weight:500;color:var(--text);cursor:pointer;font-family:inherit;transition:background .15s;-webkit-tap-highlight-color:transparent}
.qp-empty-btn:hover{background:#f1f5f9}

::-webkit-scrollbar{width:0;height:0}
`;
}
