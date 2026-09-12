import {Composition, Still} from 'remotion'
import {GiteukhaeReel, ReelCover} from './Video'

export const RemotionRoot = () => (
  <>
    <Composition
      id="GiteukhaeReel"
      component={GiteukhaeReel}
      durationInFrames={510}
      fps={30}
      width={1080}
      height={1920}
    />
    <Still id="ReelCover" component={ReelCover} width={1080} height={1920} />
  </>
)
