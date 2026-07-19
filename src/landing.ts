// A small interactive front for what is otherwise a headless API: it lets a
// visitor register, log in and call a protected endpoint straight from the
// browser, watching the real JSON responses. Served at GET "/".

export const landingPage = () => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>REST API · JWT Auth — Playground</title>
<style>
  :root {
    --bg:#020617; --surface:#0f172a; --line:rgba(255,255,255,.1);
    --text:#e2e8f0; --muted:#64748b; --accent:#22c55e; --err:#fb7185; --mono:ui-monospace,SFMono-Regular,Menlo,monospace;
  }
  * { box-sizing:border-box }
  body { margin:0; background:var(--bg); color:var(--text); min-height:100vh;
         font-family:system-ui,-apple-system,"Segoe UI",sans-serif; line-height:1.55 }
  .wrap { max-width:920px; margin:0 auto; padding:0 24px }
  header { border-bottom:1px solid var(--line) }
  nav { display:flex; align-items:center; gap:10px; padding:16px 0; font-weight:600 }
  .logo { width:32px;height:32px;border-radius:8px;background:var(--accent);color:#020617;
          display:grid;place-items:center;font-weight:800;font-size:12px }
  main { padding:44px 0 64px }
  h1 { font-size:30px; letter-spacing:-.02em; margin:0 0 8px }
  h1 span { color:var(--accent) }
  .sub { color:var(--muted); margin:0 0 8px; max-width:620px }
  .badges { display:flex; gap:8px; flex-wrap:wrap; margin:16px 0 32px }
  .badge { font-size:12px; color:var(--muted); border:1px solid var(--line);
           background:rgba(255,255,255,.03); border-radius:999px; padding:3px 10px }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px }
  @media (max-width:760px){ .grid{ grid-template-columns:1fr } }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:20px }
  .card h2 { margin:0 0 4px; font-size:16px }
  .card p { margin:0 0 14px; font-size:13px; color:var(--muted) }
  label { display:block; font-size:12px; color:var(--muted); margin:10px 0 4px }
  input { width:100%; padding:9px 11px; border-radius:9px; border:1px solid var(--line);
          background:var(--bg); color:var(--text); font-size:13px; outline:none }
  input:focus { border-color:var(--accent) }
  button { margin-top:14px; padding:9px 16px; border:0; border-radius:9px; cursor:pointer;
           font-size:13px; font-weight:600; background:var(--accent); color:#020617 }
  button.ghost { background:transparent; color:var(--text); border:1px solid var(--line) }
  button:disabled { opacity:.5; cursor:default }
  .row { display:flex; gap:8px; flex-wrap:wrap }
  .token { margin-top:12px; font-family:var(--mono); font-size:11px; color:var(--muted);
           word-break:break-all; background:var(--bg); border:1px solid var(--line);
           border-radius:8px; padding:8px; display:none }
  .token.show { display:block }
  pre { margin:16px 0 0; background:#01030a; border:1px solid var(--line); border-radius:12px;
        padding:14px; overflow:auto; font-family:var(--mono); font-size:12px; color:#cbd5e1; min-height:64px }
  .method { font-family:var(--mono); font-size:11px; font-weight:700; padding:2px 6px; border-radius:5px;
            background:rgba(34,197,94,.15); color:var(--accent); margin-right:6px }
  table { width:100%; border-collapse:collapse; font-size:13px; margin-top:8px }
  td { padding:7px 0; border-bottom:1px solid rgba(255,255,255,.05); color:var(--muted) }
  td code { font-family:var(--mono); color:var(--text) }
  footer { border-top:1px solid var(--line); padding:22px 0; color:var(--muted); font-size:13px; margin-top:44px }
  a { color:var(--accent) }
</style>
</head>
<body>
<header><div class="wrap"><nav>
  <span class="logo">JWT</span> REST API · Authentication
</nav></div></header>

<main class="wrap">
  <h1>API REST de autenticación con <span>JWT</span></h1>
  <p class="sub">Una API sin interfaz por diseño — pero puedes probarla aquí mismo. Regístrate,
     inicia sesión y llama a una ruta protegida; verás las respuestas JSON reales del servidor.</p>
  <div class="badges">
    <span class="badge">Express</span><span class="badge">TypeScript</span>
    <span class="badge">Prisma · PostgreSQL</span><span class="badge">JWT + bcrypt</span>
    <span class="badge">Zod</span><span class="badge">Helmet</span>
  </div>

  <div class="grid">
    <div class="card">
      <h2>1 · Crear cuenta o iniciar sesión</h2>
      <p>El registro y el login devuelven un <em>access token</em> y un <em>refresh token</em>.</p>
      <label>Nombre</label>
      <input id="name" value="Ada Lovelace">
      <label>Correo</label>
      <input id="email" type="email" placeholder="tu@correo.com">
      <label>Contraseña</label>
      <input id="password" type="password" value="supersecret123">
      <div class="row">
        <button id="btn-register">Registrarme</button>
        <button id="btn-login" class="ghost">Iniciar sesión</button>
      </div>
      <div class="token" id="token"></div>
    </div>

    <div class="card">
      <h2>2 · Llamar a una ruta protegida</h2>
      <p><code>GET /api/users/me</code> requiere el access token en la cabecera
         <code>Authorization: Bearer …</code>.</p>
      <div class="row">
        <button id="btn-me" disabled>GET /api/users/me</button>
        <button id="btn-me-noauth" class="ghost">Sin token (401)</button>
      </div>
      <table>
        <tr><td><span class="method">POST</span><code>/api/auth/register</code></td></tr>
        <tr><td><span class="method">POST</span><code>/api/auth/login</code></td></tr>
        <tr><td><span class="method">POST</span><code>/api/auth/refresh</code></td></tr>
        <tr><td><span class="method">GET</span><code>/api/users/me</code></td></tr>
        <tr><td><span class="method">GET</span><code>/health</code></td></tr>
      </table>
    </div>
  </div>

  <pre id="out">// Las respuestas del servidor aparecerán aquí…</pre>
</main>

<footer class="wrap">
  Backend puro (sin framework de frontend). Código:
  <a href="https://github.com/jersonvillamizar214/rest-api-jwt-auth">github.com/jersonvillamizar214/rest-api-jwt-auth</a>
</footer>

<script>
  var accessToken = null;
  var $ = function(id){ return document.getElementById(id); };
  function show(obj, status){
    $("out").textContent = (status ? "// HTTP " + status + "\\n" : "") +
      (typeof obj === "string" ? obj : JSON.stringify(obj, null, 2));
  }
  function body(){
    return { name: $("name").value, email: $("email").value, password: $("password").value };
  }
  async function call(path, opts){
    try {
      var res = await fetch(path, opts);
      var data = await res.json().catch(function(){ return {}; });
      show(data, res.status);
      return { res: res, data: data };
    } catch (e) { show("No se pudo conectar: " + e.message); return null; }
  }
  function setToken(data){
    if (data && data.accessToken){
      accessToken = data.accessToken;
      $("token").className = "token show";
      $("token").textContent = "access token: " + accessToken.slice(0, 48) + "…";
      $("btn-me").disabled = false;
    }
  }

  $("btn-register").onclick = async function(){
    var r = await call("/api/auth/register", {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body())
    });
    if (r) setToken(r.data);
  };
  $("btn-login").onclick = async function(){
    var r = await call("/api/auth/login", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email: $("email").value, password: $("password").value })
    });
    if (r) setToken(r.data);
  };
  $("btn-me").onclick = function(){
    call("/api/users/me", { headers:{ "Authorization": "Bearer " + accessToken } });
  };
  $("btn-me-noauth").onclick = function(){
    call("/api/users/me", {});
  };

  // Prefill a unique email so "register" works on the first try.
  $("email").value = "demo" + Math.floor(Math.random()*1e6) + "@example.com";
</script>
</body>
</html>`;
