let time = 0;
let wTime = 0

function getWave(freq, time) {
  // return Math.sin(2 * Math.PI * freq * time);
  let phase = time
  let delta = phase - Math.floor(phase)
  return 1 - 2 * delta
}
function getW(freq, time) {
  // return Math.sin(2 * Math.PI * freq * time);
  let phase = time
  let delta = phase - Math.floor(phase)
  return 1 - 2 * delta
}

function loop(numFrames, outL, outR, sampleRate) {
  const freq = 125;
  const amp = 0.5;
  const maxV = 0.5
  const maxA = 1
  let v = 0
  let a = 0
  let aa = 0
  let dir = 1
  let b = 0
  

  for (let i = 0; i < numFrames; i++) {
    let w = getWave(freq, time) * amp
    a = w - b
    v = (v + 10*a) / 10
    b += v
 //   outL[i] = getW(freq, wTime) * amp;
    outR[i] = b;
 
    time += freq / sampleRate;
    time = time * (1 + 0.000001 * (freq + 100)/10)
    time = time > 1 ? 0 : time
    
    wTime += freq / sampleRate;
  }
}