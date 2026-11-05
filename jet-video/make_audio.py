"""Synthétise la bande-son (nappe + whooshes + impacts calés sur les transitions). Sortie: music.wav"""
import numpy as np, wave
SR, DUR = 44100, 10.0
n = int(SR * DUR); t = np.arange(n) / SR
rng = np.random.default_rng(3)
def env(a, b, atk=.02, rel=.3):
    e = np.zeros(n); i0, i1 = int(a*SR), int(b*SR)
    L = i1 - i0; x = np.arange(L) / SR
    e[i0:i1] = np.minimum(1, x/atk) * np.exp(-x/rel)
    return e
def noise_sweep(a, b, f0, f1, amp):
    L = int((b-a)*SR); x = np.linspace(0, 1, L)
    nz = rng.standard_normal(L)
    f = f0 * (f1/f0) ** x                       # fréquence centrale glissante
    ph = np.cumsum(2*np.pi*f/SR)
    sig = nz * (0.5 + 0.5*np.sin(ph))           # bruit modulé = souffle
    # lissage passe-bas simple
    k = 60; sig = np.convolve(sig, np.ones(k)/k, mode='same')
    w = np.sin(np.pi*x)**2
    out = np.zeros(n); out[int(a*SR):int(a*SR)+L] = sig*w*amp
    return out
def boom(a, amp=.9):
    x = t - a; m = x >= 0
    f = 45 + 90*np.exp(-x*6)
    return np.where(m, np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-x*3.2), 0) * amp
def chime(a, f, amp=.25):
    x = t - a; m = x >= 0
    s = sum(np.sin(2*np.pi*f*h*x)*amp/h for h in (1, 2.01, 3.02, 4.2))
    return np.where(m, s*np.exp(-x*1.6), 0)
def tick(a, amp=.18):
    x = t - a; m = (x >= 0) & (x < .08)
    return np.where(m, np.sin(2*np.pi*1800*x)*np.exp(-x*70), 0) * amp
# nappe: Am(add9) qui s'ouvre
pad = np.zeros(n)
for f, g in [(55,.5),(110,.45),(164.8,.3),(220,.28),(261.6,.2),(329.6,.16),(493.9,.08)]:
    det = 1 + .0025*np.sin(2*np.pi*.17*t + f)
    pad += g*np.sin(2*np.pi*f*t*det)
swell = np.minimum(1, t/2.2) * (0.55 + 0.45*np.sin(np.pi*np.clip(t/DUR,0,1)))
pad *= swell * .22
# pulsation d'arrière-plan
pulse = .5 + .5*np.sin(2*np.pi*t*2); pad *= (.85 + .15*pulse)
sig = pad + boom(.15, .8)
sig += noise_sweep(1.55, 2.5, 300, 5000, .55) + boom(2.05, .55)          # wipe A->B
sig += noise_sweep(4.3, 5.0, 2500, 400, .45) + boom(4.72, .5)            # shutters
sig += noise_sweep(6.7, 7.5, 400, 4500, .5) + boom(6.95, .45)            # iris
sig += noise_sweep(8.3, 9.0, 600, 5200, .5)                              # push-through
for a in np.arange(5.4, 6.6, .06): sig += tick(a, .06)                   # compteurs
sig += boom(8.9, .8) + chime(8.95, 440) + chime(9.05, 659.3, .18) + chime(9.15, 880, .12)
sig *= np.clip(1 - np.clip((t-9.2)/.8, 0, 1), 0, 1) ** 1.5 * np.minimum(1, t/.05)
sig /= np.max(np.abs(sig)) * 1.15
st = np.stack([sig, np.roll(sig, 40)], 1)                                # léger effet stéréo
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st*32767).astype('<i2').tobytes())
print('music.wav ok')
