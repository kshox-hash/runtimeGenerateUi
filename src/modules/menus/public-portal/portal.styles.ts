export function portalStyles(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f5f5f5;
  --white:#ffffff;
  --border:#e5e5e5;
  --text:#111111;
  --muted:#6b6b6b;
  --muted2:#aaaaaa;
  --accent:#111111;
  --green:#16a34a;
  --green-bg:#f0fdf4;
  --green-border:#bbf7d0;
  --r:10px;
}
html,body{min-height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}

/* PAGE */
.page{max-width:480px;margin:0 auto;padding:20px 16px 48px;display:flex;flex-direction:column;gap:6px}

/* HEADER */
.pg-header{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:16px;display:flex;align-items:center;gap:12px}
.pg-avatar{width:44px;height:44px;border-radius:10px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;letter-spacing:-.02em;flex-shrink:0;user-select:none}
.pg-hdr-body{flex:1;min-width:0}
.pg-name{font-size:16px;font-weight:700;letter-spacing:-.03em;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pg-tagline{font-size:12.5px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pg-badge{display:inline-flex;align-items:center;gap:5px;background:var(--green-bg);color:var(--green);border:1px solid var(--green-border);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;flex-shrink:0;white-space:nowrap}
.pg-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2.5s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* WELCOME */
.pg-welcome{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;font-size:13.5px;line-height:1.6;color:var(--muted)}

/* SECTIONS */
.pg-section{display:flex;flex-direction:column;gap:8px}
.pg-section-label{font-size:11px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;padding:6px 2px 2px}

/* SERVICES */
.svc-list{display:flex;flex-direction:column;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.svc-card{background:var(--white);padding:14px 16px;display:flex;align-items:center;gap:12px}
.svc-info{flex:1;min-width:0}
.svc-name{font-size:14px;font-weight:600;color:var(--text);letter-spacing:-.01em}
.svc-desc{font-size:12.5px;color:var(--muted);margin-top:2px;line-height:1.4}
.svc-price{font-size:14px;font-weight:700;color:var(--text);flex-shrink:0;white-space:nowrap}

/* CTAs */
.pg-ctas{display:flex;flex-direction:column;gap:8px;padding-top:2px}
.pg-btn{width:100%;border:none;border-radius:var(--r);padding:14px 20px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:-.01em;transition:opacity .15s,transform .12s;-webkit-tap-highlight-color:transparent}
.pg-btn:active{transform:scale(.98);opacity:.85}
.pg-btn-primary{background:var(--accent);color:#fff}
.pg-btn-secondary{background:var(--white);color:var(--text);border:1px solid var(--border)}
.pg-btn-secondary:hover{background:var(--bg)}

/* CONTACT */
.contact-list{background:var(--white);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column;gap:1px}
.contact-row{display:flex;align-items:center;gap:12px;padding:13px 16px;text-decoration:none;color:var(--text);font-size:13.5px;font-weight:500;background:var(--white);transition:background .15s;-webkit-tap-highlight-color:transparent}
a.contact-row:hover{background:var(--bg)}
.contact-icon{width:16px;height:16px;flex-shrink:0;stroke:var(--muted);stroke-width:1.75}

/* FOOTER */
.pg-footer{text-align:center;font-size:12px;color:var(--muted2);padding-top:10px}
.pg-footer strong{color:var(--muted);font-weight:600}

/* PANEL SLIDE-IN */
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
.qp-input{display:block;width:100%;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:13px 16px;color:var(--text);font-size:15px;font-family:inherit;outline:none;-webkit-appearance:none;transition:border-color .2s;margin-bottom:10px}
.qp-input:focus{border-color:var(--text)}
.qp-input:disabled{opacity:.4}
.qp-input::placeholder{color:var(--muted2)}
.qp-error{font-size:12.5px;color:#dc2626;display:none;padding:0 2px 8px}
.qp-btn{display:block;width:100%;background:var(--accent);border:none;border-radius:var(--r);padding:14px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.04em;transition:opacity .15s,transform .12s;-webkit-tap-highlight-color:transparent}
.qp-btn:hover{opacity:.85}
.qp-btn:active{transform:scale(.98)}
.qp-btn:disabled{opacity:.28;cursor:default}
.qp-cart-bar{display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:11px 14px;margin-bottom:10px}
.qp-cart-info{font-size:13px;color:var(--muted)}
.qp-cart-total{font-size:14px;font-weight:700;color:var(--text)}
.qp-summary{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;margin-bottom:4px}

/* PRODUCT CARDS (panel cotización) */
.product-cards{display:flex;flex-direction:column;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-top:4px}
.product-card{background:#fff;padding:13px 14px;display:flex;align-items:center;gap:12px}
.product-info{flex:1;min-width:0}
.product-name{font-size:14px;font-weight:600;margin-bottom:2px;color:var(--text)}
.product-desc{font-size:12px;color:var(--muted);line-height:1.35;margin-bottom:4px}
.product-price{font-size:13px;font-weight:700;color:var(--text)}
.qty-ctrl{display:flex;align-items:center;gap:7px;flex-shrink:0}
.qty-btn{width:28px;height:28px;border-radius:6px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;-webkit-tap-highlight-color:transparent;font-family:inherit}
.qty-btn:hover{background:var(--border)}
.qty-btn:active{transform:scale(.88)}
.qty-btn:disabled{opacity:.22;cursor:default}
.qty-num{font-size:15px;font-weight:700;min-width:18px;text-align:center;color:var(--text)}
.cart-summary{margin-top:10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:11px 13px;display:none}
.cart-summary.visible{display:block}
.cart-line{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:5px}
.cart-total{display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--text);padding-top:7px;border-top:1px solid var(--border);margin-top:3px}
.cart-hint{font-size:12.5px;color:var(--muted);text-align:center;padding:2px 0}
.cart-confirm-btn{margin-top:12px;width:100%;background:var(--accent);border:none;border-radius:var(--r);padding:13px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.04em;transition:opacity .15s,transform .12s;-webkit-tap-highlight-color:transparent}
.cart-confirm-btn:hover{opacity:.85}
.cart-confirm-btn:active{transform:scale(.98)}
.cart-confirm-btn:disabled{opacity:.28;cursor:default}

/* BOOKING PANEL */
.bp-dates{display:flex;flex-direction:column;gap:6px}
.bp-date-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;display:flex;align-items:center;gap:13px;cursor:pointer;transition:border-color .2s,background .2s;-webkit-tap-highlight-color:transparent}
.bp-date-card:hover{background:#efefef;border-color:#ccc}
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
.bp-time-chip{background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 16px;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;transition:all .2s;-webkit-tap-highlight-color:transparent;font-family:inherit}
.bp-time-chip:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.bp-time-chip:active{transform:scale(.93)}

/* LOADING / EMPTY */
.qp-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 0;gap:14px;color:var(--muted);font-size:14px}
.qp-loading-spinner{width:26px;height:26px;border:2px solid var(--border);border-top-color:var(--text);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.qp-empty{display:flex;flex-direction:column;align-items:center;padding:48px 8px 16px;gap:6px;text-align:center}
.qp-empty-icon{font-size:36px;margin-bottom:6px;opacity:.5}
.qp-empty-msg{font-size:14px;color:var(--muted);line-height:1.55;margin-bottom:12px}
.qp-empty-actions{display:flex;flex-direction:column;gap:8px;width:100%}
.qp-empty-btn{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;font-size:14px;font-weight:500;color:var(--text);cursor:pointer;font-family:inherit;transition:background .15s;-webkit-tap-highlight-color:transparent}
.qp-empty-btn:hover{background:#ebebeb}

/* MISC */
.sec-label{font-size:11px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;padding:18px 0 10px}
.mod-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:14px;display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit;margin-bottom:6px;transition:background .15s;-webkit-tap-highlight-color:transparent;cursor:pointer}
.mod-card:hover{background:#ebebeb}
.mod-icon{width:40px;height:40px;border-radius:8px;background:var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mod-icon svg{width:18px;height:18px;stroke:var(--muted)}
.mod-texts{flex:1;min-width:0}
.mod-title{font-size:14px;font-weight:600;margin-bottom:2px;color:var(--text)}
.mod-desc{font-size:13px;color:var(--muted);line-height:1.4}
.mod-arrow svg{width:14px;height:14px;stroke:var(--muted2)}
.steps-list{display:flex;flex-direction:column;gap:6px;margin-top:4px}
.step-item{display:flex;align-items:center;gap:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px}
.step-num{width:24px;height:24px;border-radius:6px;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:var(--muted)}
.step-text{font-size:13.5px;line-height:1.4;color:var(--text)}

::-webkit-scrollbar{width:0;height:0}
`;
}
