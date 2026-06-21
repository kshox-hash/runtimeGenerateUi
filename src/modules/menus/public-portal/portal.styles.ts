export function portalStyles(): string {
  return `
/* ── RESET ───────────────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;background:#fff;scrollbar-width:none;overflow-x:hidden}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}
body{font-family:'Inter',system-ui,sans-serif;background:#fff;color:var(--text);overscroll-behavior:none}
*::-webkit-scrollbar{width:4px;height:4px}
*::-webkit-scrollbar-track{background:transparent}
*::-webkit-scrollbar-thumb{background:rgba(15,23,42,.15);border-radius:99px}
*::-webkit-scrollbar-thumb:hover{background:rgba(15,23,42,.28)}

/* ── TOKENS ──────────────────────────────────────────────────────────── */
:root{
  --bg:#F5F7FA;
  --panel:#FFFFFF;
  --rail:#FFFFFF;
  --rail-icon:#9CA3AF;
  --rail-icon-act:var(--primary);
  --border:#E5E7EB;
  --border-inner:#F3F4F6;
  --text:#111827;
  --soft:#374151;
  --dim:#6B7280;
  --primary:#2563EB;
  --primary-dim:rgba(37,99,235,.10);
  --primary-glow:rgba(37,99,235,.20);
  --nav-act:#2563EB;
  --nav-act-bg:rgba(37,99,235,.08);
  --green:#16A34A;
  --green-dim:rgba(22,163,74,.10);
  --red:#DC2626;
  --red-dim:rgba(220,38,38,.10);
  --amber:#D97706;
  --amber-dim:rgba(217,119,6,.12);
  --shadow-s:0 2px 8px rgba(15,23,42,.07),0 0 0 1px rgba(15,23,42,.03);
  --shadow:0 8px 30px rgba(15,23,42,.08),0 2px 6px rgba(15,23,42,.04);
  --shadow-l:0 20px 60px rgba(15,23,42,.12),0 4px 16px rgba(15,23,42,.05);
  --r:20px;
  --rs:12px;
  --rail-w:210px;
  --prof-w:260px;
  --hdr:58px;
  --nav:70px;
}

/* ── LAYOUT — MOBILE ─────────────────────────────────────────────────── */
.icon-rail{display:none}
.content-nav{display:none}

.mobile-hdr{
  position:fixed;top:0;left:0;right:0;height:var(--hdr);
  background:var(--panel);border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:12px;padding:0 18px;z-index:200;
  box-shadow:0 1px 0 var(--border),0 4px 20px rgba(15,23,42,.05);
}
.mhdr-av{
  width:34px;height:34px;border-radius:12px;flex-shrink:0;
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
  bottom:env(safe-area-inset-bottom,0px);
  overflow:hidden;background:var(--bg)
}
.portal-main{display:contents}
.panel{
  position:absolute;inset:0;overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  opacity:0;pointer-events:none;
  transition:opacity .22s cubic-bezier(.4,0,.2,1),transform .22s cubic-bezier(.4,0,.2,1);
  transform:translateY(6px)
}
.panel.active{opacity:1;pointer-events:auto;transform:translateY(0)}
.pscroll{padding:24px 20px 32px}

/* BOTTOM NAV — hidden, replaced by hamburger drawer */
.bottom-nav{display:none}

/* HAMBURGER BUTTON */
.mhdr-burger{
  display:flex;flex-direction:column;justify-content:center;gap:5px;
  width:36px;height:36px;padding:6px;flex-shrink:0;
  background:none;border:none;cursor:pointer;border-radius:10px;
  -webkit-tap-highlight-color:transparent;
  transition:background .15s
}
.mhdr-burger:active{background:var(--border-inner)}
.mhdr-burger span{
  display:block;height:2px;border-radius:2px;
  background:var(--text);
  transition:transform .25s cubic-bezier(.4,0,.2,1),opacity .2s
}

/* MOBILE DRAWER */
.mobile-drawer{
  position:fixed;top:0;left:0;bottom:0;
  width:min(80vw,300px);
  background:var(--panel);z-index:700;
  display:flex;flex-direction:column;
  transform:translateX(calc(-100% - 2px));
  transition:transform .3s cubic-bezier(.22,1,.36,1);
  box-shadow:none
}
.mobile-drawer.open{
  transform:translateX(0);
  box-shadow:4px 0 40px rgba(15,23,42,.15)
}
.mdr-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 18px;height:var(--hdr);flex-shrink:0;
  border-bottom:1px solid var(--border)
}
.mdr-brand{font-size:16px;font-weight:800;color:var(--text);letter-spacing:-.04em}
.mdr-close{
  width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  background:var(--border-inner);border:none;border-radius:8px;cursor:pointer;
  -webkit-tap-highlight-color:transparent
}
.mdr-close svg{width:16px;height:16px;stroke:var(--soft)}
.mdr-nav{
  display:flex;flex-direction:column;gap:2px;
  padding:12px 10px;flex:1
}
.mdr-item{
  display:flex;align-items:center;gap:12px;
  padding:12px 14px;border-radius:14px;
  background:none;border:none;font-family:inherit;
  font-size:14px;font-weight:600;color:var(--soft);
  cursor:pointer;text-align:left;
  -webkit-tap-highlight-color:transparent;
  transition:background .15s,color .15s
}
.mdr-item svg{width:20px;height:20px;stroke-width:1.75;flex-shrink:0}
.mdr-item.active{background:var(--nav-act-bg);color:var(--nav-act)}
.mdr-item:active{background:var(--border-inner)}
.mdr-footer{
  border-top:1px solid var(--border);
  padding:16px 14px calc(16px + env(safe-area-inset-bottom,0px));
  display:flex;flex-direction:column;gap:12px
}
.mdr-user{display:flex;align-items:center;gap:10px}
.mdr-user-av{
  width:38px;height:38px;border-radius:50%;flex-shrink:0;
  background:var(--primary-dim);color:var(--primary);
  font-size:14px;font-weight:800;
  display:flex;align-items:center;justify-content:center;overflow:hidden
}
.mdr-user-av img{width:100%;height:100%;object-fit:cover}
.mdr-user-info{min-width:0}
.mdr-user-name{font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mdr-user-email{font-size:11px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mdr-logout{
  display:flex;align-items:center;gap:8px;
  padding:10px 14px;border-radius:12px;
  background:rgba(239,68,68,.07);color:#DC2626;
  font-size:13px;font-weight:600;text-decoration:none;
  transition:background .15s
}
.mdr-logout svg{width:16px;height:16px;stroke:#DC2626;stroke-width:2}

/* ── DESKTOP ≥ 800px ─────────────────────────────────────────────────── */
@media(min-width:800px){
  .mobile-hdr{display:none}
  .bottom-nav{display:none}
  .mobile-drawer{display:none}

  /* SIDEBAR */
  .icon-rail{
    display:flex;flex-direction:column;
    position:fixed;top:0;left:0;bottom:0;width:var(--rail-w);
    background:var(--rail);border-right:1px solid var(--border);
    z-index:300;padding:0;
    box-shadow:2px 0 24px rgba(15,23,42,.05);
  }
  /* Brand */
  .ir-brand{
    padding:0;border-bottom:1px solid var(--border);
    display:block;overflow:hidden
  }
  .ir-brand-img{
    display:block;width:100%;height:auto;
    max-height:72px;object-fit:cover
  }
  /* Nav list */
  .ir-nav{
    display:flex;flex-direction:column;gap:4px;padding:12px 10px;flex:1
  }
  .ir-btn{
    flex:1;max-height:60px;width:100%;padding:0 14px;border-radius:14px;border:none;cursor:pointer;
    background:none;display:flex;flex-direction:row;align-items:center;gap:12px;
    color:var(--rail-icon);transition:background .18s,color .18s,transform .15s;
    -webkit-tap-highlight-color:transparent;text-align:left
  }
  .ir-btn svg{width:19px;height:19px;stroke-width:1.9;flex-shrink:0;transition:stroke .18s,transform .15s}
  .ir-lbl{font-size:13.5px;font-weight:600;letter-spacing:-.02em;color:inherit}
  .ir-btn:hover:not(.active){background:var(--nav-act-bg);color:var(--nav-act);transform:translateX(2px)}
  .ir-btn:hover:not(.active) svg{stroke:var(--nav-act)}
  .ir-btn.active{background:var(--nav-act-bg);color:var(--nav-act)}
  .ir-btn.active svg{stroke:var(--nav-act)}
  .ir-btn.active .ir-lbl{font-weight:700}
  .ir-btn:active{transform:scale(.97)}

  .portal-main{display:contents}

  /* PROFILE PANEL — hidden, content goes right after sidebar */
  .profile-rail{display:none}

  /* Profile top section */
  .pr-top{
    padding:28px 22px 20px;
    border-bottom:1px solid var(--border-inner)
  }
  .pr-back{display:none}
  .pr-avatar{
    width:70px;height:70px;border-radius:18px;margin-bottom:14px;
    background:linear-gradient(135deg,var(--primary),#93C5FD);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;font-weight:800;color:#fff;user-select:none;letter-spacing:-.03em;
    box-shadow:none
  }
  .pr-name{font-size:16px;font-weight:700;color:var(--text);letter-spacing:-.04em;margin-bottom:2px}
  .pr-role{font-size:12px;color:var(--soft);margin-bottom:12px;line-height:1.4}
  .pr-rating{
    display:flex;align-items:center;gap:5px;margin-top:4px;margin-bottom:10px;
    font-size:12.5px;color:var(--amber);font-weight:600
  }
  .pr-rating-count{font-size:11.5px;color:var(--soft);font-weight:400}
  .pr-online-row{display:flex;align-items:center;gap:8px;margin-bottom:16px}
  .pr-online-chip{
    display:inline-flex;align-items:center;gap:5px;
    font-size:10px;font-weight:700;color:var(--green);
    background:var(--green-dim);border:1px solid rgba(34,197,94,.2);
    border-radius:7px;padding:3px 9px
  }
  .pr-online-chip::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:blink 2.5s infinite}

  /* Stats */
  .pr-stats-row{
    display:grid;grid-template-columns:1fr 1px 1fr;
    background:var(--bg);border-radius:13px;margin-bottom:16px;
    border:1px solid var(--border);overflow:hidden
  }
  .pr-stat-item{padding:11px 12px;text-align:center}
  .pr-stat-val{font-size:20px;font-weight:800;color:var(--text);letter-spacing:-.04em;line-height:1}
  .pr-stat-lbl{font-size:9px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-top:3px}
  .pr-stat-div{background:var(--border)}

  .pr-actions{display:flex;gap:8px;flex-wrap:wrap}
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

  /* Availability */
  .pr-avail-section{padding:14px 22px;border-bottom:1px solid var(--border-inner)}
  .pr-avail-section-title{font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px}
  .pr-avail-pill{
    display:inline-flex;align-items:center;gap:6px;
    background:var(--green-dim);color:var(--green);
    border:1px solid rgba(34,197,94,.22);border-radius:10px;padding:8px 12px;
    font-size:12px;font-weight:700
  }
  .pr-avail-pill svg{width:12px;height:12px;stroke:var(--green);flex-shrink:0}
  .pr-avail-none{font-size:11.5px;color:var(--dim);background:var(--bg);border-radius:8px;padding:8px 11px;border:1px solid var(--border)}

  /* Info section */
  .pr-section{padding:16px 22px}
  .pr-section-title{font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px}
  .pr-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
  .pr-row:last-child{margin-bottom:0}
  .pr-row-icon{
    width:30px;height:30px;border-radius:9px;background:var(--bg);flex-shrink:0;
    display:flex;align-items:center;justify-content:center;margin-top:1px;
    border:1px solid var(--border)
  }
  .pr-row-icon svg{width:12px;height:12px;color:var(--soft)}
  .pr-row-body{flex:1;min-width:0}
  .pr-row-lbl{font-size:9px;font-weight:700;color:var(--dim);letter-spacing:.05em;margin-bottom:2px;text-transform:uppercase}
  .pr-row-val{font-size:12.5px;font-weight:500;color:var(--text);line-height:1.4;word-break:break-word}
  .pr-row-badge{
    display:inline-block;margin-top:3px;
    font-size:9px;font-weight:700;color:var(--green);
    background:var(--green-dim);border:1px solid rgba(34,197,94,.2);
    border-radius:5px;padding:1px 6px;letter-spacing:.04em
  }
  .pr-footer{padding:14px 22px 24px;margin-top:auto}
  .btn-wa{
    display:flex;align-items:center;justify-content:center;gap:8px;
    background:#25D366;color:#fff;font-family:inherit;font-size:13px;font-weight:700;
    border:none;border-radius:12px;padding:11px 16px;cursor:pointer;
    transition:opacity .15s;text-decoration:none;width:100%
  }
  .btn-wa:hover{opacity:.88}
  .btn-wa svg{width:15px;height:15px}

  /* CONTENT AREA */
  .content-wrap{
    position:fixed;
    top:0;left:var(--rail-w);right:0;bottom:0;
    overflow:hidden;background:var(--bg)
  }
  /* content-nav hidden on desktop — icon-rail handles navigation */
  .content-nav{display:none}

  .panel{
    position:absolute;
    top:0;left:0;right:0;bottom:0;
    overflow-y:auto;-webkit-overflow-scrolling:touch;
    opacity:0;pointer-events:none;
    transition:opacity .22s cubic-bezier(.4,0,.2,1),transform .22s cubic-bezier(.4,0,.2,1);
    transform:translateY(6px)
  }
  .panel.active{opacity:1;pointer-events:auto;transform:translateY(0)}
  .pscroll{padding:28px 28px 40px}

  /* HOME GRID */
  .home-grid{
    display:grid;
    grid-template-columns:1fr 300px;
    gap:24px;align-items:start
  }
  @media(max-width:1200px){.home-grid{grid-template-columns:1fr 280px}}
  @media(max-width:1000px){.home-grid{grid-template-columns:1fr}}
  .home-right{display:flex;flex-direction:column;gap:16px}

  /* SERVICE CARDS GRID */
  .svc-cards-grid{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
    gap:14px;margin-bottom:4px
  }
  .svc-card{
    background:var(--panel);border-radius:20px;border:1px solid var(--border);
    overflow:hidden;cursor:pointer;
    transition:border-color .22s,transform .18s
  }
  .svc-card:hover{border-color:var(--primary);transform:translateY(-2px)}
  .svc-card-top{
    height:110px;padding:14px 16px;
    display:flex;flex-direction:column;justify-content:space-between
  }
  .svc-card-ltr{
    font-size:40px;font-weight:800;line-height:1;
    opacity:.28;letter-spacing:-.05em;color:rgba(0,0,0,.8)
  }
  .svc-card-provs{display:flex;align-items:center}
  .svc-card-prov{
    width:26px;height:26px;border-radius:50%;
    border:2px solid rgba(255,255,255,.75);
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:700;color:#fff;margin-left:-7px;user-select:none
  }
  .svc-card-provs .svc-card-prov:first-child{margin-left:0}
  .svc-card-body{padding:12px 16px 14px}
  .svc-card-name{
    font-size:13.5px;font-weight:700;color:var(--text);
    letter-spacing:-.03em;margin-bottom:3px;line-height:1.35
  }
  .svc-card-meta{font-size:11.5px;color:var(--soft);margin-bottom:10px}
  .svc-card-foot{display:flex;align-items:center;justify-content:space-between;gap:6px}
  .svc-card-price{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}
  .svc-card-btn{
    font-size:10.5px;font-weight:700;color:#fff;border:none;
    border-radius:20px;padding:5px 12px;cursor:pointer;
    font-family:inherit;transition:opacity .15s;
    -webkit-tap-highlight-color:transparent;flex-shrink:0
  }
  .svc-card-btn:hover{opacity:.82}
}

/* ── SHARED COMPONENTS ───────────────────────────────────────────────── */

.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.sec-title{font-size:16px;font-weight:700;color:var(--text);letter-spacing:-.04em}
.sec-link{font-size:12.5px;font-weight:600;color:var(--primary);text-decoration:none;cursor:pointer;background:none;border:none;font-family:inherit;transition:opacity .15s}
.sec-link:hover{opacity:.7}

/* ── HOME TAB ─────────────────────────────────────────────────────────────── */
.home-welcome-msg{
  background:var(--bg);border:1px solid var(--border);border-radius:16px;
  padding:14px 18px;font-size:13.5px;color:var(--soft);line-height:1.6;margin-bottom:22px
}
.home-actions-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px}

/* ── PRODUCT LIST ─────────────────────────────────────────────────────────── */
.prd-list{display:flex;flex-direction:column;gap:8px}
.prd-card{
  background:var(--panel);border-radius:16px;border:1px solid var(--border);
  display:flex;overflow:hidden;
  transition:border-color .18s,transform .15s
}
.prd-card:hover{border-color:var(--primary);transform:translateY(-1px)}

.prd-accent{width:4px;flex-shrink:0}
.prd-body{padding:14px 18px;flex:1;display:flex;align-items:center;gap:14px}
.prd-info{flex:1;min-width:0}
.prd-name{font-size:14.5px;font-weight:600;color:var(--text);letter-spacing:-.02em}
.prd-desc{font-size:12px;color:var(--soft);margin-top:2px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.prd-price{font-size:14px;font-weight:700;color:var(--primary);white-space:nowrap;flex-shrink:0;font-variant-numeric:tabular-nums}

/* Inbox panel */
.inbox-card{background:var(--panel);border-radius:26px;border:1px solid var(--border);overflow:hidden}
.inbox-hdr{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border-inner)}
.inbox-hdr-title{font-size:14px;font-weight:700;color:var(--text);letter-spacing:-.03em}
.inbox-hdr-count{font-size:11px;font-weight:700;color:var(--primary);background:var(--primary-dim);border-radius:999px;padding:4px 12px}
.inbox-item{
  display:flex;align-items:flex-start;gap:14px;padding:16px 20px;
  border-bottom:1px solid var(--border-inner);transition:background .12s;cursor:default
}
.inbox-item:last-child{border-bottom:none}
.inbox-item:hover{background:var(--bg)}
.inbox-av{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;color:#fff;user-select:none;margin-top:1px
}
.inbox-body{flex:1;min-width:0}
.inbox-name-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
.inbox-name{font-size:13px;font-weight:600;color:var(--text)}
.inbox-date{font-size:10.5px;color:var(--dim)}
.inbox-stars{font-size:11.5px;color:var(--amber);letter-spacing:.5px;margin-bottom:3px}
.inbox-preview{font-size:12px;color:var(--soft);line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.inbox-empty{text-align:center;padding:28px 16px;color:var(--dim);font-size:13px}

/* ── PRODUCTS LIST ───────────────────────────────────────────────────── */
.prod-card-wrap{background:var(--panel);border-radius:var(--r);border:1px solid var(--border);overflow:hidden}
.prod-card-hdr{padding:14px 18px 10px;border-bottom:1px solid var(--border-inner)}
.prod-item{
  display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
  padding:11px 18px;border-bottom:1px solid var(--border-inner)
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
  background:var(--panel);border-radius:24px;border:1px solid var(--border);
  padding:24px;display:flex;flex-direction:column;gap:14px;
  min-height:220px;justify-content:space-between
}
.cot-icon-wrap{
  width:46px;height:46px;border-radius:14px;background:var(--primary-dim);
  display:flex;align-items:center;justify-content:center
}
.cot-icon-wrap svg{width:20px;height:20px;stroke:var(--primary);stroke-width:1.75}
.cot-lbl{font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
.cot-name{font-size:16px;font-weight:700;color:var(--text);letter-spacing:-.04em;margin-bottom:4px;line-height:1.3}
.cot-desc{font-size:12.5px;color:var(--soft);line-height:1.5}
.btn-primary{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:var(--primary);color:#fff;font-family:inherit;font-size:13.5px;font-weight:600;
  border:none;border-radius:16px;padding:12px 20px;cursor:pointer;
  transition:opacity .15s,transform .12s;text-decoration:none;letter-spacing:-.01em;
  -webkit-tap-highlight-color:transparent
}
.btn-primary:hover{background:#1D4ED8;box-shadow:0 4px 12px rgba(37,99,235,.35)}
.btn-primary:focus-visible{outline:3px solid rgba(37,99,235,.4);outline-offset:2px}
.btn-primary:active{transform:scale(.97);background:#1E40AF}
.btn-primary svg{width:15px;height:15px;stroke-width:2.2}

/* ── FULL RESERVAS VIEW ──────────────────────────────────────────────── */
.svc-list-full{display:flex;flex-direction:column;gap:8px}
.svc-row{
  display:flex;align-items:center;gap:14px;
  background:var(--panel);border:1px solid var(--border);border-radius:var(--r);
  padding:14px 18px;cursor:pointer;
  transition:border-color .18s,transform .15s;-webkit-tap-highlight-color:transparent
}
.svc-row:hover{border-color:var(--primary);transform:translateY(-1px)}
.svc-row:active{transform:scale(.99)}
.svc-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
.svc-body{flex:1;min-width:0}
.svc-name{font-size:14.5px;font-weight:600;color:var(--text);letter-spacing:-.03em;margin-bottom:2px}
.svc-meta{font-size:12px;color:var(--soft)}
.svc-price{font-size:14px;font-weight:700;color:var(--primary);white-space:nowrap;flex-shrink:0;font-variant-numeric:tabular-nums}
.svc-arr{color:var(--dim);flex-shrink:0;margin-left:4px}
.svc-arr svg{width:15px;height:15px;stroke-width:2.2}
.svc-empty{text-align:center;padding:40px 20px;color:var(--soft);font-size:14px;line-height:1.7;background:var(--panel);border-radius:var(--r);border:1px solid var(--border)}

/* ── RESERVAS DASHBOARD ──────────────────────────────────────────────── */
.rdash-hdr{
  display:flex;align-items:center;justify-content:space-between;margin-bottom:18px
}
.rdash-title{font-size:20px;font-weight:800;color:var(--text);letter-spacing:-.05em}
.rdash-sub{font-size:12px;color:var(--dim);font-weight:500;margin-top:2px}
.rdash-nav{display:flex;gap:6px}
.rdash-nav-btn{
  width:32px;height:32px;border-radius:10px;background:var(--panel);
  border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:background .15s;-webkit-tap-highlight-color:transparent
}
.rdash-nav-btn:hover{background:var(--primary-dim);border-color:var(--primary-glow)}
.rdash-nav-btn svg{width:14px;height:14px;stroke-width:2.2;stroke:var(--soft)}
.rdash-nav-btn:disabled{opacity:.3;cursor:default}

/* Stat cards */
.rdash-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}
.rstat-card{
  background:var(--panel);border:1px solid var(--border);border-radius:18px;
  padding:16px 12px;text-align:center;
  box-shadow:var(--shadow-s)
}
.rstat-icon{
  width:38px;height:38px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;margin:0 auto 10px
}
.rstat-icon svg{width:17px;height:17px}
.rstat-val{font-size:20px;font-weight:800;color:var(--text);letter-spacing:-.05em;line-height:1}
.rstat-lbl{font-size:10px;color:var(--dim);font-weight:500;margin-top:5px;line-height:1.3}

/* Day strip */
.rdash-strip-wrap{
  overflow-x:auto;margin:0 -20px;padding:0 20px 4px;
  scrollbar-width:none;-webkit-overflow-scrolling:touch
}
.rdash-strip-wrap::-webkit-scrollbar{display:none}
.day-strip{display:flex;gap:8px;padding-bottom:4px;width:max-content}
.day-card{
  display:flex;flex-direction:column;align-items:center;gap:4px;
  min-width:52px;padding:10px 6px 12px;border-radius:16px;cursor:default;
  background:#F3F4F6;border:1.5px solid transparent;
  transition:transform .15s,background .15s,box-shadow .15s;-webkit-tap-highlight-color:transparent;
  position:relative
}
.day-card.avail{cursor:pointer;background:rgba(22,163,74,.1);border-color:rgba(22,163,74,.25)}
.day-card.avail .day-wd,.day-card.avail .day-num{color:#166534}
.day-card.avail:hover{background:rgba(34,197,94,.28);transform:translateY(-2px)}
.day-card.avail:active{transform:scale(.97)}
.day-card.today{background:var(--nav-act);border-color:transparent}
.day-card.today .day-wd,.day-card.today .day-num{color:#fff}
.day-card.selected{background:var(--nav-act);border-color:transparent}
.day-card.selected .day-wd,.day-card.selected .day-num{color:#fff}
.day-card.past{opacity:.3;background:rgba(15,23,42,.03)}
.day-wd{font-size:9.5px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.05em}
.day-num{font-size:17px;font-weight:800;color:var(--text);letter-spacing:-.04em;line-height:1}
.day-dot{
  width:5px;height:5px;border-radius:50%;margin-top:2px;
  background:var(--green);opacity:0;transition:opacity .2s
}
.day-card.avail .day-dot{opacity:1}
.day-card.selected .day-dot{background:#fff}

/* Slots area */
.slots-area{
  background:var(--panel);border:1px solid var(--border);border-radius:20px;
  padding:16px 18px;margin:16px 0
}
.slots-date-lbl{font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px}
.slots-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.slot-chip{
  padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;
  background:#EEF4FF;color:var(--primary);border:1.5px solid rgba(37,99,235,.2);
  cursor:pointer;transition:background .18s,transform .15s,box-shadow .15s;
  -webkit-tap-highlight-color:transparent;font-family:inherit
}
.slot-chip:hover{background:var(--primary);color:#fff;transform:translateY(-2px);box-shadow:0 4px 12px rgba(37,99,235,.3)}
.slot-chip:active{transform:scale(.95)}
.slots-close{
  font-size:11.5px;color:var(--dim);background:none;border:none;cursor:pointer;
  font-family:inherit;padding:0
}

/* Service grid (2-col) */
.rdash-sec-hdr{margin:20px 0 12px}
.rdash-sec-title{font-size:15px;font-weight:700;color:var(--text);letter-spacing:-.04em}
.svc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.svc-grid-item{
  background:var(--panel);border:1px solid var(--border);border-radius:18px;
  padding:16px 14px;cursor:pointer;
  box-shadow:var(--shadow-s);
  transition:border-color .18s,transform .18s,box-shadow .18s;-webkit-tap-highlight-color:transparent;
  display:flex;flex-direction:column;gap:6px
}
.svc-grid-item:hover{border-color:var(--primary);transform:translateY(-3px);box-shadow:0 8px 24px rgba(15,23,42,.10)}
.svc-grid-item:active{transform:scale(.97);box-shadow:var(--shadow-s)}
.svc-grid-dot{width:10px;height:10px;border-radius:50%;margin-bottom:2px}
.svc-grid-name{font-size:13px;font-weight:700;color:var(--text);letter-spacing:-.03em;line-height:1.3}
.svc-grid-dur{font-size:11px;color:var(--dim)}
.svc-grid-price{font-size:14px;font-weight:800;color:var(--primary);margin-top:auto;padding-top:6px;font-variant-numeric:tabular-nums}

/* Loader */
.loader-row{display:flex;align-items:center;gap:10px;padding:32px 0;color:var(--dim);font-size:13.5px;justify-content:center}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── SLIDE PANELS ────────────────────────────────────────────────────── */
.slide-panel{
  position:fixed;top:0;right:0;bottom:0;
  width:min(100vw,460px);
  background:var(--panel);border-left:1px solid var(--border);
  z-index:600;transform:translateX(calc(100% + 2px));
  transition:transform .32s cubic-bezier(.22,1,.36,1);
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:none
}
.slide-panel.open{transform:translateX(0);box-shadow:-4px 0 40px rgba(15,23,42,.12)}
.slide-overlay{
  position:fixed;inset:0;background:rgba(15,20,50,.38);z-index:599;
  opacity:0;pointer-events:none;transition:opacity .25s;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)
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
  background:var(--bg);border:1.5px solid var(--border);border-radius:11px;
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

/* ── RATING STARS (global — overrides desktop-only rule above) ───────── */

/* ── REVIEWS TAB ─────────────────────────────────────────────────────── */
.rv-layout{
  display:flex;align-items:center;gap:20px;
  background:var(--panel);border-radius:var(--r);border:1px solid var(--border);
  padding:22px;margin-bottom:4px
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
  background:var(--panel);border:1px solid var(--border);border-radius:14px;
  padding:14px 18px;margin-bottom:10px
}
.rv-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.rv-card-stars{font-size:13px;letter-spacing:1px}
.rv-card-meta{font-size:11.5px}
.rv-name{font-weight:600;color:var(--text)}
.rv-date{color:var(--dim)}
.rv-comment{font-size:13.5px;color:var(--soft);line-height:1.5}

/* ── CALENDAR WIDGET ─────────────────────────────────────────────────── */
.cal-widget{
  background:var(--panel);border-radius:20px;border:1px solid var(--border);
  padding:20px;box-shadow:var(--shadow-s)
}
.cal-hdr{
  display:flex;align-items:center;justify-content:space-between;margin-bottom:14px
}
.cal-title{font-size:14px;font-weight:700;color:var(--text);letter-spacing:-.04em}
.cal-nav{display:flex;align-items:center;gap:4px}
.cal-nav-btn{
  width:30px;height:30px;border-radius:9px;background:var(--bg);
  border:1px solid var(--border);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s;-webkit-tap-highlight-color:transparent
}
.cal-nav-btn:hover{background:var(--primary-dim);border-color:rgba(37,99,235,.25)}
.cal-nav-btn:active{transform:scale(.92)}
.cal-nav-btn svg{width:13px;height:13px;stroke:var(--soft);stroke-width:2.2;stroke-linecap:round}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.cal-day-name{
  font-size:9px;font-weight:700;color:var(--dim);
  text-align:center;padding:4px 0 6px;letter-spacing:.06em;text-transform:uppercase
}
.cal-cell{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  border-radius:10px;font-size:12px;font-weight:500;color:var(--soft);
  transition:background .15s,transform .12s,color .15s;
  position:relative;cursor:default;transition:background .15s,transform .12s;
  background:rgba(15,23,42,.05)
}
.cal-cell.cal-empty{pointer-events:none;background:transparent}
.cal-cell.cal-past{color:#94A3B8;pointer-events:none;background:transparent}
.cal-cell.cal-today{background:#2563EB;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(37,99,235,.35)}
.cal-cell.cal-avail{
  cursor:pointer;font-weight:700;color:#fff;
  background:#16A34A;border:none;box-shadow:0 2px 6px rgba(22,163,74,.3)
}
.cal-cell.cal-avail:hover{background:#15803D;transform:scale(1.08);box-shadow:0 4px 10px rgba(22,163,74,.4)}
.cal-cell.cal-avail::after{
  content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.7)
}
.cal-cell.cal-taken{background:#CBD5E1;color:#64748B;font-weight:500}
.cal-cell.cal-taken::after{display:none}
.cal-legend{
  display:flex;align-items:center;gap:14px;margin-top:12px;padding-top:10px;
  border-top:1px solid var(--border-inner)
}
.cal-leg-item{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--soft)}
.cal-leg-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.cal-loading{text-align:center;padding:24px 0;color:var(--dim);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px}

/* ── BOOKING FLOW ────────────────────────────────────────────────────── */
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
  display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:13px;
  background:var(--panel);border:1px solid var(--border);margin-bottom:8px;
  cursor:pointer;transition:border-color .15s;-webkit-tap-highlight-color:transparent
}
.bk-svc-item:hover{border-color:var(--primary);background:var(--primary-dim)}
.bk-svc-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.bk-svc-info{flex:1}
.bk-svc-name{font-size:14px;font-weight:600;color:var(--text)}
.bk-svc-meta{font-size:11.5px;color:var(--soft);margin-top:1px}
.bk-svc-price{font-size:13px;font-weight:700;color:var(--primary)}
.bk-svc-arr svg{width:14px;height:14px;stroke:var(--dim)}
.bk-times-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
.bk-time-chip{
  padding:10px 4px;border-radius:11px;background:var(--panel);border:1.5px solid var(--border);
  font-size:13px;font-weight:600;color:var(--text);cursor:pointer;text-align:center;
  transition:border-color .15s,background .15s,color .15s;-webkit-tap-highlight-color:transparent
}
.bk-time-chip:hover,.bk-time-chip.sel{border-color:var(--primary);background:var(--primary-dim);color:var(--primary)}
.bk-summary-card{
  background:var(--primary-dim);border-radius:13px;padding:14px;margin-bottom:20px;
  border:1px solid var(--primary-glow)
}
.bk-summary-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--primary);font-weight:600;margin-bottom:4px}
.bk-summary-row:last-child{margin-bottom:0}
.bk-summary-row svg{width:13px;height:13px;stroke:var(--primary);flex-shrink:0}
.bk-inp-wrap{margin-bottom:12px}
.bk-inp-lbl{font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.bk-inp{
  width:100%;padding:10px 12px;border-radius:11px;
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

/* Mobile perfil view */
.mobile-profile{
  background:var(--panel);border-radius:24px;border:1px solid var(--border);
  padding:22px;margin-bottom:16px
}
.mob-av{
  width:66px;height:66px;border-radius:50%;margin-bottom:12px;
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
.mob-info-icon{width:30px;height:30px;border-radius:9px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mob-info-icon svg{width:12px;height:12px;color:var(--soft)}
.mob-info-lbl{font-size:10.5px;color:var(--dim);font-weight:600;letter-spacing:.03em;margin-bottom:1px}
.mob-info-val{font-size:13px;font-weight:500;color:var(--text)}
.mob-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px}
.btn-outline{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  background:var(--bg);color:var(--text);font-family:inherit;font-size:13px;font-weight:600;
  border:1.5px solid var(--border);border-radius:11px;padding:10px 16px;cursor:pointer;
  transition:background .15s,border-color .15s;text-decoration:none;
  -webkit-tap-highlight-color:transparent
}
.btn-outline:hover{background:var(--primary-dim);border-color:var(--primary-glow);color:var(--primary)}
.btn-outline svg{width:14px;height:14px;stroke-width:1.75}

/* ── PORTAL GATE ─────────────────────────────────────────────────────── */
.portal-gate{
  position:fixed;inset:0;z-index:9999;
  background:#EEF2F7;
  display:flex;align-items:center;justify-content:center;
  transition:opacity .35s ease;
}
.gate-card{
  background:#fff;border-radius:24px;
  border:1px solid var(--border);
  padding:40px 36px;
  display:flex;flex-direction:column;align-items:center;gap:10px;
  width:min(88vw,360px);text-align:center;
  box-shadow:0 20px 60px rgba(15,23,42,.14),0 4px 16px rgba(15,23,42,.06)
}
.gate-av{
  width:64px;height:64px;border-radius:18px;
  background:var(--primary);color:#fff;
  font-size:22px;font-weight:800;letter-spacing:-.03em;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:6px;
}
.gate-biz{font-size:18px;font-weight:800;color:var(--text);letter-spacing:-.04em}
.gate-sub{font-size:13px;color:var(--soft);margin-bottom:8px}
.gate-google-wrap{margin-top:4px}

/* ── SIDEBAR USER CHIP (bottom) ──────────────────────────────────────── */
.ir-user-chip{
  display:flex;align-items:center;gap:10px;
  padding:14px 14px 18px;border-top:1px solid var(--border);
  margin-top:auto;
}
.ir-user-av{display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ir-user-info{flex:1;min-width:0}
.ir-user-name{
  font-size:12.5px;font-weight:700;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis
}
.ir-user-email{
  font-size:10.5px;color:var(--dim);font-weight:400;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px
}
.ir-user-out{
  display:flex;align-items:center;justify-content:center;
  width:28px;height:28px;border-radius:8px;flex-shrink:0;
  color:var(--dim);background:none;border:none;cursor:pointer;
  transition:background .15s,color .15s;-webkit-tap-highlight-color:transparent;
  text-decoration:none;
}
.ir-user-out svg{width:16px;height:16px;stroke-width:2}
.ir-user-out:hover{background:var(--bg);color:var(--primary)}

/* ── MOBILE HEADER USER ───────────────────────────────────────────────── */
.mhdr-user{
  margin-left:auto;display:flex;align-items:center;gap:8px;
}
.mhdr-user-av{display:flex;align-items:center;justify-content:center}
.mhdr-user-out{
  font-size:11px;color:var(--soft);background:none;
  border:1px solid var(--border);border-radius:8px;
  padding:3px 9px;cursor:pointer;font-family:inherit;font-weight:500;
  -webkit-tap-highlight-color:transparent;
}

/* ── SIDEBAR PROMO CARD ──────────────────────────────────────────────── */
.ir-promo-card{
  margin:auto 12px 12px;border-radius:16px;
  background:#2B62D9;overflow:hidden;
  display:flex;flex-direction:column;flex-shrink:0
}
.ir-promo-art{height:48px;background:#1A4FB0}
.ir-promo-body{padding:12px 14px 14px}
.ir-promo-title{
  font-size:12px;font-weight:800;color:#fff;
  line-height:1.35;margin-bottom:10px
}
.ir-promo-btn{
  display:block;width:100%;padding:7px 12px;border-radius:10px;
  border:1.5px solid rgba(255,255,255,.45);
  background:transparent;color:#fff;
  font-size:11px;font-weight:700;font-family:inherit;
  cursor:pointer;transition:background .15s;text-align:center
}
.ir-promo-btn:hover{background:rgba(255,255,255,.12)}

/* ════════════════════════════════════════════════════════════════════════
   HOME DASHBOARD
   ════════════════════════════════════════════════════════════════════════ */

/* ── TOP BAR ─────────────────────────────────────────────────────────── */
.hm-topbar{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:20px 20px 4px;flex-shrink:0
}
.hm-topbar-left{}
.hm-topbar-greet{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.05em;line-height:1.15}
.hm-topbar-sub{font-size:12px;color:var(--soft);margin-top:3px;font-weight:500}
.hm-topbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.hm-topbar-search{
  display:none;align-items:center;gap:8px;
  background:#F4F7FC;border-radius:12px;padding:8px 14px;
  font-size:12.5px;color:var(--dim);cursor:default;white-space:nowrap
}
.hm-topbar-search svg{width:14px;height:14px;flex-shrink:0;stroke:var(--dim)}
.hm-topbar-icon-btn{
  width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;
  background:#F4F7FC;display:flex;align-items:center;justify-content:center;
  color:var(--soft);transition:background .15s;flex-shrink:0
}
.hm-topbar-icon-btn svg{width:17px;height:17px;stroke-width:1.8}
.hm-topbar-icon-btn:hover{background:var(--primary-dim);color:var(--nav-act)}
.hm-nueva-reserva{
  display:flex;align-items:center;gap:7px;
  padding:9px 16px;border-radius:12px;border:none;cursor:pointer;
  background:var(--nav-act);color:#fff;
  font-size:13px;font-weight:700;font-family:inherit;
  white-space:nowrap;transition:opacity .15s
}
.hm-nueva-reserva:hover{opacity:.88}
.hm-nueva-reserva svg{width:14px;height:14px;stroke-width:2;stroke:#fff;flex-shrink:0}

/* ── STATS ────────────────────────────────────────────────────────────── */
.hm-stats{
  display:grid;grid-template-columns:repeat(2,1fr);gap:10px;
  padding:10px 16px 8px;flex-shrink:0
}
.hm-stat{
  background:#fff;border-radius:18px;
  padding:14px 14px 18px;
  display:flex;align-items:center;gap:12px;
  box-shadow:var(--shadow-s);
  position:relative;overflow:hidden
}
.hm-stat::after{
  content:'';position:absolute;bottom:0;left:0;right:0;
  height:3px;border-radius:0 0 18px 18px;
  background:var(--sc,#3B76ED)
}
.hm-stat-icon{
  width:44px;height:44px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center
}
.hm-stat-icon svg{width:20px;height:20px;stroke-width:2}
.hm-stat-body{flex:1;min-width:0}
.hm-stat-val{font-size:24px;font-weight:800;color:var(--text);letter-spacing:-.05em;line-height:1;font-variant-numeric:tabular-nums}
.hm-stat-lbl{font-size:11px;color:var(--soft);font-weight:500;margin-top:3px;line-height:1.2}
.hm-stat-spark{flex-shrink:0;opacity:.85}

/* ── LAYOUT ───────────────────────────────────────────────────────────── */
.hm-panel{display:flex;flex-direction:column;overflow-y:auto;background:#fff;scrollbar-width:none}
.hm-panel::-webkit-scrollbar{display:none}
.hm-main{display:flex;flex-direction:column;gap:14px;padding:20px 16px 36px}
.hm-left-col{display:flex;flex-direction:column;gap:14px}
.hm-right-col{display:flex;flex-direction:column;gap:14px}
.hm-welcome-desk{display:none}

/* ── TITLE BLOCK ──────────────────────────────────────────────────────── */
.hm-title-block{
  flex-shrink:0;
  padding:16px 18px 14px
}
.hm-card-brand{
  border:1px solid #C8D9EC
}
.hm-card-brand .hm-title-name{color:var(--text)}
.hm-title-name{
  font-size:22px;font-weight:900;
  letter-spacing:-.05em;line-height:1.1;margin-bottom:5px
}
.hm-title-sub{
  font-size:13px;color:var(--dim);line-height:1.5;margin-bottom:10px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden
}
.hm-title-stats{
  display:flex;align-items:center;gap:6px;
  font-size:12px;font-weight:600;color:var(--soft);
  padding-top:8px;border-top:1px solid #C8D9EC
}
.hm-title-stat{display:flex;align-items:center;gap:3px}
.hm-title-sep{color:var(--dim)}

/* ── CARDS ────────────────────────────────────────────────────────────── */
.hm-card{
  background:#fff;border-radius:20px;
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:var(--shadow-s);border:1px solid var(--border);
  transition:box-shadow .22s,transform .22s
}
.hm-card:hover{box-shadow:0 8px 28px rgba(15,23,42,.10),0 0 0 1px rgba(15,23,42,.04);transform:translateY(-1px)}
.hm-card-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;flex-shrink:0;
  border-bottom:1px solid var(--border-inner)
}
.hm-card-title{font-size:13px;font-weight:700;color:var(--text);letter-spacing:-.01em}
.hm-card-title-row{display:flex;align-items:center;gap:7px}
.hm-card-title-icon{display:flex;align-items:center}
.hm-card-title-icon svg{width:15px;height:15px;stroke-width:2}

/* ── CARD TONES — gris celeste claro / oscuro ────────────────────────── */
/* Tono A — más claro */
.hm-card-cal,
.hm-card-svc{
  background:#EEF4FB;border-color:#C8D9EC
}
/* Tono B — ligeramente más oscuro */
.hm-card-reviews,
.hm-card-avail,
.hm-card-brand{
  background:#E2EBF5;border-color:#C8D9EC
}
/* Dividers internos — mismo azul-gris */
.hm-card-cal .hm-card-hdr,
.hm-card-svc .hm-card-hdr,
.hm-card-reviews .hm-card-hdr,
.hm-card-avail .hm-card-hdr{border-bottom-color:#C8D9EC}
/* Colores de texto — neutros */
.hm-card-cal .hm-card-title,
.hm-card-svc .hm-card-title,
.hm-card-reviews .hm-card-title,
.hm-card-avail .hm-card-title{color:var(--text)}
/* Íconos — color primario solo en interactivos */
.hm-card-cal .hm-card-title-icon svg,
.hm-card-svc .hm-card-title-icon svg,
.hm-card-reviews .hm-card-title-icon svg,
.hm-card-avail .hm-card-title-icon svg{stroke:var(--soft)}
/* Separadores de filas */
.hm-svc-row{border-bottom-color:#C8D9EC}
.hm-svc-row:hover{background:rgba(30,64,120,.06)}
.hm-svc-cot-row{border-top-color:#C8D9EC}
.hm-avail-row{border-bottom-color:#C8D9EC}
.hm-avail-row:hover{background:rgba(30,64,120,.06)}
/* Chips de horario */
.hm-avail-chip{background:rgba(30,64,120,.09);color:var(--primary);border-color:rgba(30,64,120,.2)}
.hm-avail-chip:hover{background:var(--primary);color:#fff;border-color:var(--primary);box-shadow:0 3px 8px rgba(30,64,120,.25)}
.hm-avail-more{color:var(--primary)}
/* Barra de reseñas */
.rv-bar-fill{background:var(--primary)}

/* ── SERVICIOS LISTA (home) ───────────────────────────────────────────── */
.hm-svc-list-home{overflow-y:auto}
.hm-svc-row{
  display:flex;align-items:center;gap:11px;
  padding:10px 16px;cursor:pointer;
  border-bottom:1px solid rgba(124,58,237,.18);
  transition:background .12s;-webkit-tap-highlight-color:transparent
}
.hm-svc-row:last-child{border-bottom:none}
.hm-svc-row:hover{background:rgba(124,58,237,.07)}
.hm-svc-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.hm-svc-row-body{flex:1;min-width:0}
.hm-svc-row-name{font-size:13px;font-weight:700;color:var(--text);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hm-svc-row-cat{font-size:11px;color:var(--dim);margin-top:2px}
.hm-svc-row-right{display:flex;align-items:center;gap:5px;flex-shrink:0}
.hm-svc-row-price{font-size:12.5px;font-weight:700;color:var(--text);white-space:nowrap;font-variant-numeric:tabular-nums}
.hm-svc-row-arr{width:14px;height:14px;stroke:var(--dim);flex-shrink:0}
.hm-svc-cot-row{padding:10px 14px;border-top:1px solid rgba(124,58,237,.18);flex-shrink:0}
.hm-svc-cot-btn{
  display:flex;align-items:center;justify-content:center;gap:7px;
  width:100%;padding:9px 14px;border-radius:12px;cursor:pointer;
  background:#EEF4FF;color:var(--primary);
  font-size:12.5px;font-weight:600;font-family:inherit;
  border:1.5px solid rgba(37,99,235,.18);transition:background .18s,box-shadow .18s,transform .15s
}
.hm-svc-cot-btn svg{width:13px;height:13px;stroke-width:2;stroke:currentColor;flex-shrink:0}
.hm-svc-cot-btn:hover{background:var(--primary);color:#fff;box-shadow:0 4px 12px rgba(37,99,235,.3);transform:translateY(-1px)}
.hm-svc-cot-btn:active{transform:scale(.97)}

/* ── EMPTY STATE ROW ─────────────────────────────────────────────────── */
.hm-empty-row{
  display:flex;align-items:center;gap:12px;
  padding:14px 16px
}
.hm-empty-icon{
  width:40px;height:40px;border-radius:12px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center
}
.hm-empty-icon svg{width:18px;height:18px;stroke-width:1.8}
.hm-empty-body{flex:1;min-width:0}
.hm-empty-title{font-size:13px;font-weight:600;color:var(--text)}
.hm-empty-sub{font-size:11.5px;color:var(--dim);margin-top:2px;line-height:1.4}
.hm-empty-action{
  flex-shrink:0;padding:7px 13px;border-radius:10px;border:none;cursor:pointer;
  background:#EEF4FF;color:var(--primary);
  font-size:11.5px;font-weight:600;font-family:inherit;white-space:nowrap;
  transition:background .15s,transform .12s
}
.hm-empty-action:hover{background:var(--primary);color:#fff;transform:translateY(-1px)}

/* ── DISPONIBILIDAD HOME ──────────────────────────────────────────────── */
.hm-upcoming-list{}
.hm-avail-row{
  display:flex;align-items:center;gap:10px;
  padding:9px 16px;border-bottom:1px solid rgba(5,150,105,.2);
  cursor:pointer;transition:background .15s;
  -webkit-tap-highlight-color:transparent
}
.hm-avail-row:last-child{border-bottom:none}
.hm-avail-row:hover{background:rgba(5,150,105,.07)}
.hm-avail-date{
  font-size:12px;font-weight:700;color:var(--text);
  width:76px;flex-shrink:0;letter-spacing:-.01em
}
.hm-avail-chips{display:flex;flex-wrap:wrap;gap:5px;flex:1;min-width:0}
.hm-avail-chip{
  padding:4px 10px;border-radius:8px;
  background:#EEF4FF;color:var(--primary);
  font-size:11.5px;font-weight:600;
  border:1px solid rgba(37,99,235,.18);
  cursor:pointer;font-family:inherit;
  transition:background .15s,transform .1s,box-shadow .15s;
  -webkit-tap-highlight-color:transparent
}
.hm-avail-chip:hover{background:var(--primary);color:#fff;transform:translateY(-1px);box-shadow:0 3px 8px rgba(37,99,235,.3)}
.hm-avail-chip:active{transform:scale(.94)}
.hm-avail-more{
  font-size:11px;color:var(--dim);padding:4px 6px;
  font-weight:500;white-space:nowrap;flex-shrink:0
}
.hm-upc-row{
  display:flex;align-items:center;gap:10px;
  padding:10px 16px;border-bottom:1px solid var(--border-inner);
  cursor:pointer;transition:background .12s
}
.hm-upc-row:last-child{border-bottom:none}
.hm-upc-row:hover{background:#EEF4FF}
.hm-upc-av{
  width:34px;height:34px;border-radius:50%;flex-shrink:0;
  background:var(--primary-dim);color:var(--nav-act);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;letter-spacing:-.02em
}
.hm-upc-body{flex:1;min-width:0}
.hm-upc-name{font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hm-upc-date{font-size:11px;color:var(--dim);margin-top:2px}
.hm-upc-badge{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;flex-shrink:0;white-space:nowrap}
.hm-upc-badge.conf{background:rgba(34,197,94,.12);color:#059669}
.hm-upc-badge.pend{background:rgba(245,158,11,.12);color:#D97706}

/* ── OPINIONES ────────────────────────────────────────────────────────── */
.hm-reviews-panel{
  display:flex;align-items:center;gap:12px;
  padding:14px 16px;flex:1;min-height:0;overflow:hidden
}
.hm-reviews-left{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
.hm-reviews-avg{font-size:34px;font-weight:800;color:var(--text);letter-spacing:-.06em;line-height:1}
.hm-reviews-stars{font-size:14px;letter-spacing:1px;margin-top:2px}
.hm-reviews-count{font-size:11px;color:var(--dim);margin-top:3px}
.hm-reviews-chat-icon{flex-shrink:0}
.hm-reviews-chat-icon svg{width:28px;height:28px;stroke-width:1.6}
.hm-reviews-bars{flex:1;display:flex;flex-direction:column;gap:5px;min-width:0}
.rv-bar-row{display:flex;align-items:center;gap:7px}
.rv-bar-star{font-size:10.5px;color:var(--dim);width:18px;flex-shrink:0;text-align:right}
.rv-bar-track{flex:1;height:6px;border-radius:3px;background:#F0F4F8;overflow:hidden}
.rv-bar-fill{height:100%;border-radius:3px;background:#F59E0B;transition:width .4s ease}
.rv-bar-count{font-size:10.5px;color:var(--dim);width:20px;flex-shrink:0;font-variant-numeric:tabular-nums}

/* ── CALENDAR TOOLTIP ────────────────────────────────────────────────── */
.cal-tip{
  position:fixed;z-index:9900;
  background:#fff;border:1px solid var(--border);
  border-radius:18px;
  box-shadow:0 16px 48px rgba(15,23,42,.18),0 4px 12px rgba(15,23,42,.08);
  width:230px;pointer-events:auto;
  opacity:0;transform:scale(.93) translateY(-6px);
  transition:opacity .18s cubic-bezier(.34,1.56,.64,1),transform .18s cubic-bezier(.34,1.56,.64,1);
  overflow:hidden
}
.cal-tip.ct-visible{opacity:1;transform:scale(1) translateY(0)}
.cal-tip-date{
  font-size:12.5px;font-weight:800;color:var(--text);
  padding:12px 15px 9px;letter-spacing:-.02em;
  display:flex;align-items:center;gap:7px
}
.cal-tip-date-badge{
  font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;
  background:#EEF4FF;color:var(--primary);letter-spacing:.02em
}
.cal-tip-divider{height:1px;background:var(--border-inner)}
.cal-tip-section{
  font-size:9.5px;font-weight:700;color:var(--dim);
  text-transform:uppercase;letter-spacing:.08em;padding:8px 15px 4px
}
.cal-tip-slots{display:flex;flex-wrap:wrap;gap:4px;padding:0 13px 10px}
.cal-tip-slot{
  padding:3px 9px;border-radius:7px;
  background:#EEF4FF;color:var(--primary);
  font-size:11px;font-weight:700;cursor:pointer;
  transition:background .15s,color .15s
}
.cal-tip-slot:hover{background:var(--primary);color:#fff}
.cal-tip-more{
  padding:3px 9px;border-radius:7px;
  background:var(--border-inner);color:var(--dim);
  font-size:11px;font-weight:600
}
.cal-tip-svcs,.cal-tip-people{padding:0 15px 10px;display:flex;flex-direction:column;gap:3px}
.cal-tip-svc-item,.cal-tip-person{
  font-size:11.5px;color:var(--soft);
  display:flex;align-items:center;gap:6px
}
.cal-tip-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.cal-tip-empty{font-size:12px;color:var(--dim);padding:8px 15px 12px;font-style:italic}
.cal-tip-avatar{
  width:20px;height:20px;border-radius:50%;
  background:var(--primary-dim);color:var(--primary);
  font-size:8.5px;font-weight:800;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;overflow:hidden
}
.cal-tip-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.cal-tip-btn{
  display:block;width:calc(100% - 24px);margin:2px 12px 12px;
  padding:9px;border:none;border-radius:11px;
  background:var(--primary);color:#fff;font-size:12.5px;font-weight:700;
  cursor:pointer;text-align:center;transition:background .15s
}
.cal-tip-btn:hover{background:#1D4ED8}

/* ── CTA AZUL ─────────────────────────────────────────────────────────── */
.hm-cta-card{
  border-radius:18px;overflow:hidden;
  box-shadow:0 6px 24px rgba(43,98,217,.28);
  flex-shrink:0;position:relative;
  background:url('/assets/cardbottom.png') center/cover no-repeat
}
.hm-cta-card::before{
  content:'';position:absolute;inset:0;
  background:rgba(30,70,180,.72);border-radius:18px
}
.hm-cta-body{position:relative;z-index:1;flex:1;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.hm-cta-title{font-size:14px;font-weight:800;color:#fff;line-height:1.35;letter-spacing:-.02em;flex:1}
.hm-cta-btn{
  display:inline-flex;align-items:center;gap:7px;flex-shrink:0;
  padding:8px 16px;border-radius:10px;
  border:1.5px solid rgba(255,255,255,.5);
  background:transparent;color:#fff;
  font-size:12px;font-weight:700;font-family:inherit;
  cursor:pointer;transition:background .15s;white-space:nowrap
}
.hm-cta-btn:hover{background:rgba(255,255,255,.12)}

/* ── CALENDAR WIDGET INSIDE HOME ──────────────────────────────────────── */
.hm-cal-inner{
  flex:1;min-height:0;
  background:transparent!important;border:none!important;border-radius:0!important;
  box-shadow:none!important;padding:10px 14px!important;margin:0!important;
  display:flex!important;flex-direction:column!important
}
.hm-cal-inner .cal-hdr{flex-shrink:0;margin-bottom:6px!important}
.hm-cal-inner .cal-grid{flex:1;min-height:0;align-content:stretch!important;grid-auto-rows:1fr!important}
.hm-cal-inner .cal-cell{
  aspect-ratio:unset!important;height:auto!important;min-height:28px;
  font-size:12px!important;border-radius:9px!important
}
.hm-cal-inner .cal-cell.cal-avail::after{content:none!important}
.hm-cal-inner .cal-cell.cal-taken::after{content:none!important}
.hm-cal-inner .cal-day-name{padding:2px 0 5px!important;font-size:8.5px!important}
.hm-cal-inner .cal-legend{display:none!important}

/* ── DAY DETAIL PANEL ────────────────────────────────────────────────── */
.ddp-section{padding:16px 20px 4px;border-bottom:1px solid var(--border-inner)}
.ddp-section:last-child{border-bottom:none}
.ddp-section-lbl{font-size:10.5px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.ddp-slots{display:flex;flex-wrap:wrap;gap:8px}
.ddp-slot{
  padding:10px 18px;border-radius:12px;border:none;font-family:inherit;
  background:linear-gradient(135deg,#EEF4FF,#E0EAFF);
  border:1.5px solid rgba(37,99,235,.18);
  color:var(--primary);font-size:16px;font-weight:800;
  cursor:pointer;letter-spacing:-.02em;
  transition:all .2s cubic-bezier(.34,1.56,.64,1)
}
.ddp-slot:hover,.ddp-slot:active{
  background:var(--primary);color:#fff;
  border-color:var(--primary);transform:scale(1.04);
  box-shadow:0 6px 18px rgba(37,99,235,.35)
}
.ddp-empty-note{font-size:13px;color:var(--dim);margin:0;padding-bottom:8px}
.ddp-svc-list{display:flex;flex-direction:column;gap:8px;padding-bottom:6px}
.ddp-svc-row{display:flex;align-items:center;gap:10px}
.ddp-svc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.ddp-svc-name{font-size:13.5px;color:var(--text);font-weight:500;flex:1}
.ddp-svc-price{font-size:13px;font-weight:700;color:var(--primary)}
.ddp-people{display:flex;flex-direction:column;gap:10px;padding-bottom:6px}
.ddp-person{display:flex;align-items:center;gap:12px}
.ddp-avatar{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  background:var(--primary-dim);color:var(--primary);
  font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;
  overflow:hidden;border:2px solid rgba(37,99,235,.12)
}
.ddp-avatar img{width:100%;height:100%;object-fit:cover}
.ddp-person-name{font-size:14px;font-weight:600;color:var(--text)}
.ddp-cta{padding:16px 20px 20px}
.ddp-book-btn{width:100%;padding:14px;font-size:15px;font-weight:800;letter-spacing:-.02em;border-radius:14px}

/* ── SERVICE DETAIL PANEL ────────────────────────────────────────────── */
.sdp-hero{
  padding:20px 20px 16px;
  border-bottom:1px solid var(--border-inner)
}
.sdp-hero-name{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.04em;margin-bottom:10px}
.sdp-hero-badges{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.sdp-badge{padding:4px 12px;border-radius:99px;font-size:11.5px;font-weight:700}
.sdp-badge-cat{background:#EDE9FE;color:#6D28D9}
.sdp-badge-dur{background:#ECFDF5;color:#047857}
.sdp-hero-price{font-size:30px;font-weight:800;color:var(--primary);letter-spacing:-.05em}
.sdp-desc{font-size:13.5px;color:var(--soft);line-height:1.6;margin:0;padding-bottom:6px}

/* keepcompat */
.hm-card-foot{padding:0 16px 14px;flex-shrink:0}
.hm-foot-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:9px;border-radius:11px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;border:1px solid var(--border);background:var(--bg);color:var(--soft);transition:background .15s,color .15s}
.reviews-list{flex:1;min-height:0;overflow-y:auto}

/* ── DESKTOP ──────────────────────────────────────────────────────────── */
@media(min-width:800px){
  .hm-panel{
    display:grid!important;overflow:hidden!important;
    grid-template-rows:1fr;
    padding:0;gap:0
  }
  .hm-welcome-desk{display:none}
  .hm-card-brand{padding:20px 22px 18px}
  .hm-card-brand .hm-title-name{font-size:30px}
  .hm-main{
    flex-direction:row;
    padding:24px 28px 24px 28px;
    gap:16px;overflow:hidden;min-height:0
  }
  /* izquierda angosta: servicios + reviews + cta */
  .hm-left-col{
    flex:8;display:flex;flex-direction:column;
    gap:12px;overflow-y:auto;min-height:0
  }
  /* derecha ancha: calendario llena altura */
  .hm-right-col{
    flex:12;display:flex;flex-direction:column;
    gap:12px;overflow:hidden;min-height:0
  }
  .hm-card-cal{
    flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden
  }
  .hm-card-cal .hm-cal-inner{flex:1;min-height:0;overflow:hidden}
  /* services: crece para llenar espacio, lista scrolleable adentro */
  .hm-card-svc{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}
  .hm-card-svc .hm-svc-list-home{flex:1;min-height:0;overflow-y:auto}
  /* reviews y cta: altura natural abajo */
  .hm-card-reviews{flex:none}
  .hm-reviews-panel{overflow:visible}
}
`;
}
