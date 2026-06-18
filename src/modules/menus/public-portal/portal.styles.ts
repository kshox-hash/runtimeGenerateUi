export function portalStyles(): string {
  return `
/* ── RESET ───────────────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);overscroll-behavior:none}

/* ── TOKENS ──────────────────────────────────────────────────────────── */
:root{
  --bg:#EEF2F7;
  --panel:#FFFFFF;
  --rail:#1C2033;
  --rail-icon:#7D8699;
  --rail-icon-act:#FFFFFF;
  --border:#E2E9F2;
  --border-inner:#F1F5FA;
  --text:#1A2235;
  --soft:#64748B;
  --dim:#9BAAB8;
  --primary:#5A67F2;
  --primary-dim:rgba(90,103,242,.10);
  --primary-glow:rgba(90,103,242,.22);
  --green:#22C55E;
  --green-dim:rgba(34,197,94,.10);
  --red:#EF4444;
  --red-dim:rgba(239,68,68,.10);
  --amber:#F59E0B;
  --amber-dim:rgba(245,158,11,.12);
  --shadow-s:0 1px 4px rgba(0,0,0,.06);
  --shadow:0 4px 18px rgba(0,0,0,.07),0 1px 4px rgba(0,0,0,.04);
  --shadow-l:0 8px 32px rgba(0,0,0,.1),0 2px 8px rgba(0,0,0,.05);
  --r:14px;
  --rs:8px;
  --rail-w:60px;
  --prof-w:258px;
  --hdr:54px;
  --nav:64px;
}

/* ── LAYOUT — MOBILE ─────────────────────────────────────────────────── */
.icon-rail{display:none}
.content-nav{display:none}

.mobile-hdr{
  position:fixed;top:0;left:0;right:0;height:var(--hdr);
  background:var(--panel);border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:12px;padding:0 18px;z-index:200;
  box-shadow:var(--shadow-s)
}
.mhdr-av{
  width:32px;height:32px;border-radius:10px;flex-shrink:0;
  background:var(--primary-dim);border:1.5px solid var(--primary-glow);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;color:var(--primary);letter-spacing:-.02em;user-select:none
}
.mhdr-name{font-size:15px;font-weight:700;color:var(--text);letter-spacing:-.04em;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mhdr-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:var(--green-dim);color:var(--green);
  font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
  padding:3px 10px;border-radius:20px;border:1px solid rgba(34,197,94,.2);flex-shrink:0
}
.mhdr-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:blink 2.5s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}

.content-wrap{
  position:fixed;top:var(--hdr);left:0;right:0;
  bottom:calc(var(--nav) + env(safe-area-inset-bottom,0px));
  overflow:hidden;background:var(--bg)
}
.portal-main{display:contents}
.panel{
  position:absolute;inset:0;overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  opacity:0;pointer-events:none;
  transition:opacity .2s ease
}
.panel.active{opacity:1;pointer-events:auto}
.pscroll{padding:20px 16px 28px}

/* BOTTOM NAV */
.bottom-nav{
  position:fixed;bottom:0;left:0;right:0;
  height:calc(var(--nav) + env(safe-area-inset-bottom,0px));
  padding-bottom:env(safe-area-inset-bottom,0px);
  background:var(--panel);border-top:1px solid var(--border);
  display:flex;align-items:flex-start;padding-top:10px;z-index:200;
  box-shadow:0 -4px 16px rgba(0,0,0,.06)
}
.bn-item{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;
  background:none;border:none;color:var(--dim);cursor:pointer;
  font-family:inherit;padding:5px 0;
  -webkit-tap-highlight-color:transparent;transition:color .18s
}
.bn-item svg{width:20px;height:20px;stroke-width:1.75;transition:transform .18s}
.bn-item span{font-size:10px;font-weight:600;letter-spacing:.01em}
.bn-item.active{color:var(--primary)}
.bn-item.active svg{transform:scale(1.08)}
.bn-item:active{opacity:.5}

/* ── DESKTOP ≥ 800px ─────────────────────────────────────────────────── */
@media(min-width:800px){
  .mobile-hdr{display:none}
  .bottom-nav{display:none}

  /* ICON RAIL */
  .icon-rail{
    display:flex;flex-direction:column;align-items:center;
    position:fixed;top:0;left:0;bottom:0;width:var(--rail-w);
    background:var(--rail);z-index:300;padding:20px 0;gap:6px
  }
  .ir-av{
    width:36px;height:36px;border-radius:11px;margin-bottom:16px;flex-shrink:0;
    background:rgba(255,255,255,.12);
    display:flex;align-items:center;justify-content:center;
    font-size:13px;font-weight:800;color:#fff;user-select:none;letter-spacing:-.02em
  }
  .ir-btn{
    width:40px;height:40px;border-radius:12px;border:none;cursor:pointer;
    background:none;display:flex;align-items:center;justify-content:center;
    color:var(--rail-icon);transition:background .15s,color .15s;
    -webkit-tap-highlight-color:transparent;position:relative
  }
  .ir-btn svg{width:19px;height:19px;stroke-width:1.75}
  .ir-btn:hover{background:rgba(255,255,255,.08);color:#fff}
  .ir-btn.active{background:rgba(255,255,255,.14);color:#fff}
  .ir-btn.active::before{
    content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);
    width:3px;height:22px;background:var(--primary);border-radius:0 3px 3px 0
  }
  .ir-spacer{flex:1}

  .portal-main{display:contents}

  /* PROFILE CARD — fixed left strip, looks like a card with margin */
  .profile-rail{
    display:flex;flex-direction:column;
    position:fixed;top:12px;left:calc(var(--rail-w) + 12px);bottom:12px;
    width:calc(var(--prof-w) - 4px);
    background:var(--panel);border-radius:16px;
    border:1px solid var(--border);box-shadow:var(--shadow-s);
    z-index:200;overflow-y:auto;overflow-x:hidden
  }
  .pr-top{
    padding:20px 18px 16px;
    border-bottom:1px solid var(--border-inner)
  }
  .pr-back{
    display:inline-flex;align-items:center;gap:5px;
    font-size:11px;font-weight:600;color:var(--dim);margin-bottom:16px;
    background:none;border:none;cursor:default;font-family:inherit
  }
  .pr-back svg{width:12px;height:12px;stroke-width:2.4}
  /* Avatar: solid brand color, NO shadow */
  .pr-avatar{
    width:68px;height:68px;border-radius:50%;margin-bottom:12px;
    background:var(--primary);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;font-weight:800;color:#fff;user-select:none;letter-spacing:-.03em
  }
  .pr-name{font-size:15px;font-weight:700;color:var(--text);letter-spacing:-.04em;margin-bottom:3px}
  .pr-role{font-size:12px;color:var(--soft);margin-bottom:8px;line-height:1.4}
  .pr-rating{
    display:flex;align-items:center;gap:5px;margin-bottom:8px;
    font-size:12px;color:var(--amber);font-weight:600
  }
  .pr-rating-count{font-size:11px;color:var(--soft);font-weight:400}
  .pr-online-row{display:flex;align-items:center;gap:8px;margin-bottom:12px}
  .pr-online-chip{
    display:inline-flex;align-items:center;gap:5px;
    font-size:10.5px;font-weight:700;color:var(--green);
    background:var(--green-dim);border:1px solid rgba(34,197,94,.2);
    border-radius:7px;padding:3px 8px
  }
  .pr-online-chip::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:blink 2.5s infinite}
  .pr-actions{display:flex;gap:7px;flex-wrap:wrap}
  .pr-action-btn{
    width:36px;height:36px;border-radius:10px;border:1.5px solid var(--border);
    background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;
    color:var(--soft);transition:background .15s,border-color .15s,color .15s;
    text-decoration:none;flex-shrink:0
  }
  .pr-action-btn svg{width:15px;height:15px;stroke-width:1.7}
  .pr-action-btn[title="WhatsApp"]{color:#22c55e;border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.07)}
  .pr-action-btn[title="WhatsApp"]:hover{background:rgba(34,197,94,.18);border-color:#22c55e}
  .pr-action-btn[title="Instagram"]{color:#ec4899;border-color:rgba(236,72,153,.3);background:rgba(236,72,153,.07)}
  .pr-action-btn[title="Instagram"]:hover{background:rgba(236,72,153,.18);border-color:#ec4899}
  .pr-action-btn[title="Llamar"]{color:#3b82f6;border-color:rgba(59,130,246,.3);background:rgba(59,130,246,.07)}
  .pr-action-btn[title="Llamar"]:hover{background:rgba(59,130,246,.18);border-color:#3b82f6}
  /* Next slot */
  .pr-avail-section{padding:12px 18px;border-bottom:1px solid var(--border-inner)}
  .pr-avail-section-title{font-size:10.5px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px}
  .pr-avail-pill{
    display:inline-flex;align-items:center;gap:6px;
    background:var(--green-dim);color:var(--green);
    border:1px solid rgba(34,197,94,.22);border-radius:9px;padding:7px 11px;
    font-size:12px;font-weight:700;
  }
  .pr-avail-pill svg{width:12px;height:12px;stroke:var(--green);flex-shrink:0}
  .pr-avail-none{font-size:11.5px;color:var(--dim);background:var(--bg);border-radius:7px;padding:7px 10px;border:1px solid var(--border)}
  .pr-section{padding:14px 18px}
  .pr-section-title{font-size:10.5px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px}
  .pr-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
  .pr-row:last-child{margin-bottom:0}
  .pr-row-icon{
    width:28px;height:28px;border-radius:8px;background:var(--bg);flex-shrink:0;
    display:flex;align-items:center;justify-content:center;margin-top:1px;
    border:1px solid var(--border)
  }
  .pr-row-icon svg{width:12px;height:12px;color:var(--soft)}
  .pr-row-body{flex:1;min-width:0}
  .pr-row-lbl{font-size:9.5px;font-weight:700;color:var(--dim);letter-spacing:.05em;margin-bottom:2px;text-transform:uppercase}
  .pr-row-val{font-size:12.5px;font-weight:500;color:var(--text);line-height:1.4;word-break:break-word}
  .pr-row-badge{
    display:inline-block;margin-top:3px;
    font-size:9px;font-weight:700;color:var(--green);
    background:var(--green-dim);border:1px solid rgba(34,197,94,.2);
    border-radius:5px;padding:1px 6px;letter-spacing:.04em
  }
  .pr-footer{padding:14px 18px 20px;margin-top:auto}
  .btn-wa{
    display:flex;align-items:center;justify-content:center;gap:8px;
    background:#25D366;color:#fff;font-family:inherit;font-size:13px;font-weight:700;
    border:none;border-radius:11px;padding:11px 16px;cursor:pointer;
    transition:opacity .15s;text-decoration:none;width:100%
  }
  .btn-wa:hover{opacity:.88}
  .btn-wa svg{width:15px;height:15px}

  /* CONTENT AREA — fills the space to the right of the profile card */
  .content-wrap{
    position:fixed;
    top:0;left:calc(var(--rail-w) + var(--prof-w));right:0;bottom:0;
    overflow:hidden;background:var(--bg)
  }
  .content-nav{
    display:flex;align-items:center;gap:4px;
    position:absolute;top:0;left:0;right:0;height:56px;
    padding:0 28px;background:var(--panel);border-bottom:1px solid var(--border);
    z-index:100;box-shadow:var(--shadow-s)
  }
  .cn-tab{
    display:inline-flex;align-items:center;gap:7px;
    padding:7px 14px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;
    font-size:13.5px;font-weight:500;color:var(--soft);background:none;
    transition:background .15s,color .15s;white-space:nowrap;letter-spacing:-.01em
  }
  .cn-tab svg{width:15px;height:15px;stroke-width:1.75;opacity:.7}
  .cn-tab:hover{background:var(--bg);color:var(--text)}
  .cn-tab.active{background:var(--primary);color:#fff;font-weight:600}
  .cn-tab.active svg{opacity:1}
  .cn-spacer{flex:1}
  .cn-status{
    display:inline-flex;align-items:center;gap:6px;
    font-size:12px;font-weight:600;color:var(--green);
    background:var(--green-dim);border:1px solid rgba(34,197,94,.2);
    border-radius:8px;padding:5px 12px
  }
  .cn-status::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 2.5s infinite}

  .panel{
    position:absolute;
    top:56px;left:0;right:0;bottom:0;
    overflow-y:auto;-webkit-overflow-scrolling:touch;
    opacity:0;pointer-events:none;transition:opacity .2s ease
  }
  .panel.active{opacity:1;pointer-events:auto}
  .pscroll{padding:28px 28px 40px}
}

/* ── SHARED COMPONENTS ───────────────────────────────────────────────── */

/* Section header */
.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.sec-title{font-size:15px;font-weight:700;color:var(--text);letter-spacing:-.04em}
.sec-link{font-size:12.5px;font-weight:600;color:var(--primary);text-decoration:none;cursor:pointer;background:none;border:none;font-family:inherit}
.sec-link:hover{text-decoration:underline}

/* Service cards grid */
.proj-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;margin-bottom:28px
}
@media(min-width:600px){.proj-grid{grid-template-columns:repeat(3,1fr)}}
@media(min-width:1100px){.proj-grid{grid-template-columns:repeat(4,1fr)}}

.proj-card{
  background:var(--panel);border-radius:var(--r);
  border:1px solid var(--border);overflow:hidden;
  box-shadow:var(--shadow-s);
  transition:box-shadow .2s,transform .18s;cursor:default
}
.proj-card:hover{box-shadow:var(--shadow);transform:translateY(-2px)}
.proj-card-top{
  height:76px;position:relative;padding:12px 12px 0;
  display:flex;align-items:flex-start;justify-content:space-between
}
.proj-card-top-badge{
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(255,255,255,.22);color:#fff;
  font-size:10px;font-weight:700;letter-spacing:.04em;
  border-radius:6px;padding:3px 8px;backdrop-filter:blur(4px);
  -webkit-backdrop-filter:blur(4px)
}
.proj-card-price{
  font-size:13px;font-weight:700;color:#fff;
  background:rgba(0,0,0,.18);border-radius:6px;padding:3px 8px;
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)
}
.proj-card-body{padding:14px}
.proj-card-name{font-size:14px;font-weight:700;color:var(--text);letter-spacing:-.03em;margin-bottom:8px;line-height:1.3}
.proj-card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.proj-tag{
  display:inline-flex;align-items:center;
  font-size:10.5px;font-weight:600;
  border-radius:6px;padding:3px 8px;letter-spacing:.02em
}
.proj-card-footer{display:flex;align-items:center;justify-content:space-between}
.proj-btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:7px 12px;border-radius:8px;border:none;cursor:pointer;
  font-family:inherit;font-size:12px;font-weight:700;
  background:var(--primary-dim);color:var(--primary);
  transition:background .15s,transform .12s;-webkit-tap-highlight-color:transparent
}
.proj-btn:hover{background:var(--primary);color:#fff}
.proj-btn:active{transform:scale(.95)}
.proj-btn svg{width:12px;height:12px;stroke-width:2.5}

/* Bottom two-col layout */
.bottom-cols{display:grid;grid-template-columns:1fr;gap:16px;margin-top:4px}
@media(min-width:720px){.bottom-cols{grid-template-columns:1fr 1fr}}
@media(min-width:1000px){.bottom-cols{grid-template-columns:3fr 2fr}}

/* ── PRODUCTS LIST ───────────────────────────────────────────────────── */
.prod-card-wrap{background:var(--panel);border-radius:var(--r);border:1px solid var(--border);box-shadow:var(--shadow-s);overflow:hidden}
.prod-card-hdr{padding:14px 16px 10px;border-bottom:1px solid var(--border-inner)}
.prod-item{
  display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
  padding:11px 16px;border-bottom:1px solid var(--border-inner)
}
.prod-item:last-child{border-bottom:none}
.prod-item-left{flex:1;min-width:0}
.prod-item-name{font-size:13.5px;font-weight:600;color:var(--text);letter-spacing:-.02em;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prod-item-desc{font-size:11.5px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prod-item-code{display:inline-block;font-size:9.5px;font-weight:700;color:var(--soft);background:var(--bg);border-radius:5px;padding:1px 5px;margin-top:3px;letter-spacing:.04em}
.prod-item-price{font-size:13px;font-weight:700;color:var(--primary);flex-shrink:0;white-space:nowrap;font-variant-numeric:tabular-nums}
.prod-empty{text-align:center;color:var(--dim);padding:32px 16px;font-size:13.5px;line-height:1.6}

/* ── COTIZAR CTA CARD ────────────────────────────────────────────────── */
.cot-card{
  background:var(--panel);border-radius:var(--r);border:1px solid var(--border);
  box-shadow:var(--shadow-s);padding:20px;display:flex;flex-direction:column;gap:12px;
  min-height:200px;justify-content:space-between
}
.cot-icon-wrap{
  width:44px;height:44px;border-radius:12px;background:var(--primary-dim);
  display:flex;align-items:center;justify-content:center
}
.cot-icon-wrap svg{width:20px;height:20px;stroke:var(--primary);stroke-width:1.75}
.cot-lbl{font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
.cot-name{font-size:16px;font-weight:700;color:var(--text);letter-spacing:-.04em;margin-bottom:4px;line-height:1.3}
.cot-desc{font-size:12.5px;color:var(--soft);line-height:1.5}
.btn-primary{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  background:var(--primary);color:#fff;font-family:inherit;font-size:13px;font-weight:700;
  border:none;border-radius:10px;padding:11px 18px;cursor:pointer;
  transition:opacity .15s,transform .12s;text-decoration:none;letter-spacing:-.01em;
  -webkit-tap-highlight-color:transparent
}
.btn-primary:hover{opacity:.88}
.btn-primary:active{transform:scale(.97)}
.btn-primary svg{width:14px;height:14px;stroke-width:2.2}

/* ── FULL RESERVAS VIEW ──────────────────────────────────────────────── */
.svc-list-full{display:flex;flex-direction:column;gap:8px}
.svc-row{
  display:flex;align-items:center;gap:14px;
  background:var(--panel);border:1px solid var(--border);border-radius:var(--r);
  padding:14px 16px;box-shadow:var(--shadow-s);cursor:pointer;
  transition:box-shadow .18s,transform .15s;-webkit-tap-highlight-color:transparent
}
.svc-row:hover{box-shadow:var(--shadow);transform:translateY(-1px)}
.svc-row:active{transform:scale(.99)}
.svc-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
.svc-body{flex:1;min-width:0}
.svc-name{font-size:14.5px;font-weight:600;color:var(--text);letter-spacing:-.03em;margin-bottom:2px}
.svc-meta{font-size:12px;color:var(--soft)}
.svc-price{font-size:14px;font-weight:700;color:var(--primary);white-space:nowrap;flex-shrink:0;font-variant-numeric:tabular-nums}
.svc-arr{color:var(--dim);flex-shrink:0;margin-left:4px}
.svc-arr svg{width:15px;height:15px;stroke-width:2.2}
.svc-empty{text-align:center;padding:40px 20px;color:var(--soft);font-size:14px;line-height:1.7;background:var(--panel);border-radius:var(--r);border:1px solid var(--border)}

.how-card{background:var(--panel);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow-s);overflow:hidden}
.how-item{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-bottom:1px solid var(--border-inner)}
.how-item:last-child{border-bottom:none}
.how-num{width:30px;height:30px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;font-variant-numeric:tabular-nums}
.how-txt{font-size:13.5px;color:var(--soft);line-height:1.5;padding-top:4px}

/* Loader */
.loader-row{display:flex;align-items:center;gap:10px;padding:32px 0;color:var(--dim);font-size:13.5px;justify-content:center}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── SLIDE PANELS ────────────────────────────────────────────────────── */
.slide-panel{
  position:fixed;top:0;right:0;bottom:0;
  width:min(100vw,460px);
  background:var(--panel);border-left:1px solid var(--border);
  z-index:600;transform:translateX(100%);
  transition:transform .32s cubic-bezier(.22,1,.36,1);
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:var(--shadow-l)
}
.slide-panel.open{transform:translateX(0)}
.slide-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:599;
  opacity:0;pointer-events:none;transition:opacity .25s;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)
}
.slide-overlay.open{opacity:1;pointer-events:auto}
.sp-hdr{
  display:flex;align-items:center;gap:12px;
  padding:16px 20px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--panel)
}
.sp-title{font-size:15px;font-weight:700;color:var(--text);flex:1;letter-spacing:-.03em}
.sp-close{
  width:32px;height:32px;border-radius:9px;background:var(--bg);border:1px solid var(--border);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  -webkit-tap-highlight-color:transparent;transition:background .15s
}
.sp-close:hover{background:var(--red-dim)}
.sp-close svg{width:14px;height:14px;stroke:var(--soft);stroke-width:2.2}
.sp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
.booking-iframe-wrap{flex:1;overflow:hidden;display:flex;flex-direction:column}
.booking-iframe-wrap iframe{flex:1;border:none;width:100%;height:100%;background:var(--bg)}

/* Quote panel inputs */
.qp-inp{
  display:block;width:100%;
  background:var(--bg);border:1.5px solid var(--border);border-radius:10px;
  color:var(--text);font-family:inherit;font-size:14px;
  padding:11px 14px;margin-bottom:10px;outline:none;
  transition:border-color .18s
}
.qp-inp:focus{border-color:var(--primary);background:var(--panel)}
.qp-inp::placeholder{color:var(--dim)}
.qp-prod-card{
  display:flex;align-items:center;gap:14px;
  padding:13px 0;border-bottom:1px solid var(--border-inner)
}
.qp-prod-card:last-child{border-bottom:none}
.qp-prod-info{flex:1;min-width:0}
.qp-prod-name{font-size:13.5px;font-weight:600;color:var(--text);margin-bottom:2px;letter-spacing:-.02em}
.qp-prod-desc{font-size:12px;color:var(--dim);line-height:1.4;margin-bottom:3px}
.qp-prod-price{font-size:12.5px;font-weight:700;color:var(--primary)}
.qp-qty{display:flex;align-items:center;gap:9px;flex-shrink:0}
.qp-qty-btn{
  width:28px;height:28px;border-radius:8px;
  background:var(--bg);border:1.5px solid var(--border);
  color:var(--text);font-size:16px;cursor:pointer;line-height:1;
  display:flex;align-items:center;justify-content:center;font-family:inherit;
  transition:background .12s,border-color .12s
}
.qp-qty-btn:hover{background:var(--primary-dim);border-color:var(--primary-glow)}
.qp-qty-num{font-size:13px;font-weight:600;color:var(--text);min-width:16px;text-align:center;font-variant-numeric:tabular-nums}

/* ── SECTION SUBTITLE ────────────────────────────────────────────────── */
.sec-sub{font-size:11.5px;color:var(--dim);margin-top:1px;font-weight:400}
.sec-hdr>div{display:flex;flex-direction:column;gap:1px}

/* ── RATING STARS ────────────────────────────────────────────────────── */
.pr-rating{
  display:flex;align-items:center;gap:5px;margin-top:4px;margin-bottom:10px;
  font-size:12.5px;color:var(--amber);font-weight:600
}
.pr-rating-count{font-size:11.5px;color:var(--soft);font-weight:400}

/* ── REVIEWS TAB ─────────────────────────────────────────────────────── */
.rv-layout{
  display:flex;align-items:center;gap:20px;
  background:var(--panel);border-radius:var(--r);border:1px solid var(--border);
  box-shadow:var(--shadow-s);padding:20px;margin-bottom:4px
}
.rv-summary{text-align:center;flex-shrink:0}
.rv-avg-big{font-size:42px;font-weight:800;color:var(--text);line-height:1}
.rv-stars-big{font-size:18px;color:var(--amber);margin:4px 0 2px;letter-spacing:1px}
.rv-total{font-size:11.5px;color:var(--dim)}
.rv-bars{flex:1;display:flex;flex-direction:column;gap:5px}
.rv-bar-row{display:flex;align-items:center;gap:6px}
.rv-bar-lbl{font-size:11px;color:var(--soft);width:26px;text-align:right;flex-shrink:0}
.rv-bar-track{flex:1;height:6px;background:var(--border);border-radius:99px;overflow:hidden}
.rv-bar-fill{height:100%;background:var(--amber);border-radius:99px;transition:width .4s}
.rv-bar-count{font-size:11px;color:var(--dim);width:18px;flex-shrink:0}
.rv-card{
  background:var(--panel);border:1px solid var(--border);border-radius:12px;
  padding:14px 16px;margin-bottom:10px;box-shadow:var(--shadow-s)
}
.rv-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.rv-card-stars{font-size:13px;letter-spacing:1px}
.rv-card-meta{font-size:11.5px}
.rv-name{font-weight:600;color:var(--text)}
.rv-date{color:var(--dim)}
.rv-comment{font-size:13.5px;color:var(--soft);line-height:1.5}

/* ── CALENDAR WIDGET ─────────────────────────────────────────────────── */
.cal-widget{
  background:var(--panel);border-radius:var(--r);border:1px solid var(--border);
  box-shadow:var(--shadow-s);padding:18px 16px;
}
.cal-hdr{
  display:flex;align-items:center;justify-content:space-between;margin-bottom:14px
}
.cal-title{font-size:14px;font-weight:700;color:var(--text);letter-spacing:-.04em}
.cal-nav{display:flex;align-items:center;gap:4px}
.cal-nav-btn{
  width:28px;height:28px;border-radius:8px;background:var(--bg);
  border:1px solid var(--border);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s;-webkit-tap-highlight-color:transparent
}
.cal-nav-btn:hover{background:var(--primary-dim);border-color:var(--primary-glow)}
.cal-nav-btn svg{width:13px;height:13px;stroke:var(--soft);stroke-width:2.2;stroke-linecap:round}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal-day-name{
  font-size:9.5px;font-weight:700;color:var(--dim);
  text-align:center;padding:3px 0;letter-spacing:.06em;text-transform:uppercase
}
.cal-cell{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  border-radius:8px;font-size:12px;font-weight:500;color:var(--text);
  position:relative;cursor:default;transition:background .15s
}
.cal-cell.cal-empty{pointer-events:none}
.cal-cell.cal-past{color:var(--dim);pointer-events:none}
.cal-cell.cal-today{
  background:var(--primary);color:#fff;font-weight:700;
  box-shadow:0 2px 8px var(--primary-glow)
}
.cal-cell.cal-avail{
  cursor:pointer;font-weight:600;color:var(--text);background:var(--green-dim);
  border:1.5px solid rgba(34,197,94,.25)
}
.cal-cell.cal-avail:hover{background:rgba(34,197,94,.22);transform:scale(1.08)}
.cal-cell.cal-avail::after{
  content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:var(--green)
}
.cal-cell.cal-taken{
  background:var(--bg);color:var(--dim);font-weight:400;
}
.cal-cell.cal-taken::after{
  content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:var(--red);opacity:.5
}
.cal-legend{
  display:flex;align-items:center;gap:14px;margin-top:12px;padding-top:10px;
  border-top:1px solid var(--border-inner)
}
.cal-leg-item{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--soft)}
.cal-leg-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.cal-loading{text-align:center;padding:24px 0;color:var(--dim);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px}

/* ── BOOKING FLOW INLINE ─────────────────────────────────────────────────── */
.sp-back{
  width:28px;height:28px;border-radius:8px;background:var(--bg);
  border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:background .15s;-webkit-tap-highlight-color:transparent
}
.sp-back:hover{background:var(--primary-dim)}
.sp-back svg{width:14px;height:14px;stroke:var(--soft);stroke-width:2.2}
.bk-scroll{padding:16px 20px;overflow-y:auto;flex:1}
.bk-date-badge{
  display:inline-flex;align-items:center;gap:6px;background:var(--primary-dim);
  color:var(--primary);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;
  margin-bottom:18px
}
.bk-sec-title{font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px}
.bk-svc-item{
  display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;
  background:var(--panel);border:1px solid var(--border);margin-bottom:8px;
  cursor:pointer;transition:border-color .15s,box-shadow .15s;-webkit-tap-highlight-color:transparent
}
.bk-svc-item:hover{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-dim)}
.bk-svc-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.bk-svc-info{flex:1}
.bk-svc-name{font-size:14px;font-weight:600;color:var(--text)}
.bk-svc-meta{font-size:11.5px;color:var(--soft);margin-top:1px}
.bk-svc-price{font-size:13px;font-weight:700;color:var(--primary)}
.bk-svc-arr svg{width:14px;height:14px;stroke:var(--dim)}
.bk-times-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
.bk-time-chip{
  padding:10px 4px;border-radius:10px;background:var(--panel);border:1.5px solid var(--border);
  font-size:13px;font-weight:600;color:var(--text);cursor:pointer;text-align:center;
  transition:border-color .15s,background .15s,color .15s;-webkit-tap-highlight-color:transparent
}
.bk-time-chip:hover,.bk-time-chip.sel{
  border-color:var(--primary);background:var(--primary-dim);color:var(--primary)
}
.bk-summary-card{
  background:var(--primary-dim);border-radius:12px;padding:14px;margin-bottom:20px;
  border:1px solid var(--primary-glow)
}
.bk-summary-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--primary);font-weight:600;margin-bottom:4px}
.bk-summary-row:last-child{margin-bottom:0}
.bk-summary-row svg{width:13px;height:13px;stroke:var(--primary);flex-shrink:0}
.bk-inp-wrap{margin-bottom:12px}
.bk-inp-lbl{font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.bk-inp{
  width:100%;padding:10px 12px;border-radius:10px;
  border:1.5px solid var(--border);background:var(--panel);
  font-size:14px;color:var(--text);outline:none;
  transition:border-color .15s;font-family:inherit
}
.bk-inp:focus{border-color:var(--primary)}
.bk-inp-err{color:#ef4444;font-size:11.5px;margin-top:3px}
.bk-success{text-align:center;padding:48px 20px}
.bk-success-icon{
  width:64px;height:64px;background:rgba(34,197,94,.12);border-radius:50%;
  display:flex;align-items:center;justify-content:center;margin:0 auto 18px
}
.bk-success-icon svg{width:30px;height:30px;stroke:#22c55e;stroke-width:2.5;fill:none}
.bk-success-title{font-size:19px;font-weight:700;color:var(--text);margin-bottom:8px}
.bk-success-sub{font-size:13.5px;color:var(--soft);line-height:1.5}
.bk-empty{text-align:center;padding:32px 16px;color:var(--dim);font-size:13.5px;line-height:1.5}

/* Mobile perfil view (in home panel) */
.mobile-profile{
  background:var(--panel);border-radius:var(--r);border:1px solid var(--border);
  box-shadow:var(--shadow-s);padding:20px;margin-bottom:16px
}
.mob-av{
  width:64px;height:64px;border-radius:50%;margin-bottom:12px;
  background:var(--primary-dim);border:2.5px solid var(--primary-glow);
  display:flex;align-items:center;justify-content:center;
  font-size:22px;font-weight:800;color:var(--primary);user-select:none;letter-spacing:-.03em
}
.mob-name{font-size:19px;font-weight:700;color:var(--text);letter-spacing:-.05em;margin-bottom:3px}
.mob-role{font-size:13px;color:var(--soft);margin-bottom:10px;line-height:1.4}
.mob-badge{
  display:inline-flex;align-items:center;gap:5px;
  font-size:10px;font-weight:700;color:var(--green);
  background:var(--green-dim);border:1px solid rgba(34,197,94,.2);
  border-radius:7px;padding:3px 10px;margin-bottom:14px
}
.mob-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:blink 2.5s infinite}
.mob-info-row{
  display:flex;align-items:center;gap:10px;
  padding:9px 0;border-bottom:1px solid var(--border-inner)
}
.mob-info-row:last-child{border-bottom:none}
.mob-info-icon{width:28px;height:28px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mob-info-icon svg{width:12px;height:12px;color:var(--soft)}
.mob-info-lbl{font-size:10.5px;color:var(--dim);font-weight:600;letter-spacing:.03em;margin-bottom:1px}
.mob-info-val{font-size:13px;font-weight:500;color:var(--text)}

.mob-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px}
.btn-outline{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  background:var(--bg);color:var(--text);font-family:inherit;font-size:13px;font-weight:600;
  border:1.5px solid var(--border);border-radius:10px;padding:10px 16px;cursor:pointer;
  transition:background .15s,border-color .15s;text-decoration:none;
  -webkit-tap-highlight-color:transparent
}
.btn-outline:hover{background:var(--primary-dim);border-color:var(--primary-glow);color:var(--primary)}
.btn-outline svg{width:14px;height:14px;stroke-width:1.75}
`;
}
