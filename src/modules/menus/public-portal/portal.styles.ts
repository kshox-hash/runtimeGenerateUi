export function portalStyles(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#111113;
  --s1:#1c1c1f;
  --s2:#252528;
  --s3:#2e2e32;
  --border:rgba(255,255,255,.08);
  --border-strong:rgba(255,255,255,.15);
  --primary:#e0e0e0;
  --primary-dim:rgba(224,224,224,.07);
  --text:#eeeeee;
  --muted:#888888;
  --muted2:#606064;
  --green:#22c55e;
  --green-dim:rgba(34,197,94,.12);
  --hdr:62px;
  --nav:58px;
  --r:6px;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overscroll-behavior-y:auto}

/* HEADER */
.hdr{position:fixed;top:0;left:0;right:0;height:var(--hdr);background:rgba(17,17,19,.94);border-bottom:1px solid var(--border);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);display:flex;align-items:center;gap:11px;padding:0 16px;z-index:200}
.hdr-avatar{width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:-.01em;user-select:none}
.hdr-info{flex:1;min-width:0}
.hdr-name{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.04em;color:var(--text);line-height:1}
.hdr-badge{font-size:9.5px;font-weight:700;background:var(--green-dim);color:var(--green);border:1px solid rgba(22,163,74,.18);border-radius:3px;padding:3px 10px;display:flex;align-items:center;gap:5px;flex-shrink:0;letter-spacing:.06em;text-transform:uppercase}
.hdr-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:bpulse 2.5s infinite;flex-shrink:0}
@keyframes bpulse{0%,100%{opacity:1}50%{opacity:.25}}

/* LAYOUT */
.main{position:fixed;top:var(--hdr);bottom:calc(var(--nav) + env(safe-area-inset-bottom));left:0;right:0;overflow:hidden}
.panel{position:absolute;inset:0;display:none;flex-direction:column;overflow:hidden}
.panel.active{display:flex}
.panel-scroll{flex:1;overflow-y:auto;padding:20px 16px 16px;-webkit-overflow-scrolling:touch}

/* BOTTOM NAV */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;height:calc(var(--nav) + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:rgba(17,17,19,.94);border-top:1px solid var(--border);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);display:flex;align-items:flex-start;padding-top:8px;z-index:200}
.bn-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;color:var(--muted2);cursor:pointer;font-family:inherit;padding:4px 0;-webkit-tap-highlight-color:transparent;transition:color .25s cubic-bezier(.22,1,.36,1);position:relative}
.bn-item svg{width:20px;height:20px;stroke-width:1.75;transition:transform .25s cubic-bezier(.22,1,.36,1)}
.bn-item span{font-size:10px;font-weight:600;letter-spacing:.02em;transition:color .25s}
.bn-item.active{color:var(--text)}
.bn-item.active svg{transform:scale(1.06)}
.bn-item.active::before{content:'';position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:22px;height:2px;background:var(--primary);border-radius:0 0 2px 2px}
.bn-item:active{opacity:.45}

/* CHAT — messages */
.chat-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 14px 28px;display:flex;flex-direction:column;gap:0;background:#0c0c0f}
.user-row{display:flex;justify-content:flex-end;margin:4px 0 10px;animation:msgIn .3s cubic-bezier(.22,1,.36,1) both}
.user-pill{max-width:80%;background:var(--primary);border-radius:20px 20px 4px 20px;padding:11px 16px;font-size:15px;line-height:1.55;color:#fff;word-break:break-word;letter-spacing:-.01em}
.ai-row{display:flex;align-items:flex-start;margin:4px 0 10px;animation:msgIn .3s cubic-bezier(.22,1,.36,1) both}
.ai-row--intro{margin-bottom:6px}
@keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.ai-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.ai-greeting{font-size:15.5px;line-height:1.7;color:var(--text)}
.ai-text{font-size:15px;line-height:1.76;color:var(--text);word-break:break-word;background:var(--s1);border-radius:4px 16px 16px 16px;padding:11px 14px;align-self:flex-start;max-width:88%}
.ai-text b{color:var(--primary);font-weight:700}
.ai-text.typing::after{content:'▋';color:var(--muted2);animation:blink .9s step-end infinite;font-size:12px;vertical-align:middle;margin-left:1px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.typing-row{display:flex;align-items:flex-start;margin:4px 0 8px;animation:msgIn .2s ease-out both}
.typing-dots{display:inline-flex;align-items:center;gap:5px;padding:12px 16px;background:var(--s1);border-radius:4px 16px 16px 16px}
.typing-dots span{width:6px;height:6px;border-radius:50%;background:var(--muted2);animation:tdot 1.4s ease-in-out infinite}
.typing-dots span:nth-child(2){animation-delay:.17s}
.typing-dots span:nth-child(3){animation-delay:.34s}
@keyframes tdot{0%,60%,100%{transform:translateY(0);opacity:.35}28%{transform:translateY(-6px);opacity:1}}

/* CHAT — módulos IA */
.ai-modules{display:flex;flex-direction:column;gap:0;margin-top:6px;background:var(--s1);border-radius:14px;overflow:hidden;border:1px solid var(--border)}
.ai-mod-card{background:var(--s1);border:none;border-bottom:1px solid var(--border);border-radius:0;padding:16px 18px;font-size:15px;font-weight:500;color:var(--text);cursor:pointer;transition:background .18s;-webkit-tap-highlight-color:transparent;font-family:inherit;text-align:left;display:flex;align-items:center;justify-content:space-between;letter-spacing:-.02em;line-height:1.3;width:100%}
.ai-mod-card:last-child{border-bottom:none}
.ai-mod-card::after{content:'→';font-size:14px;color:var(--muted2);flex-shrink:0;margin-left:10px;transition:transform .18s,color .18s}
.ai-mod-card:hover{background:var(--s1)}
.ai-mod-card:hover::after{transform:translateX(3px);color:var(--text)}
.ai-mod-card:active{background:var(--s1);opacity:.7}
.ai-mod-card.used{opacity:.15;pointer-events:none}
.ai-biz-desc{font-size:13px;color:var(--muted);line-height:1.45;margin-top:10px;padding:0 2px;letter-spacing:-.01em}

/* CHAT — chips de sugerencia */
.ai-chips{display:flex;flex-direction:column;gap:4px;margin-top:10px;margin-left:-42px;width:calc(100% + 42px)}
.ai-chip{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:11px 14px;font-size:13.5px;font-weight:500;color:var(--text);cursor:pointer;transition:background .22s cubic-bezier(.22,1,.36,1),border-color .22s,color .22s;-webkit-tap-highlight-color:transparent;font-family:inherit;text-align:left;display:flex;align-items:center;justify-content:space-between;letter-spacing:-.01em;line-height:1.3}
.ai-chip::after{content:'→';font-size:13px;color:var(--muted2);flex-shrink:0;margin-left:8px;transition:transform .22s cubic-bezier(.22,1,.36,1),color .22s}
.ai-chip:hover{background:var(--s1);border-color:var(--border-strong)}
.ai-chip:hover::after{transform:translateX(3px);color:var(--text)}
.ai-chip:active{opacity:.6}
.ai-chip.used{opacity:.15;pointer-events:none}

/* CHAT — formulario inline */
.chat-form{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.chat-form-input{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;color:var(--text);font-size:14.5px;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none}
.chat-form-input:focus{border-color:var(--primary)}
.chat-form-input:disabled{opacity:.4}
.chat-form-input::placeholder{color:var(--muted2)}
.chat-form-error{font-size:12.5px;color:#dc2626;display:none;padding:2px 2px 0}
.chat-form-btn{background:var(--primary);border:none;border-radius:var(--r);padding:13px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.08em;text-transform:uppercase;transition:opacity .18s,transform .15s;-webkit-tap-highlight-color:transparent}
.chat-form-btn:hover{opacity:.82}
.chat-form-btn:active{transform:scale(.98)}
.chat-form-btn:disabled{opacity:.3;cursor:default}

/* CHAT — tarjetas de producto */
.product-cards{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.product-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;display:flex;align-items:center;gap:12px;transition:border-color .2s}
.product-card:has(.qty-num:not(:empty)[data-qty]):not([data-qty="0"]){border-color:var(--primary)}
.product-info{flex:1;min-width:0}
.product-name{font-size:14px;font-weight:600;margin-bottom:2px;letter-spacing:-.01em;color:var(--text)}
.product-desc{font-size:12px;color:var(--muted);line-height:1.35;margin-bottom:4px}
.product-price{font-size:13px;font-weight:700;color:var(--text)}
.qty-ctrl{display:flex;align-items:center;gap:7px;flex-shrink:0}
.qty-btn{width:29px;height:29px;border-radius:4px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s;-webkit-tap-highlight-color:transparent;font-family:inherit}
.qty-btn:hover{background:var(--s2);border-color:var(--border-strong)}
.qty-btn:active{transform:scale(.88)}
.qty-btn:disabled{opacity:.22;cursor:default}
.qty-num{font-size:15px;font-weight:700;min-width:18px;text-align:center;color:var(--text)}
.cart-summary{margin-top:10px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:11px 13px;display:none}
.cart-summary.visible{display:block}
.cart-line{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:5px}
.cart-total{display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--text);padding-top:7px;border-top:1px solid var(--border);margin-top:3px}
.cart-hint{font-size:12.5px;color:var(--muted);text-align:center;padding:2px 0}
.cart-confirm-btn{margin-top:12px;width:100%;background:var(--primary);border:none;border-radius:var(--r);padding:14px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.08em;text-transform:uppercase;transition:opacity .15s,transform .12s;-webkit-tap-highlight-color:transparent}
.cart-confirm-btn:hover{opacity:.82}
.cart-confirm-btn:active{transform:scale(.98)}
.cart-confirm-btn:disabled{opacity:.28;cursor:default}

/* CHAT — tarjeta de confirmación */
.confirm-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-top:4px}
.confirm-title{font-size:15px;font-weight:700;margin-bottom:12px;color:var(--text);letter-spacing:-.025em}
.confirm-row{display:flex;gap:10px;margin-bottom:7px;font-size:13.5px}
.confirm-label{color:var(--muted);flex-shrink:0;min-width:60px}
.confirm-value{color:var(--text);font-weight:500}
.confirm-note{font-size:12px;color:var(--muted);margin-top:10px;padding-top:9px;border-top:1px solid var(--border)}

/* OTHER TABS */
.sec-label{font-size:10px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;padding:18px 0 10px}
.mod-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:15px 14px;display:flex;align-items:center;gap:13px;text-decoration:none;color:inherit;margin-bottom:6px;transition:background .25s,border-color .25s;-webkit-tap-highlight-color:transparent;cursor:pointer}
.mod-card:hover{background:var(--s2);border-color:var(--border-strong)}
.mod-card:active{transform:scale(.98)}
.mod-icon{width:44px;height:44px;border-radius:4px;background:var(--s2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mod-icon svg{width:20px;height:20px;stroke:var(--text)}
.mod-texts{flex:1;min-width:0}
.mod-title{font-size:14.5px;font-weight:600;margin-bottom:3px;letter-spacing:-.02em;color:var(--text)}
.mod-desc{font-size:13px;color:var(--muted);line-height:1.4}
.mod-arrow svg{width:14px;height:14px;stroke:var(--muted2)}
.steps-list{display:flex;flex-direction:column;gap:6px;margin-top:4px}
.step-item{display:flex;align-items:center;gap:12px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px}
.step-num{width:24px;height:24px;border-radius:3px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:#fff}
.step-text{font-size:13.5px;line-height:1.4;color:var(--text)}

/* NOSOTROS */
.biz-hero{display:flex;flex-direction:column;align-items:center;padding:28px 0 22px;text-align:center}
.biz-av{width:72px;height:72px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fff;margin-bottom:14px;letter-spacing:-.03em}
.biz-name{font-size:20px;font-weight:700;letter-spacing:-.04em;margin-bottom:4px;color:var(--text)}
.biz-tag{font-size:13px;color:var(--muted)}
.info-group{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.info-row{display:flex;align-items:center;gap:13px;padding:14px 15px;text-decoration:none;color:inherit;border-bottom:1px solid var(--border);cursor:default;transition:background .18s}
.info-row:last-child{border-bottom:none}
a.info-row,button.info-row{cursor:pointer;background:none;border:none;width:100%;text-align:left;font-family:inherit;color:var(--text)}
a.info-row:hover,button.info-row:hover{background:var(--s2)}
a.info-row:active,button.info-row:active{background:var(--s3)}
.info-icon{width:34px;height:34px;border-radius:4px;background:var(--s2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.info-icon svg{width:16px;height:16px;stroke:var(--text);stroke-width:1.75}
.info-label{font-size:10px;color:var(--muted);margin-bottom:2px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.info-val{font-size:14px;font-weight:500;color:var(--text)}

/* PANEL COTIZACIÓN (slide-in pantalla completa) */
.quote-panel{position:fixed;top:0;left:0;right:0;bottom:0;z-index:500;background:var(--bg);transform:translateX(100%);transition:transform .38s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;will-change:transform;padding-top:env(safe-area-inset-top)}
.quote-panel.open{transform:translateX(0)}
.qp-header{height:var(--hdr);display:flex;align-items:center;padding:0 8px 0 4px;background:rgba(17,17,19,.92);border-bottom:1px solid var(--border);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);flex-shrink:0}
.qp-back{background:none;border:none;color:var(--text);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:3px;padding:10px 10px;-webkit-tap-highlight-color:transparent;flex-shrink:0;transition:opacity .15s}
.qp-back svg{width:17px;height:17px;flex-shrink:0;stroke:var(--text);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.qp-back:hover{opacity:.55}
.qp-back:active{opacity:.35}
.qp-title{flex:1;text-align:center;font-size:15px;font-weight:700;letter-spacing:-.03em;margin-right:8px;color:var(--text)}
.qp-spacer{width:72px;flex-shrink:0}
.qp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 20px}
.qp-footer{padding:10px 16px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:rgba(17,17,19,.94);border-top:1px solid var(--border);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);flex-shrink:0}
.qp-section-title{font-size:10px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;padding:18px 0 10px}
.qp-input{display:block;width:100%;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;color:var(--text);font-size:15px;font-family:inherit;outline:none;-webkit-appearance:none;transition:border-color .2s,box-shadow .2s;margin-bottom:10px}
.qp-input:focus{border-color:var(--primary)}
.qp-input:disabled{opacity:.4}
.qp-input::placeholder{color:var(--muted2)}
.qp-error{font-size:12.5px;color:#dc2626;display:none;padding:0 2px 8px}
.qp-btn{display:block;width:100%;background:var(--primary);border:none;border-radius:var(--r);padding:15px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.08em;text-transform:uppercase;transition:opacity .15s,transform .12s;-webkit-tap-highlight-color:transparent}
.qp-btn:hover{opacity:.82}
.qp-btn:active{transform:scale(.98)}
.qp-btn:disabled{opacity:.28;cursor:default}
.qp-cart-bar{display:flex;align-items:center;justify-content:space-between;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:11px 14px;margin-bottom:10px}
.qp-cart-info{font-size:13px;color:var(--muted)}
.qp-cart-total{font-size:14px;font-weight:700;color:var(--text)}
.qp-summary{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;margin-bottom:4px}

/* BOOKING PANEL — fechas y horarios */
.bp-dates{display:flex;flex-direction:column;gap:6px}
.bp-date-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;display:flex;align-items:center;gap:13px;cursor:pointer;transition:background .25s,border-color .25s;-webkit-tap-highlight-color:transparent}
.bp-date-card:hover{background:var(--s2);border-color:var(--border-strong)}
.bp-date-card:active{transform:scale(.97)}
.bp-date-icon{width:44px;height:44px;border-radius:4px;background:var(--primary);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;gap:1px}
.bp-date-day{font-size:9px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.06em}
.bp-date-num{font-size:19px;font-weight:700;color:#fff;line-height:1}
.bp-date-info{flex:1;min-width:0}
.bp-date-label{font-size:14px;font-weight:600;margin-bottom:2px;letter-spacing:-.01em;color:var(--text)}
.bp-date-slots{font-size:12px;color:var(--muted)}
.bp-date-arrow{width:14px;height:14px;stroke:var(--muted2);flex-shrink:0;stroke-width:2;opacity:.5}
.bp-times{display:flex;flex-wrap:wrap;gap:6px}
.bp-time-chip{background:var(--s1);border:1px solid var(--border);border-radius:4px;padding:10px 16px;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;transition:all .25s cubic-bezier(.22,1,.36,1);-webkit-tap-highlight-color:transparent;font-family:inherit;letter-spacing:-.01em}
.bp-time-chip:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
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
