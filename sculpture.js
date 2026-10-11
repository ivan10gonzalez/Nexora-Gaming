/* Procedural WebGL sculpture. No image downloads, libraries or tracking. */
(() => {
  'use strict';
  const canvas = document.querySelector('#sculpture');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return; // The CSS sculpture remains visible without WebGL.
  const vertex = `attribute vec2 a_position; void main(){ gl_Position=vec4(a_position,0.,1.); }`;
  const fragment = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_time;
    mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
    vec3 turn(vec3 p){p.xz=rot(.5+u_pointer.x*.25+sin(u_time*.22)*.14)*p.xz;p.yz=rot(.45+u_pointer.y*.22)*p.yz;p.xy=rot(-.5+u_time*.085)*p.xy;return p;}
    float shape(vec3 p){
      p=turn(p);
      float a=atan(p.y,p.x);
      vec2 q=vec2(length(p.xy)-1.03,p.z);
      q=rot(a*1.5+u_time*.13)*q;
      // A softly squared, twisted band: a continuous object, not particles.
      vec2 d=abs(q)-vec2(.30,.25);
      return length(max(d,0.))+min(max(d.x,d.y),0.)-.13;
    }
    vec3 normal(vec3 p){vec2 e=vec2(.003,0.);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);
      vec3 ro=vec3(0.,0.,5.4),rd=normalize(vec3(uv*3.65,-5.1));
      float t=0.;float hit=0.;
      for(int i=0;i<84;i++){float d=shape(ro+rd*t);if(d<.0025){hit=1.;break;}t+=d*.68;if(t>9.)break;}
      if(hit<.5){gl_FragColor=vec4(0.);return;}
      vec3 p=ro+rd*t,n=normal(p),v=-rd;
      vec3 light=normalize(vec3(-3.,5.,4.));
      float diffuse=max(dot(n,light),0.);
      float spec=pow(max(dot(n,normalize(light+v)),0.),58.);
      float fresnel=pow(1.-max(dot(n,v),0.),3.);
      vec3 reflected=reflect(-v,n);
      float strip=pow(max(0.,1.-abs(reflected.y-.38)*2.3),12.);
      float occlusion=clamp(shape(p+n*.2)/.2,.25,1.);
      vec3 base=mix(vec3(.10,.15,.055),vec3(.60,.78,.24),diffuse);
      vec3 color=base*(.48+.62*diffuse)*occlusion+vec3(.9,1.,.69)*spec*.85+vec3(.66,.87,.35)*fresnel*.35+vec3(.77,.91,.55)*strip*.45;
      color=pow(color,vec3(.86));
      gl_FragColor=vec4(color,1.);
    }`;
  function compile(type, source) {
    const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'u_resolution'), pointer = gl.getUniformLocation(program, 'u_pointer'), time = gl.getUniformLocation(program, 'u_time');
  let paused = document.documentElement.classList.contains('motion-paused');
  let visible = true, lost = false, raf = 0, last = 0, elapsed = 0, lastDraw = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  function resize() {
    const bounds = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    const width = Math.max(1, Math.round(bounds.width * dpr)), height = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); }
    draw();
  }
  function draw() {
    if (lost) return;
    gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform2f(pointer, x, y); gl.uniform1f(time, elapsed); gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function frame(now) {
    raf = 0;
    if (paused || !visible || document.hidden || lost) { last = 0; return; }
    if (last) elapsed += Math.min((now - last) / 1000, .1);
    last = now;
    if (now - lastDraw >= 32) { x += (targetX - x) * .08; y += (targetY - y) * .08; draw(); lastDraw = now; }
    raf = requestAnimationFrame(frame);
  }
  function resume() { if (!raf && !paused && visible && !document.hidden && !lost) raf = requestAnimationFrame(frame); }
  canvas.closest('.hero-art').addEventListener('pointermove', (event) => { if (event.pointerType === 'touch') return; const rect = canvas.getBoundingClientRect(); targetX = (event.clientX - rect.left) / rect.width - .5; targetY = (event.clientY - rect.top) / rect.height - .5; });
  canvas.closest('.hero-art').addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  window.addEventListener('nexora-motion', (event) => { paused = event.detail.paused; if (paused) { cancelAnimationFrame(raf); raf = 0; last = 0; } else resume(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; last = 0; } else resume(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) resume(); }, { rootMargin: '100px' }).observe(canvas);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); lost = true; cancelAnimationFrame(raf); canvas.closest('.hero-art').classList.remove('ready'); });
  resize(); canvas.closest('.hero-art').classList.add('ready'); resume();
})();
