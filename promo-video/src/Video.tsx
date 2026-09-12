import type {CSSProperties, ReactNode} from 'react'
import {Audio} from '@remotion/media'
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const colors = {
  ink: '#302824',
  paper: '#fbf7ef',
  cream: '#fff0da',
  red: '#c8404a',
  mint: '#56a993',
  paleMint: '#dff4e9',
  yellow: '#ffe59a',
  line: '#4a413b',
}

const font: CSSProperties = {
  fontFamily: '"Noto Sans KR", "Malgun Gothic", sans-serif',
  wordBreak: 'keep-all',
}

const fade = (frame: number, duration: number) => interpolate(
  frame,
  [0, 9, duration - 10, duration],
  [0, 1, 1, 0],
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
)

const rise = (frame: number, fps: number, delay = 0) => spring({
  frame: frame - delay,
  fps,
  config: {damping: 18, stiffness: 180},
})

const DoodleBackground = () => {
  const frame = useCurrentFrame()
  const float = Math.sin(frame / 28) * 10
  return (
    <AbsoluteFill style={{background: colors.paper, overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: '#fbe8d2', top: -250 + float, right: -190}} />
      <div style={{position: 'absolute', width: 390, height: 390, borderRadius: '50%', background: colors.paleMint, bottom: -180 - float, left: -160}} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: i % 2 ? colors.red : colors.mint, opacity: 0.18, left: 90 + i * 275, top: 260 + (i % 2) * 1120 + float * (i % 2 ? 1 : -1)}} />
      ))}
    </AbsoluteFill>
  )
}

const Scene = ({duration, children}: {duration: number; children: ReactNode}) => {
  const frame = useCurrentFrame()
  return <AbsoluteFill style={{opacity: fade(frame, duration)}}>{children}</AbsoluteFill>
}

const Kicker = ({children, color = colors.red}: {children: ReactNode; color?: string}) => (
  <div style={{...font, color, fontSize: 32, fontWeight: 850, letterSpacing: -1}}>{children}</div>
)

const BigText = ({children, size = 76}: {children: ReactNode; size?: number}) => (
  <div style={{...font, color: colors.ink, fontSize: size, fontWeight: 950, lineHeight: 1.2, letterSpacing: -4}}>{children}</div>
)

const Phone = ({src, width = 650, top = 470}: {src: string; width?: number; top?: number}) => {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const p = rise(frame, fps)
  return (
    <div style={{position: 'absolute', left: '50%', top, width, padding: 14, borderRadius: 54, background: '#fff', border: `5px solid ${colors.line}`, boxShadow: '0 28px 0 rgba(48,40,36,.12)', transform: `translateX(-50%) translateY(${interpolate(p, [0, 1], [120, 0])}px) scale(${interpolate(p, [0, 1], [.92, 1])})`, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{display: 'block', width: '100%', borderRadius: 38}} />
    </div>
  )
}

const HookScene = () => {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const a = rise(frame, fps, 2)
  const b = rise(frame, fps, 12)
  const rabbit = rise(frame, fps, 24)
  return (
    <Scene duration={75}>
      <div style={{position: 'absolute', top: 300, left: 90, right: 90}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}><Kicker>하루 끝에 드는 생각</Kicker></div>
        <div style={{marginTop: 22, opacity: b, transform: `translateY(${(1 - b) * 55}px)`}}>
          <BigText size={91}>오늘 잘한 일<br /><span style={{color: colors.red}}>하나도 없다고?</span></BigText>
        </div>
        <div style={{...font, marginTop: 34, color: '#756963', fontWeight: 700, fontSize: 34, opacity: b}}>진짜 작은 일도 충분히 기특함</div>
      </div>
      <Img src={staticFile('rabbit.png')} style={{position: 'absolute', width: 430, height: 430, objectFit: 'contain', bottom: 220, right: 10, transform: `translateY(${(1 - rabbit) * 280}px) rotate(${(1 - rabbit) * 9}deg)`, opacity: rabbit}} />
      <div style={{position: 'absolute', left: 104, bottom: 300, padding: '22px 30px', background: '#fff', border: `4px solid ${colors.line}`, borderRadius: 30, boxShadow: '9px 10px 0 rgba(48,40,36,.12)', opacity: rabbit, ...font, fontSize: 34, fontWeight: 850}}>한 줄만 적어봐</div>
    </Scene>
  )
}

const WritingScene = () => {
  const frame = useCurrentFrame()
  const typed = '귀찮았지만 설거지를 바로 했다'.slice(0, Math.max(0, Math.floor((frame - 12) / 2)))
  return (
    <Scene duration={115}>
      <div style={{position: 'absolute', top: 205, left: 90, right: 90, textAlign: 'center'}}>
        <Kicker>10초면 충분</Kicker>
        <div style={{marginTop: 12}}><BigText size={66}>잘한 일을 한 줄로</BigText></div>
      </div>
      <Phone src="writing.png" width={650} top={430} />
      <div style={{position: 'absolute', left: 154, right: 154, top: 843, height: 76, background: '#fff', borderRadius: 12, padding: '14px 22px', ...font, color: colors.ink, fontSize: 28, fontWeight: 650, overflow: 'hidden'}}>
        {typed}<span style={{opacity: frame % 18 < 9 ? 1 : 0, color: colors.red}}>|</span>
      </div>
    </Scene>
  )
}

const StampMark = () => {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const p = spring({frame: frame - 12, fps, config: {damping: 9, stiffness: 240}})
  const rotate = interpolate(p, [0, 1], [-14, -5])
  return (
    <div style={{position: 'absolute', right: 112, top: 555, width: 235, height: 235, borderRadius: '50%', border: `8px dashed ${colors.mint}`, background: 'rgba(239,255,249,.88)', display: 'grid', placeItems: 'center', transform: `scale(${interpolate(p, [0, .55, 1], [2.4, .86, 1])}) rotate(${rotate}deg)`, opacity: p}}>
      <Img src={staticFile('rabbit.png')} style={{width: 190, height: 190, objectFit: 'contain'}} />
    </div>
  )
}

const PraiseScene = () => {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const p = rise(frame, fps, 18)
  return (
    <Scene duration={100}>
      <div style={{position: 'absolute', top: 190, left: 70, right: 70, textAlign: 'center'}}>
        <Kicker>도장 꾹</Kicker>
        <div style={{marginTop: 10}}><BigText size={62}>동물 친구가 알아봐 줌</BigText></div>
      </div>
      <Phone src="praised.png" width={640} top={415} />
      <StampMark />
      <div style={{position: 'absolute', left: 130, right: 130, bottom: 230, borderRadius: 34, background: '#fff7df', border: `4px solid ${colors.line}`, borderLeft: `15px solid ${colors.mint}`, padding: '28px 34px', boxShadow: '8px 10px 0 rgba(48,40,36,.12)', transform: `translateY(${(1 - p) * 40}px)`, opacity: p, ...font}}>
        <div style={{fontSize: 25, fontWeight: 850, color: colors.red}}>오늘의 한마디</div>
        <div style={{fontSize: 34, fontWeight: 850, color: '#347d69', marginTop: 8}}>어이구, 귀찮았는데 바로 해냈구나!</div>
      </div>
    </Scene>
  )
}

const DrawingScene = () => {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const p = rise(frame, fps, 7)
  const scribble = interpolate(frame, [0, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  return (
    <Scene duration={105}>
      <div style={{position: 'absolute', top: 190, left: 70, right: 70, textAlign: 'center'}}>
        <Kicker>기록이 그림으로</Kicker>
        <div style={{marginTop: 10}}><BigText size={62}>친구들이 오늘을 그려줌</BigText></div>
      </div>
      <div style={{position: 'absolute', width: 710, height: 710, left: 185, top: 470, padding: 22, background: '#fffdf6', border: `4px solid ${colors.line}`, boxShadow: '18px 22px 0 rgba(48,40,36,.12)', transform: `rotate(-2deg) scale(${interpolate(p, [0, 1], [.86, 1])})`, opacity: p}}>
        <Img src={staticFile('ai-drawing.webp')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', width: 170, height: 42, top: -25, left: 275, background: 'rgba(255,219,119,.72)', transform: 'rotate(2deg)'}} />
      </div>
      <div style={{position: 'absolute', left: 270, right: 270, top: 1270, height: 12, borderRadius: 9, background: '#eadfd5', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${scribble * 100}%`, background: colors.mint}} />
      </div>
      <div style={{position: 'absolute', top: 1310, left: 100, right: 100, textAlign: 'center', ...font, color: '#756963', fontSize: 30, fontWeight: 750}}>내 한 줄이 오늘의 장면이 됨</div>
    </Scene>
  )
}

const CollectionScene = () => {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const p1 = rise(frame, fps, 0)
  const p2 = rise(frame, fps, 20)
  return (
    <Scene duration={90}>
      <div style={{position: 'absolute', top: 180, left: 60, right: 60, textAlign: 'center'}}>
        <Kicker>하루씩 쌓이면</Kicker>
        <div style={{marginTop: 10}}><BigText size={63}>도장도, 친구도 늘어남</BigText></div>
      </div>
      <div style={{position: 'absolute', width: 455, left: 70, top: 500, padding: 10, borderRadius: 40, background: '#fff', border: `4px solid ${colors.line}`, boxShadow: '12px 14px 0 rgba(48,40,36,.12)', transform: `translateX(${(1 - p1) * -90}px) rotate(-4deg)`, opacity: p1, overflow: 'hidden'}}>
        <Img src={staticFile('calendar.png')} style={{width: '100%', display: 'block', borderRadius: 28}} />
      </div>
      <div style={{position: 'absolute', width: 575, right: 38, top: 650, padding: 14, borderRadius: 36, background: '#fffdf6', border: `4px solid ${colors.line}`, boxShadow: '12px 14px 0 rgba(48,40,36,.16)', transform: `translateX(${(1 - p2) * 100}px) rotate(4deg)`, opacity: p2}}>
        <Img src={staticFile('family-photo.png')} style={{width: '100%', display: 'block', borderRadius: 24}} />
        <div style={{...font, textAlign: 'center', fontSize: 25, fontWeight: 800, color: '#736861', padding: '13px 0 3px'}}>우리 집 가족사진 완성</div>
      </div>
    </Scene>
  )
}

const CtaContent = ({animated = true}: {animated?: boolean}) => {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const p = animated ? rise(frame, fps, 2) : 1
  const q = animated ? rise(frame, fps, 16) : 1
  return (
    <>
      <div style={{position: 'absolute', top: 250, left: 90, right: 90, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 45}px)`}}>
        <Kicker>매일 10초</Kicker>
        <div style={{marginTop: 14}}><BigText size={80}>나를 칭찬하는 습관</BigText></div>
      </div>
      <div style={{position: 'absolute', top: 640, left: '50%', width: 360, height: 360, transform: `translateX(-50%) scale(${q})`, borderRadius: '50%', background: colors.paleMint, border: `6px solid ${colors.line}`, display: 'grid', placeItems: 'center', boxShadow: '16px 18px 0 rgba(48,40,36,.12)'}}>
        <Img src={staticFile('rabbit.png')} style={{width: 315, height: 315, objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', top: 1070, left: 70, right: 70, textAlign: 'center', opacity: q, ...font}}>
        <div style={{fontSize: 56, fontWeight: 950, color: colors.ink, letterSpacing: -3}}>기특해:칭찬일기</div>
        <div style={{fontSize: 31, fontWeight: 700, color: '#776b65', marginTop: 18}}>대단하지 않아도 한 줄이면 도장 찍어줌</div>
        <div style={{margin: '64px auto 0', width: 700, padding: '28px 40px', borderRadius: 30, background: colors.red, color: '#fff', fontSize: 38, fontWeight: 900, boxShadow: '0 10px 0 #7c3037'}}>토스에서 “기특해:칭찬일기” 검색</div>
      </div>
    </>
  )
}

const CtaScene = () => <Scene duration={80}><CtaContent /></Scene>

export const GiteukhaeReel = () => (
  <AbsoluteFill style={{...font, background: colors.paper}}>
    <DoodleBackground />
    <Audio src={staticFile('soundtrack.wav')} volume={0.92} />
    <Sequence from={0} durationInFrames={75} premountFor={30}><HookScene /></Sequence>
    <Sequence from={60} durationInFrames={115} premountFor={30}><WritingScene /></Sequence>
    <Sequence from={165} durationInFrames={100} premountFor={30}><PraiseScene /></Sequence>
    <Sequence from={255} durationInFrames={105} premountFor={30}><DrawingScene /></Sequence>
    <Sequence from={350} durationInFrames={90} premountFor={30}><CollectionScene /></Sequence>
    <Sequence from={430} durationInFrames={80} premountFor={30}><CtaScene /></Sequence>
  </AbsoluteFill>
)

export const ReelCover = () => (
  <AbsoluteFill style={{...font, background: colors.paper}}>
    <DoodleBackground />
    <CtaContent animated={false} />
    <div style={{position: 'absolute', top: 105, left: 80, padding: '15px 24px', borderRadius: 999, background: colors.yellow, color: colors.ink, fontSize: 29, fontWeight: 900}}>오늘 잘한 일, 하나만</div>
  </AbsoluteFill>
)
