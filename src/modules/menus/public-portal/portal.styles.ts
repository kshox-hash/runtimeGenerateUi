export function portalStyles(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0b0f;
  --s1:#111318;
  --s2:#191c24;
  --s3:#20242f;
  --border:rgba(255,255,255,.065);
  --primary:#5b9cf6;
  --primary-dim:rgba(91,156,246,.12);
  --primary-glow:rgba(91,156,246,.2);
  --accent:#a78bfa;
  --text:#e2e4ea;
  --muted:#565e75;
  --muted2:#8891a8;
  --green:#34d399;
  --hdr:56px;
  --r:16px;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}

/* HEADER */
.hdr{position:fixed;top:0;left:0;right:0;height:var(--hdr);background:rgba(10,11,15,.88);border-bottom:1px solid var(--border);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);display:flex;align-items:center;gap:11px;padding:0 16px;z-index:200}
.hdr-av{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
.hdr-name{font-size:15px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.012em}
.hdr-badge{font-size:10.5px;font-weight:500;background:rgba(52,211,153,.1);color:var(--green);border:1px solid rgba(52,211,153,.2);border-radius:20px;padding:3px 9px;display:flex;align-items:center;gap:5px;flex-shrink:0}
.hdr-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:bpulse 2.5s infinite}
@keyframes bpulse{0%,100%{opacity:1}50%{opacity:.3}}

/* LAYOUT */
.main{position:fixed;top:var(--hdr);bottom:0;left:0;right:0;overflow:hidden}
.panel{position:absolute;inset:0;display:none;flex-direction:column;overflow:hidden}
.panel.active{display:flex}
.panel-scroll{flex:1;overflow-y:auto;padding:20px 16px 16px;-webkit-overflow-scrolling:touch}

/* BOTÓN VOLVER AL CHAT */
.btn-back-chat{display:none;position:fixed;bottom:calc(20px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);align-items:center;gap:6px;background:rgba(17,19,24,.92);border:1px solid var(--border);border-radius:24px;padding:10px 20px 10px 14px;font-size:13.5px;font-weight:600;color:var(--text);cursor:pointer;font-family:inherit;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 4px 24px rgba(0,0,0,.4);z-index:300;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:background .15s,transform .12s}
.btn-back-chat svg{width:17px;height:17px;flex-shrink:0;stroke:var(--primary)}
.btn-back-chat.visible{display:flex}
.btn-back-chat:active{transform:translateX(-50%) scale(.95)}

/* CHAT — messages */
.chat-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 14px 10px;display:flex;flex-direction:column;gap:0;background:radial-gradient(ellipse at 8% 4%,rgba(91,156,246,.05) 0%,transparent 55%),radial-gradient(ellipse at 92% 96%,rgba(167,139,250,.04) 0%,transparent 55%),var(--bg)}
.user-row{display:flex;justify-content:flex-end;margin:4px 0 16px;animation:msgIn .2s ease-out both}
.user-pill{max-width:78%;background:linear-gradient(135deg,rgba(91,156,246,.22),rgba(91,156,246,.1));border:1px solid rgba(91,156,246,.25);border-radius:22px 22px 5px 22px;padding:11px 16px;font-size:15px;line-height:1.56;color:var(--text);word-break:break-word}
.ai-row{display:flex;gap:11px;align-items:flex-start;margin:4px 0 20px;animation:msgIn .22s ease-out both}
.ai-row--intro{margin-bottom:10px}
@keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.ai-icon-sm{width:32px;height:32px;border-radius:11px;flex-shrink:0;margin-top:1px;background:linear-gradient(145deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;box-shadow:0 3px 12px rgba(91,156,246,.3)}
.ai-body{flex:1;min-width:0}
.ai-label{font-size:11px;font-weight:600;color:var(--primary);margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;opacity:.8}
.ai-greeting{font-size:15.5px;line-height:1.72;color:var(--text);margin-bottom:0}
.ai-text{font-size:15.5px;line-height:1.75;color:var(--text);word-break:break-word}
.ai-text b{color:#fff;font-weight:600}
.ai-text.typing::after{content:'▋';color:var(--primary);animation:blink .9s step-end infinite;font-size:12px;vertical-align:middle;margin-left:1px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.typing-row{display:flex;gap:11px;align-items:flex-start;margin:4px 0 8px;animation:msgIn .18s ease-out both}
.typing-dots{display:flex;align-items:center;gap:5px;padding:10px 2px}
.typing-dots span{width:7px;height:7px;border-radius:50%;background:var(--muted2);animation:tdot 1.4s ease-in-out infinite}
.typing-dots span:nth-child(2){animation-delay:.17s}
.typing-dots span:nth-child(3){animation-delay:.34s}
@keyframes tdot{0%,60%,100%{transform:translateY(0);opacity:.4}28%{transform:translateY(-7px);opacity:1}}

/* CHAT — módulos IA */
.ai-modules{display:flex;flex-direction:column;gap:7px;margin-top:14px}
.ai-mod-card{background:var(--s2);border:1px solid var(--border);border-radius:13px;padding:12px 14px;display:flex;align-items:center;gap:11px;cursor:pointer;transition:background .15s,border-color .18s,transform .1s;-webkit-tap-highlight-color:transparent;font-family:inherit;color:var(--text);text-align:left;width:100%}
.ai-mod-card:hover{background:var(--s3);border-color:rgba(91,156,246,.3)}
.ai-mod-card:active{transform:scale(.97)}
.ai-mod-card.used{opacity:.3;pointer-events:none;filter:grayscale(.5)}
.ai-mod-emoji{font-size:19px;flex-shrink:0;width:26px;text-align:center}
.ai-mod-texts{flex:1;min-width:0}
.ai-mod-title{font-size:13.5px;font-weight:600;margin-bottom:2px;color:var(--text)}
.ai-mod-desc{font-size:12px;color:var(--muted2);line-height:1.35}
.ai-mod-arrow{width:15px;height:15px;flex-shrink:0;stroke:var(--muted);opacity:.5}

/* CHAT — chips de sugerencia */
.ai-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}
.ai-chip{background:transparent;border:1px solid rgba(91,156,246,.38);border-radius:20px;padding:7px 15px;font-size:13px;font-weight:500;color:var(--primary);cursor:pointer;transition:background .15s,border-color .15s,transform .1s,opacity .2s;-webkit-tap-highlight-color:transparent;font-family:inherit;white-space:nowrap;letter-spacing:.01em}
.ai-chip:hover{background:rgba(91,156,246,.1);border-color:var(--primary)}
.ai-chip:active{transform:scale(.95)}
.ai-chip.used{opacity:.28;pointer-events:none}

/* CHAT — input */
.chat-bar{padding:10px 14px 10px;background:transparent;flex-shrink:0}
.input-box{position:relative;background:var(--s1);border:1px solid var(--border);border-radius:18px;transition:border-color .2s,box-shadow .2s}
.input-box:focus-within{border-color:rgba(91,156,246,.38);box-shadow:0 0 0 4px rgba(91,156,246,.07)}
.msg-input{display:block;width:100%;background:none;border:none;outline:none;padding:14px 56px 14px 18px;color:var(--text);font-size:15px;font-family:inherit;resize:none;line-height:1.5;min-height:50px;max-height:160px}
.msg-input::placeholder{color:var(--muted)}
.send-btn{position:absolute;right:7px;bottom:6px;width:40px;height:40px;border-radius:12px;background:var(--primary);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,transform .12s,opacity .15s;-webkit-tap-highlight-color:transparent}
.send-btn:hover{background:#4a8de0}
.send-btn:active{transform:scale(.86)}
.send-btn:disabled{opacity:.28;cursor:default}
.send-btn svg{width:16px;height:16px;fill:#fff;margin-left:2px}
.input-hint{font-size:11px;color:var(--muted);text-align:center;padding:5px 0 2px;letter-spacing:.02em}

/* OTHER TABS */
.sec-label{font-size:11.5px;font-weight:600;color:var(--muted2);text-transform:uppercase;letter-spacing:.07em;padding:18px 0 10px}
.mod-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:16px 15px;display:flex;align-items:center;gap:13px;text-decoration:none;color:inherit;margin-bottom:8px;transition:background .15s,border-color .15s;-webkit-tap-highlight-color:transparent;cursor:pointer}
.mod-card:active{background:var(--s2);border-color:rgba(91,156,246,.2)}
.mod-icon{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mod-icon svg{width:22px;height:22px}
.mod-texts{flex:1;min-width:0}
.mod-title{font-size:15px;font-weight:600;margin-bottom:3px;letter-spacing:-.01em}
.mod-desc{font-size:13px;color:var(--muted2);line-height:1.4}
.mod-arrow svg{width:16px;height:16px;stroke:var(--muted)}
.steps-list{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.step-item{display:flex;align-items:center;gap:12px;background:var(--s1);border:1px solid var(--border);border-radius:13px;padding:12px 14px}
.step-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.step-text{font-size:13.5px;line-height:1.4}

/* NOSOTROS */
.biz-hero{display:flex;flex-direction:column;align-items:center;padding:24px 0 20px;text-align:center}
.biz-av{width:72px;height:72px;border-radius:22px;background:linear-gradient(145deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fff;margin-bottom:13px;box-shadow:0 8px 28px var(--primary-glow)}
.biz-name{font-size:20px;font-weight:700;letter-spacing:-.022em;margin-bottom:3px}
.biz-tag{font-size:13px;color:var(--muted2)}
.info-group{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.info-row{display:flex;align-items:center;gap:13px;padding:14px 15px;text-decoration:none;color:inherit;border-bottom:1px solid var(--border);cursor:default;transition:background .14s}
.info-row:last-child{border-bottom:none}
a.info-row,button.info-row{cursor:pointer;background:none;border:none;width:100%;text-align:left;font-family:inherit;color:var(--text)}
a.info-row:active,button.info-row:active{background:var(--s2)}
.info-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.info-icon svg{width:17px;height:17px}
.info-label{font-size:11px;color:var(--muted2);margin-bottom:2px}
.info-val{font-size:14px;font-weight:500}

::-webkit-scrollbar{width:0;height:0}
`;
}
