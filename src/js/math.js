let time = 0;
let w = 0
let b = 0
let a = 0

function sin(x) {
  return (x*(x*(x*(x*(x*(x*(56.4373*x - 197.531) + 218.207) - 51.69) - 30.6533) - 1.09542) + 6.32575) - 0.000193622)
}

function saw(x, f) {
  let cutoff = (138000.0 - f * 28.0) 
  cutoff = cutoff < 80000 ? 80000 : cutoff
  cutoff /= f
  let normalize = 1 + (f - 2000) / 10000
  const y = x < 0.5 ? x : 1 - x
  let sincSaw = 2*y - 2.51981915*y*Math.sin((cutoff)*(y-0.5 -1.15/(cutoff))) / 
        ((cutoff)*(y-0.5-1.15/(cutoff)))
  sincSaw *= normalize
  sincSaw = x < 0.5 ? sincSaw : -sincSaw
  const specAmp = 2 / Math.PI;
  let z = 2*x - Math.trunc(2*x)
  sincSaw += sin(z)*0.5*normalize*specAmp;
  z = 3*x + 0.5 - Math.trunc(3*x + 0.5)
  sincSaw += sin(z)*0.3333333*normalize*specAmp;

  return sincSaw
}

function getWave(freq, time) {
 // return Math.sin(2 * Math.PI * freq * time);
  let phase = time * freq
  phase -= Math.floor(phase)
  let w = saw(phase, freq)
  let aa = w - b
  a = (a + 15*aa) / 16.0;
  b += a
  return b
}
let freq = 400
function loop(numFrames, outL, outR, sampleRate) {
   //freq++
  const amp = 0.5;

  for (let i = 0; i < numFrames; i++) {
    outL[i] = getWave(freq      , time) * amp;
    outR[i] = getWave(freq      , time) * amp;
    //outR[i] = getSine(freq * 1.5, time) * amp;

    time += 1 / sampleRate;
  }
}

/*
  ==============================================================================
    MoogFilter.cpp
	Modified version of MoogFilter class by Desislav Hristov.
  ==============================================================================
*/

#define _USE_MATH_DEFINES
#define qtanh(x) ((x)*(1.04156 - 0.139071*(x)*(x)))

#include "MoogFilter.h"

MoogFilter::MoogFilter() {
	y_a = 0;
	y_b = 0;
	y_c = 0;
	y_d = 0;
	y_d_1 = 0;

	frequency = 2000;
	resonance = 1;
	drive = 1;

	Router::listen(MessageType::FILTER_CUTOFF, this);
	Router::listen(MessageType::FILTER_RESONANCE, this);
	Router::listen(MessageType::FILTER_DRIVE, this);
}
MoogFilter::~MoogFilter() {

}
void MoogFilter::processSamples(float *samples, int numSamples) {
	for (int i = 0; i < numSamples; ++i) {
		samples[i] = tanhf(samples[i] * drive);
		y_a = y_a + g * (tanhf(samples[i] - resonance * ((y_d_1 + y_d) / 2) - tanhf(y_a)));
		y_b = y_b + g * (tanhf(y_a) - tanhf(y_b));
		y_c = y_c + g * (tanhf(y_b) - tanhf(y_c));
		y_d_1 = y_d;
		y_d = y_d + g * (tanhf(y_c) - tanhf(y_d));
		samples[i] = y_d;
	}
}
void MoogFilter::filter(float *samples, int numSamples) {
	for (int i = 0; i < numSamples; ++i) {
		samples[i] = qtanh(samples[i] * drive);
		y_a = y_a + g * (qtanh(samples[i] - resonance * 0.5 * (y_d_1 + y_d) - qtanh(y_a)));
		y_b = y_b + g * (qtanh(y_a) - qtanh(y_b));
		y_c = y_c + g * (qtanh(y_b) - qtanh(y_c));
		y_d_1 = y_d;
		y_d = y_d + g * (qtanh(y_c) - qtanh(y_d));
		samples[i] = y_d;
	}
}
float MoogFilter::getFrequency() {
	return frequency;
}
float MoogFilter::getResonance() {
	return resonance;
}
float MoogFilter::getDrive() {
	return drive;
}

void MoogFilter::setFrequency(float f) {
	if (f > 15000.0f) f = 15000.0f;
	if (f < 0.0f) f = 0.0f;
	frequency = f;
	g = 1 - expf(-2 * tanf(2 * M_PI * frequency / (2 * sampleRate)));
}
void MoogFilter::setResonance(float r) {
	if (r > 5.0f) r = 5.0f;
	if (r < 0.0f) r = 0.0f;
	resonance = r;
}
void MoogFilter::setSampleRate(int s) {
	sampleRate = s;
}
void MoogFilter::setDrive(float d) {
	if (d > 10.0f) d = 10.0f;
	if (d < 0.1f) d = 0.1f;
	drive = d;
}

void MoogFilter::receive(MessageType messageType, double d) {
	switch (messageType) {
	case MessageType::FILTER_CUTOFF:
		setFrequency(d);
		break;
	case MessageType::FILTER_RESONANCE:
		setResonance(d);
		break;
	case MessageType::FILTER_DRIVE:
		setDrive(d);
		break;
	}
}
//----------------------------------------------OLD
/*
let time = 0;
let w = 0
let b = 0
let a = 0

function getSine(freq, time) {
 // return Math.sin(2 * Math.PI * freq * time);
  let phase = time * freq
  phase -= Math.floor(phase)
  let w = 1 - 2.0 * phase
  //w = Math.sign(w)
  let scale = freq / 1100
  let level = Math.tanh(scale)
  w *= 1-level + level*Math.abs(Math.sin(2*Math.PI*phase))
  w *= Math.tanh(scale + 0.75)*1.7
  let aa = w - b
    a = (a + 20*aa) / 21.0;
//  a = (a + 10*aa) / 10.0;
    b += a
  
  return b
}

function loop(numFrames, outL, outR, sampleRate) {
  const freq = 400;
  const amp = 0.5;

  for (let i = 0; i < numFrames; i++) {
    outL[i] = getSine(freq      , time) * amp;
    outR[i] = getSine(freq      , time) * amp;
    //outR[i] = getSine(freq * 1.5, time) * amp;

    time += 1 / sampleRate;
  }
}
*/