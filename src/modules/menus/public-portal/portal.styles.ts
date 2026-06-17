export function portalStyles(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080d1a;
  --s1:#0e1628;
  --s2:#141d35;
  --s3:#1a2540;
  --border:rgba(99,172,241,.12);
  --border-strong:rgba(99,172,241,.28);
  --primary:#63ACF1;
  --primary-dim:rgba(99,172,241,.12);
  --text:#E8EEFF;
  --muted:#7A90B8;
  --muted2:#4A5E82;
  --green:#34d399;
  --green-dim:rgba(52,211,153,.12);
  --hdr:62px;
  --nav:72px;
  --r:12px;
}

/* BASE */
html{height:100%;background-color:var(--bg);background-image:radial-gradient(circle,rgba(99,172,241,.055) 1px,transparent 1px);background-size:22px 22px}
body{height:100%;background:transparent;color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overscroll-behavior-y:auto}

/* HEADER */
.hdr{position:fixed;top:0;left:0;right:0;height:var(--hdr);background:rgba(8,13,26,.88);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:11px;padding:0 16px;z-index:200}
.hdr-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#1d4ed8,var(--primary));display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:-.01em;user-select:none;box-shadow:0 0 14px rgba(99,172,241,.35)}
.hdr-info{flex:1;min-width:0}
.hdr-name{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.04em;color:var(--text);line-height:1}
.hdr-desc{font-size:11.5px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hdr-badge{font-size:9.5px;font-weight:700;background:var(--green-dim);color:var(--green);border:1px solid rgba(52,211,153,.2);border-radius:20px;padding:3px 10px;display:flex;align-items:center;gap:5px;flex-shrink:0;letter-spacing:.06em;text-transform:uppercase}
.hdr-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:bpulse 2.5s infinite;flex-shrink:0}
@keyframes bpulse{0%,100%{opacity:1}50%{opacity:.25}}

/* LAYOUT */
.main{position:fixed;top:var(--hdr);bottom:calc(var(--nav) + env(safe-area-inset-bottom));left:0;right:0;overflow:hidden;background:transparent}
.panel{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .28s ease}
.panel.active{opacity:1;pointer-events:auto}
.panel-scroll{flex:1;overflow-y:auto;padding:20px 16px 16px;-webkit-overflow-scrolling:touch}

/* BOTTOM NAV */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;height:calc(var(--nav) + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:rgba(8,13,26,.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid var(--border);display:flex;align-items:flex-start;padding-top:10px;z-index:200}
.bn-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:var(--muted2);cursor:pointer;font-family:inherit;padding:6px 0;-webkit-tap-highlight-color:transparent;transition:color .25s cubic-bezier(.22,1,.36,1);position:relative}
.bn-item svg{width:22px;height:22px;stroke-width:1.75;transition:transform .25s cubic-bezier(.22,1,.36,1)}
.bn-item span{font-size:10.5px;font-weight:600;letter-spacing:.02em;transition:color .25s}
.bn-item.active{color:var(--primary)}
.bn-item.active svg{transform:scale(1.06)}
.bn-item.active::before{content:'';position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:22px;height:2px;background:var(--primary);border-radius:0 0 2px 2px;box-shadow:0 0 10px rgba(99,172,241,.7)}
.bn-item:active{opacity:.45}

/* HOME */
.home-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}

.h-hero{display:flex;flex-direction:column;align-items:center;padding:44px 20px 28px;text-align:center;position:relative;overflow:hidden}
.h-glow{position:absolute;top:0;left:50%;transform:translateX(-50%);width:340px;height:260px;background:radial-gradient(ellipse at center top,rgba(99,172,241,.18) 0%,transparent 68%);pointer-events:none}
.h-avatar{width:80px;height:80px;border-radius:24px;background:linear-gradient(145deg,#1a3faa 0%,var(--primary) 100%);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;color:#fff;letter-spacing:-.03em;margin-bottom:16px;user-select:none;position:relative;z-index:1;box-shadow:0 0 0 1px rgba(99,172,241,.35),0 0 40px rgba(99,172,241,.28),0 12px 40px rgba(0,0,0,.5)}
.h-badge{display:inline-flex;align-items:center;gap:6px;background:var(--green-dim);color:var(--green);font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border-radius:20px;padding:4px 12px;margin-bottom:12px;border:1px solid rgba(52,211,153,.22)}
.h-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:bpulse 2.5s infinite;flex-shrink:0}
.h-name{font-size:26px;font-weight:700;letter-spacing:-.055em;line-height:1.18;color:var(--text);margin-bottom:7px}
.h-desc{font-size:13.5px;color:var(--muted);line-height:1.5;max-width:260px}

.h-welcome{margin:0 16px 6px;background:rgba(99,172,241,.07);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:flex-start;gap:11px}
.h-welcome-icon{font-size:20px;flex-shrink:0;line-height:1.4}
.h-welcome-text{font-size:13.5px;line-height:1.6;color:var(--muted)}

.h-label{font-size:10px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.12em;padding:18px 16px 10px}
.h-list{display:flex;flex-direction:column;gap:8px;padding:0 16px 32px}

.home-tile{background:none;border:none;font-family:inherit}
.h-card{background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:16px 14px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:background .2s,border-color .2s,transform .13s,box-shadow .2s;-webkit-tap-highlight-color:transparent;text-align:left;width:100%}
.h-card:hover{background:var(--s2);border-color:var(--border-strong);box-shadow:0 0 24px rgba(99,172,241,.09)}
.h-card:active{transform:scale(.97);background:var(--s2)}
.h-card-icon{width:44px;height:44px;border-radius:12px;background:var(--primary-dim);border:1px solid rgba(99,172,241,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.h-card-icon svg{width:20px;height:20px;stroke:var(--primary)}
.h-card-body{flex:1;min-width:0}
.h-card-title{font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.02em;line-height:1.2;margin-bottom:2px}
.h-card-desc{font-size:12.5px;color:var(--muted);line-height:1.35}
.h-arrow{width:15px;height:15px;stroke:var(--primary);flex-shrink:0;opacity:.55}

/* PRODUCTOS */
.product-cards{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.product-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;display:flex;align-items:center;gap:12px}
.product-info{flex:1;min-width:0}
.product-name{font-size:14px;font-weight:600;margin-bottom:2px;letter-spacing:-.01em;color:var(--text)}
.product-desc{font-size:12px;color:var(--muted);line-height:1.35;margin-bottom:4px}
.product-price{font-size:13px;font-weight:700;color:var(--primary)}
.qty-ctrl{display:flex;align-items:center;gap:7px;flex-shrink:0}
.qty-btn{width:29px;height:29px;border-radius:6px;background:var(--s2);border:1px solid var(--border);color:var(--text);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;-webkit-tap-highlight-color:transparent;font-family:inherit}
.qty-btn:hover{background:var(--s3)}
.qty-btn:active{transform:scale(.88)}
.qty-btn:disabled{opacity:.22;cursor:default}
.qty-num{font-size:15px;font-weight:700;min-width:18px;text-align:center;color:var(--text)}
.cart-summary{margin-top:10px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:11px 13px;display:none}
.cart-summary.visible{display:block}
.cart-line{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:5px}
.cart-total{display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--text);padding-top:7px;border-top:1px solid var(--border);margin-top:3px}
.cart-hint{font-size:12.5px;color:var(--muted);text-align:center;padding:2px 0}
.cart-confirm-btn{margin-top:12px;width:100%;background:var(--primary);border:none;border-radius:var(--r);padding:14px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.08em;text-transform:uppercase;transition:opacity .15s,transform .12s,box-shadow .2s;-webkit-tap-highlight-color:transparent}
.cart-confirm-btn:hover{opacity:.88;box-shadow:0 0 24px rgba(99,172,241,.3)}
.cart-confirm-btn:active{transform:scale(.98)}
.cart-confirm-btn:disabled{opacity:.28;cursor:default}

/* OTRAS TABS */
.sec-label{font-size:10px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;padding:18px 0 10px}
.mod-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:15px 14px;display:flex;align-items:center;gap:13px;text-decoration:none;color:inherit;margin-bottom:6px;transition:background .2s,border-color .2s;-webkit-tap-highlight-color:transparent;cursor:pointer}
.mod-card:hover{background:var(--s2);border-color:var(--border-strong)}
.mod-card:active{transform:scale(.98)}
.mod-icon{width:44px;height:44px;border-radius:10px;background:var(--primary-dim);border:1px solid rgba(99,172,241,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mod-icon svg{width:20px;height:20px;stroke:var(--primary)}
.mod-texts{flex:1;min-width:0}
.mod-title{font-size:14.5px;font-weight:600;margin-bottom:3px;letter-spacing:-.02em;color:var(--text)}
.mod-desc{font-size:13px;color:var(--muted);line-height:1.4}
.mod-arrow svg{width:14px;height:14px;stroke:var(--muted2)}
.steps-list{display:flex;flex-direction:column;gap:6px;margin-top:4px}
.step-item{display:flex;align-items:center;gap:12px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px}
.step-num{width:24px;height:24px;border-radius:6px;background:var(--primary-dim);border:1px solid rgba(99,172,241,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:var(--primary)}
.step-text{font-size:13.5px;line-height:1.4;color:var(--text)}

/* NOSOTROS */
.biz-hero{display:flex;flex-direction:column;align-items:center;padding:28px 0 22px;text-align:center}
.biz-av{width:72px;height:72px;border-radius:22px;background:linear-gradient(145deg,#1a3faa,var(--primary));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fff;margin-bottom:14px;letter-spacing:-.03em;box-shadow:0 0 28px rgba(99,172,241,.28)}
.biz-name{font-size:20px;font-weight:700;letter-spacing:-.04em;margin-bottom:4px;color:var(--text)}
.biz-tag{font-size:13px;color:var(--muted)}
.info-group{background:transparent;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column;gap:1px}
.info-row{display:flex;align-items:center;gap:13px;padding:14px 15px;text-decoration:none;color:inherit;cursor:default;transition:background .18s;background:var(--s1)}
a.info-row,button.info-row{cursor:pointer;background:none;border:none;width:100%;text-align:left;font-family:inherit;color:var(--text)}
a.info-row:hover,button.info-row:hover{background:var(--s2)}
a.info-row:active,button.info-row:active{background:var(--s3)}
.info-icon{width:34px;height:34px;border-radius:8px;background:var(--primary-dim);border:1px solid rgba(99,172,241,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.info-icon svg{width:16px;height:16px;stroke:var(--primary);stroke-width:1.75}
.info-label{font-size:10px;color:var(--muted2);margin-bottom:2px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.info-val{font-size:14px;font-weight:500;color:var(--text)}

/* PANEL SLIDE-IN */
.quote-panel{position:fixed;top:0;left:0;right:0;bottom:0;z-index:500;background:var(--bg);transform:translateX(100%);transition:transform .38s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;will-change:transform;padding-top:env(safe-area-inset-top)}
.quote-panel.open{transform:translateX(0)}
.qp-header{height:var(--hdr);display:flex;align-items:center;padding:0 8px 0 4px;background:rgba(8,13,26,.94);border-bottom:1px solid var(--border);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);flex-shrink:0}
.qp-back{background:none;border:none;color:var(--text);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:3px;padding:10px;-webkit-tap-highlight-color:transparent;flex-shrink:0;transition:opacity .15s}
.qp-back svg{width:17px;height:17px;flex-shrink:0;stroke:var(--text);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.qp-back:hover{opacity:.55}
.qp-back:active{opacity:.35}
.qp-title{flex:1;text-align:center;font-size:15px;font-weight:700;letter-spacing:-.03em;margin-right:8px;color:var(--text)}
.qp-spacer{width:72px;flex-shrink:0}
.qp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 20px}
.qp-footer{padding:10px 16px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:rgba(8,13,26,.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);flex-shrink:0}
.qp-section-title{font-size:10px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;padding:18px 0 10px}
.qp-input{display:block;width:100%;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;color:var(--text);font-size:15px;font-family:inherit;outline:none;-webkit-appearance:none;transition:border-color .2s,box-shadow .2s;margin-bottom:10px}
.qp-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(99,172,241,.12)}
.qp-input:disabled{opacity:.4}
.qp-input::placeholder{color:var(--muted2)}
.qp-error{font-size:12.5px;color:#f87171;display:none;padding:0 2px 8px}
.qp-btn{display:block;width:100%;background:var(--primary);border:none;border-radius:var(--r);padding:15px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.08em;text-transform:uppercase;transition:opacity .15s,transform .12s,box-shadow .2s;-webkit-tap-highlight-color:transparent}
.qp-btn:hover{opacity:.88;box-shadow:0 0 24px rgba(99,172,241,.32)}
.qp-btn:active{transform:scale(.98)}
.qp-btn:disabled{opacity:.28;cursor:default}
.qp-cart-bar{display:flex;align-items:center;justify-content:space-between;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:11px 14px;margin-bottom:10px}
.qp-cart-info{font-size:13px;color:var(--muted)}
.qp-cart-total{font-size:14px;font-weight:700;color:var(--primary)}
.qp-summary{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;margin-bottom:4px}

/* BOOKING */
.bp-dates{display:flex;flex-direction:column;gap:6px}
.bp-date-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;display:flex;align-items:center;gap:13px;cursor:pointer;transition:background .2s,border-color .2s;-webkit-tap-highlight-color:transparent}
.bp-date-card:hover{background:var(--s2);border-color:var(--border-strong)}
.bp-date-card:active{transform:scale(.97)}
.bp-date-icon{width:44px;height:44px;border-radius:10px;background:linear-gradient(145deg,#1a3faa,var(--primary));display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;gap:1px;box-shadow:0 0 16px rgba(99,172,241,.22)}
.bp-provider-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;font-weight:700;letter-spacing:-.02em}
.bp-date-day{font-size:9px;font-weight:700;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.06em}
.bp-date-num{font-size:19px;font-weight:700;color:#fff;line-height:1}
.bp-date-info{flex:1;min-width:0}
.bp-date-label{font-size:14px;font-weight:600;margin-bottom:2px;letter-spacing:-.01em;color:var(--text)}
.bp-date-slots{font-size:12px;color:var(--muted)}
.bp-date-arrow{width:14px;height:14px;stroke:var(--muted2);flex-shrink:0;stroke-width:2;opacity:.5}
.bp-times{display:flex;flex-wrap:wrap;gap:6px}
.bp-time-chip{background:var(--s1);border:1px solid var(--border);border-radius:8px;padding:10px 16px;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);-webkit-tap-highlight-color:transparent;font-family:inherit;letter-spacing:-.01em}
.bp-time-chip:hover{background:var(--primary);color:#fff;border-color:var(--primary);box-shadow:0 0 18px rgba(99,172,241,.32)}
.bp-time-chip:active{transform:scale(.93)}
.qp-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 0;gap:14px;color:var(--muted);font-size:14px}
.qp-loading-spinner{width:28px;height:28px;border:2px solid var(--s3);border-top-color:var(--primary);border-radius:50%;animation:qpspin .7s linear infinite}
@keyframes qpspin{to{transform:rotate(360deg)}}
.qp-empty{display:flex;flex-direction:column;align-items:center;padding:48px 8px 16px;gap:6px;text-align:center}
.qp-empty-icon{font-size:38px;margin-bottom:6px;opacity:.6}
.qp-empty-msg{font-size:14px;color:var(--muted);line-height:1.55;margin-bottom:12px}
.qp-empty-actions{display:flex;flex-direction:column;gap:8px;width:100%}
.qp-empty-btn{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;font-size:14px;font-weight:500;color:var(--text);cursor:pointer;font-family:inherit;transition:background .2s,border-color .2s;-webkit-tap-highlight-color:transparent}
.qp-empty-btn:hover{background:var(--s2);border-color:var(--border-strong)}
.qp-empty-btn:active{background:var(--s3)}

::-webkit-scrollbar{width:0;height:0}
`;
}
