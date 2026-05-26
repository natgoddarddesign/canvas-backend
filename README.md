# nat-canvas-api

Backend for the Mycelia community canvas.

## Deploy to Render

1. Push this folder to a GitHub repo
2. Go to https://render.com and sign up free
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Render auto-detects the settings from `render.yaml`
6. Click **Deploy** — you'll get a URL like `https://nat-canvas-api.onrender.com`

## Endpoints

- `GET /api/canvas` — returns `{ data: "data:image/png;base64,..." }` or `{ data: null }` if empty
- `POST /api/canvas` — accepts `{ data: "data:image/png;base64,..." }`, saves canvas

## Wire up to your HTML

In `canvas-FINAL-v2.html`, find the `closeCanvas` function and replace the localStorage line:

```js
// Replace this:
try{localStorage.setItem('nat_canvas',oc.toDataURL('image/png'));}catch(e){}

// With this (swap in your Render URL):
fetch('https://nat-canvas-api.onrender.com/api/canvas', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({data: oc.toDataURL('image/png')})
});
```

And in the canvas load section, replace:
```js
// Replace this:
try{const saved=localStorage.getItem('nat_canvas');...}catch(e){}

// With this:
fetch('https://nat-canvas-api.onrender.com/api/canvas')
  .then(r=>r.json())
  .then(function(res){
    if(!res.data)return;
    var img=new Image();
    img.onload=function(){oct.drawImage(img,0,0);setTimeout(drawThumb,90);};
    img.src=res.data;
  });
```
