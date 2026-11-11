from PIL import Image
import numpy as np, colorsys, json, sys, os
R="/mnt/user-data/uploads/hotel/billeder/figurer/"
O=["hud","haar","vest","skjorte","underdel","stroemper","sko"]
def load(n):
  f=np.array(Image.open(R+n+".png").convert("RGBA")).astype(int)
  l=np.array(Image.open(R+"farvelag/"+n+".png").convert("RGBA")); w=f.shape[1]
  L={o:l[:,i*w:(i+1)*w,3]>0 for i,o in enumerate(O)}
  return f,L
def lum(c): return 0.299*c[...,0]+0.587*c[...,1]+0.114*c[...,2]
def hsv(c):
  r,g,b=[c[...,i]/255 for i in range(3)]
  mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
  s=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0); return s,mx
# farver
RED=np.array([[62,8,14],[120,16,26],[162,24,34],[198,38,46],[228,74,74]])
# hudfarver fra pigens eget ansigt/hænder
f0,_=load("pige-staa-ned")
reg=f0[20:52,14:36].reshape(-1,4); reg=reg[reg[:,3]>200][:,:3]
s,v=hsv(reg.astype(float)); ok=(reg[:,0]>reg[:,1])&(reg[:,1]>reg[:,2])&(s>0.25)&(v>0.45)
sk=reg[ok]; L_=lum(sk.astype(float)); order=np.argsort(L_)
SKIN=np.array([sk[order[int(q*(len(order)-1))]] for q in [0.08,0.3,0.5,0.7,0.92]])
SKIN_LINE=np.array([96,48,28])
def ramp(levels,t):
  t=np.clip(t,0,0.999); return levels[(t*len(levels)).astype(int)]
_,L0=load('pige-staa-ned'); _l=lum(f0[...,:3].astype(float))[L0['skjorte']]
GLO=(np.percentile(_l,5),np.percentile(_l,97))
CFG=json.load(open("cfg.json"))
def lag(n):
  f,L=load(n); h,w=f.shape[:2]; c=CFG[n]
  out=np.zeros((h,w,4),int)
  top=L["skjorte"]; pant=L["underdel"]; hair=L["haar"]
  col=f[...,:3].astype(float); lu=lum(col); s,v=hsv(col)
  op=f[...,3]>0
  # ærme-område (underarm) pr. arm-boks
  arm=np.zeros((h,w),bool)
  cuff=(~top)&(~hair)&(~pant)&op&(s<0.30)&(v>0.55)   # creme manchet
  for (x0,x1,yc,ye) in c["arme"]:
    sl=np.zeros((h,w),bool); sl[yc:ye+1,x0:x1+1]=True
    soft=(~hair)&(~pant)&op&(s<0.45)&(v>0.2)
    arm|=sl&(top|soft)
  # mave
  belly=np.zeros((h,w),bool)
  for x in range(c["krop"][0],c["krop"][1]+1):
    ys=np.where(top[:,x])[0]; yp=np.where(pant[:,x])[0]
    if len(ys)==0 or len(yp)==0: continue
    a=ys.max()+1; b=yp.min()
    if b<=a or b-a>5: continue
    for y in range(a,b):
      if op[y,x] and not hair[y,x] and not arm[y,x] and v[y,x]>0.5: belly[y,x]=True
  shirt=(top|belly)&~arm
  # rød T-shirt: lysstyrke -> rød rampe (hvert område for sig)
  t=np.zeros((h,w))
  lo,hi=GLO
  t=(lu-lo)/(hi-lo+1e-6)
  rc=ramp(RED,t*0.85+0.1); rc[lu<80]=RED[0]
  rb=ramp(RED,np.full((h,w),0.55)); 
  out[shirt,:3]=rc[shirt]; out[belly,:3]=RED[2]
  out[shirt,3]=255
  # skygge-kant nederst på T-shirten og ved ærmet
  for x in range(w):
    ys=np.where(shirt[:,x])[0]
    if len(ys): out[ys.max(),x,:3]=RED[1]
  # hud på underarmen
  if arm.any():
    lo,hi=GLO
    ts=(lu-lo)/(hi-lo+1e-6)
    sc=ramp(SKIN,ts); sc[lu<85]=SKIN_LINE
    out[arm,:3]=sc[arm]; out[arm,3]=255
    # ærmekant: rækken lige over snittet i hvert ærme mørkere
    for (x0,x1,yc,ye) in c["arme"]:
      for x in range(x0,min(x1,w-1)+1):
        if yc-1>=0 and shirt[yc-1,x]: out[yc-1,x,:3]=RED[1]
  return f.astype(np.uint8), out.astype(np.uint8)
if __name__=="__main__":
  os.makedirs("lag",exist_ok=True)
  for n in sys.argv[1:] or CFG:
    a,b=lag(n); Image.fromarray(b).save("lag/"+n+".png")
