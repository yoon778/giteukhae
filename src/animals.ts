export const PRAISE_TOPICS = ['movement', 'chores', 'learning', 'kindness', 'selfCare', 'default'] as const

export type PraiseTopic = typeof PRAISE_TOPICS[number]
type PraiseMessages = readonly [string, string, string, string, ...string[]]

interface AnimalDefinition {
  name: string
  unlockAt: number
  assets: {
    character: string
    stamp: string
  }
  colors: {
    ink: string
    tint: string
    heroTint: string
  }
  greeting: string
  visualTraits: readonly [string, string, ...string[]]
  voice: {
    tone: string
    habits: readonly [string, ...string[]]
  }
  confused: readonly [string, string, string, ...string[]]
  praise: Record<PraiseTopic, PraiseMessages>
}

export const ANIMAL_CATALOG = {
  rabbit: {
    name: '토끼',
    unlockAt: 1,
    assets: { character: '/characters/rabbit-v2.png', stamp: '/stamps/rabbit-held-v1.png' },
    colors: { ink: '#388b76', tint: '#e9faf2', heroTint: '#fff0dc' },
    greeting: '안녕?',
    visualTraits: ['길이가 다른 두 귀', '작은 세모 코', '짧은 앞발'],
    voice: { tone: '상냥하지만 도장은 힘차게 찍는 유치원 선생님', habits: ['꾹', '깡총', '귀가 쫑긋'] },
    confused: ['응? 다시 한 번만 말해줄래?', '귀가 쫑긋했는데 뜻을 놓쳤어요!', '오늘 잘한 일을 조금만 더 알려줘요'],
    praise: {
      movement: ['깡총! 귀찮음을 이겨낸 움직임에 도장 꾹!', '한 걸음 움직인 오늘, 귀가 쫑긋할 만큼 멋져요!', '몸을 움직이기로 한 마음부터 이미 대단해요!', '달리고 움직인 만큼 오늘의 기특함도 쑥 자랐어요!'],
      chores: ['주변과 마음을 말끔하게 했네요. 토끼 도장 꾹!', '미루고 싶은 일을 해냈다니 깡총 박수!', '귀찮은 집안일을 끝낸 오늘은 반짝반짝해요!', '내 생활을 직접 돌본 사람에게 도장 찍어줄게요!'],
      learning: ['조금씩 배운 만큼 오늘의 내가 더 단단해졌어요!', '끝까지 붙잡은 집중력에 귀가 쫑긋했어요!', '모르는 걸 알아간 오늘은 분명 기특한 날이에요!', '작은 공부도 쌓이면 멀리 뛰는 힘이 돼요!'],
      kindness: ['다정한 마음을 행동으로 옮긴 게 참 예뻐요!', '그 마음, 토끼 귀만큼 길게 기억하고 싶어요!', '누군가를 생각한 오늘의 마음에 도장 꾹!', '참고 배려한 마음은 절대 작지 않아요!'],
      selfCare: ['나를 챙긴 오늘에 토끼 도장 꾹!', '밥과 물과 쉼을 챙긴 것도 아주 중요한 일이에요!', '내 몸의 말을 들어준 오늘, 귀가 쫑긋했어요!', '잘 쉬고 잘 돌본 것도 분명한 성취예요!'],
      default: ['작아 보여도 직접 해낸 일은 절대 작지 않아요!', '오늘의 한 줄에 토끼 도장 꾹 찍어줄게요!', '스스로 알아본 기특함이라 더 멋져요!', '이 한 줄이면 오늘을 칭찬할 이유로 충분해요!'],
    },
  },
  dog: {
    name: '강아지',
    unlockAt: 3,
    assets: { character: '/characters/dog-v2.png', stamp: '/stamps/dog-held-v1.png' },
    colors: { ink: '#c6424e', tint: '#fff0e8', heroTint: '#e9f4ff' },
    greeting: '안녕!',
    visualTraits: ['축 처진 귀', '동그란 검은 코', '신나게 흔드는 꼬리'],
    voice: { tone: '무조건 내 편인 신난 친구', habits: ['멍', '꼬리 박수', '완전 최고'] },
    confused: ['멍? 무슨 뜻인지 놓쳤어!', '꼬리를 흔들 준비는 됐는데 뭘 잘했어요?', '한 번만 다시 알려주면 바로 알아들을게요!'],
    praise: {
      movement: ['멍! 귀찮음을 이기고 움직이다니 완전 최고!', '산책 천재 발견! 꼬리가 저절로 흔들려요!', '달린 거리만큼 꼬리 박수도 길게 칠게요!', '움직이기로 한 순간부터 이미 멋진 하루예요!'],
      chores: ['멍! 미룰 일을 해내다니 진짜 대단해요!', '깔끔해진 만큼 오늘의 기특함도 반짝반짝!', '집안일 완료 소식에 꼬리가 멈추지 않아요!', '귀찮음을 정리한 사람에게 강아지 도장 쾅!'],
      learning: ['끝까지 해낸 집중력에 물어다 주고 싶은 박수!', '한 걸음 배운 오늘의 나에게 꼬리 박수!', '공부를 시작한 것부터 완전 최고예요!', '머리를 쓴 만큼 오늘의 내가 더 단단해졌어요!'],
      kindness: ['다정함을 행동으로 보여주다니 마음 천재!', '멍멍! 따뜻한 마음이 여기까지 보여요!', '누군가를 챙긴 오늘에 꼬리 박수 백 번!', '그 배려를 내가 제일 크게 자랑할게요!'],
      selfCare: ['나를 챙긴 거 완전 잘했어요! 꼬리 박수!', '물도 밥도 잠도 챙겼다니 오늘의 생활 천재!', '쉬어야 할 때 쉰 것도 아주 용감한 선택이에요!', '내 몸을 돌본 오늘에게 강아지 도장 쾅!'],
      default: ['멍! 아무도 몰라도 나는 알아요. 정말 잘했어요!', '오늘의 나를 챙긴 한 줄, 꼬리 흔들 만큼 최고!', '직접 해낸 일을 발견하다니 벌써 대단해요!', '이 정도면 내가 동네방네 자랑하고 싶어요!'],
    },
  },
  cat: {
    name: '고양이',
    unlockAt: 5,
    assets: { character: '/characters/cat-v2.png', stamp: '/stamps/cat-held-v1.png' },
    colors: { ink: '#6754b7', tint: '#f1edff', heroTint: '#fff3ce' },
    greeting: '…안녕',
    visualTraits: ['뾰족한 귀', '양옆의 수염', '시큰둥한 입'],
    voice: { tone: '무심한 척 정확히 칭찬하는 친구', habits: ['흠', '인정', '제법인데요'] },
    confused: ['…뭐라고요?', '흠, 이건 고양이도 이해하기 어렵네요', '오늘 잘한 일을 다시 적어보시죠'],
    praise: {
      movement: ['흠, 움직이기까지 했다고요? 제법인데요', '귀찮음을 이긴 건 인정. 아주 훌륭해요', '달리고 걸은 노력, 모른 척하기 어렵네요', '몸을 움직인 오늘은 꽤 근사했어요. 인정'],
      chores: ['정리까지 해냈다니 오늘은 꽤 쓸모 있었어요', '깔끔해졌군요. 합격 도장 정도는 찍어드리죠', '미룰 만한 일을 끝냈네요. 제법인데요', '생활을 돌본 솜씨가 고양이 세수보다 꼼꼼해요'],
      learning: ['끝까지 해냈군요. 꽤 집중한 인간이에요', '조용히 노력한 거 다 보고 있었어요. 합격', '모르는 걸 배웠다면 오늘은 성공이에요', '한 줄 공부도 쌓이면 제법 대단해지죠'],
      kindness: ['다정함을 행동으로 옮겼다는 건 인정이에요', '남을 생각한 마음, 고양이도 모른 척 못 하겠네요', '배려를 건넨 오늘은 꽤 따뜻했어요', '참고 먼저 손 내민 건 정말 근사한 일이에요'],
      selfCare: ['자기 몸도 챙길 줄 아는군요. 합격', '잘 먹고 잘 쉰 것, 생각보다 중요한 성취예요', '오늘은 스스로를 꽤 잘 돌봤네요. 인정', '무리하지 않은 선택도 제법 현명했어요'],
      default: ['흠, 그 정도면 제법 기특하네요', '별거 아닌 척해도 잘한 건 잘한 거예요', '스스로 발견했으니 도장 하나쯤 받아도 되겠어요', '오늘 한 일, 조용히 아주 높게 평가할게요'],
    },
  },
  duck: {
    name: '오리',
    unlockAt: 7,
    assets: { character: '/characters/duck-v2.png', stamp: '/stamps/duck-held-v1.png' },
    colors: { ink: '#2f72b7', tint: '#fff8ce', heroTint: '#e3f6f5' },
    greeting: '꽥, 안녕?',
    visualTraits: ['넓고 납작한 주황 부리', '짧은 날개', '물갈퀴 발'],
    voice: { tone: '말끝마다 신이 나는 수다쟁이 친구', habits: ['꽥', '물갈퀴 박수', '뒤뚱뒤뚱'] },
    confused: ['꽥? 한 번만 다시 말해줘요!', '물갈퀴를 준비했는데 무슨 뜻인지 모르겠어요!', '꽥꽥, 오늘 잘한 일을 알려줘요!'],
    praise: {
      movement: ['꽥! 오늘 움직인 거 완전 오리답게 멋져요!', '한 발 두 발, 물갈퀴 박수 짝짝짝!', '달리기 완료라니 뒤뚱뒤뚱 따라가며 박수!', '움직인 오늘의 몸에게 시원한 도장 한 번!'],
      chores: ['꽥꽥! 미룰 일을 해냈으니 오늘은 말끔해요!', '정리 완료라니 부리가 쩍 벌어졌어요!', '설거지와 청소를 끝낸 사람에게 물갈퀴 박수!', '귀찮은 일을 치운 오늘, 아주 반짝거려요!'],
      learning: ['꽥! 머릿속에 지식이 동동 떠다녀요!', '끝까지 해낸 집중력에 물갈퀴 박수!', '배운 만큼 오늘의 내가 더 커졌어요!', '공부 시작 버튼을 누른 것부터 기특해요!'],
      kindness: ['남을 위한 마음이 물결처럼 찰랑찰랑해요!', '꽥! 다정함을 행동으로 옮긴 건 최고예요!', '따뜻한 말을 건넨 오늘에 물갈퀴 박수!', '그 배려 덕분에 마음이 둥실 떠올랐어요!'],
      selfCare: ['꽥! 물 잘 마신 사람에게 물갈퀴 박수!', '밥 먹고 푹 쉰 오늘은 아주 현명해요!', '내 몸을 챙긴 것도 엄청난 기특함이에요!', '잘 자고 잘 일어난 오늘에 도장 퐁당!'],
      default: ['꽥! 아무튼 해냈으니 도장부터 받아요!', '오늘의 한 줄, 오리 기준으로도 아주 기특해요!', '별거 아닌 일도 해낸 건 해낸 거예요!', '물갈퀴가 닳도록 박수쳐 줄게요!'],
    },
  },
  bear: {
    name: '곰',
    unlockAt: 10,
    assets: { character: '/characters/bear-v2.png', stamp: '/stamps/bear-held-v1.png' },
    colors: { ink: '#9b562f', tint: '#fff0df', heroTint: '#eeeaff' },
    greeting: '안녕',
    visualTraits: ['둥근 귀', '묵직한 몸통', '큰 앞발'],
    voice: { tone: '느긋하고 든든하게 인정해 주는 친구', habits: ['천천히', '든든해요', '꼭 안아주고 싶어요'] },
    confused: ['음… 오늘 잘한 일을 알려줘요', '천천히 다시 적어도 괜찮아요', '무슨 뜻인지 곰곰이 생각해도 모르겠어요'],
    praise: {
      movement: ['천천히라도 움직인 오늘, 아주 든든해요', '무거운 귀찮음을 이겨낸 힘이 정말 대단해요', '걷고 달린 만큼 마음의 근육도 자랐어요', '몸을 일으킨 오늘을 크게 꼭 안아주고 싶어요'],
      chores: ['차근차근 해낸 덕분에 마음까지 가벼워졌어요', '미룰 일을 해낸 오늘의 내가 참 든든해요', '생활을 정돈한 힘은 생각보다 아주 커요', '귀찮음을 치운 오늘에게 묵직한 도장 하나'],
      learning: ['서두르지 않고 배운 한 걸음이 아주 단단해요', '끝까지 붙잡은 오늘, 곰 선생님이 다 봤어요', '천천히 쌓은 공부가 오래가는 힘이 돼요', '모르는 걸 알아낸 오늘은 충분히 대단해요'],
      kindness: ['누군가를 위한 마음이 품처럼 따뜻해요', '다정함을 건넨 오늘, 꼭 안아주고 싶어요', '참고 배려한 마음은 아주 묵직한 기특함이에요', '그 따뜻한 행동 덕분에 오늘이 든든해졌어요'],
      selfCare: ['쉬고 먹고 돌본 오늘, 아주 잘했어요', '내 몸을 챙긴 선택이 오래 가는 힘이 돼요', '무리하지 않고 쉰 것도 용감한 일이에요', '스스로를 돌본 오늘을 꼭 안아주고 싶어요'],
      default: ['작은 일도 직접 해냈다면 충분히 대단해요', '오늘의 나를 돌본 마음이 참 든든하고 기특해요', '천천히 해낸 한 가지를 오래 기억해요', '이 한 줄만으로도 오늘은 칭찬받을 날이에요'],
    },
  },
} as const satisfies Record<string, AnimalDefinition>

export type AnimalId = keyof typeof ANIMAL_CATALOG
export const ANIMAL_IDS = Object.keys(ANIMAL_CATALOG) as AnimalId[]
export const ANIMALS = ANIMAL_IDS.map((id) => ({ id, ...ANIMAL_CATALOG[id] }))
export const ANIMAL_UNLOCKS = ANIMALS
  .map(({ id, name, unlockAt }) => ({ id, name, min: unlockAt }))
  .sort((left, right) => left.min - right.min)

export function getAnimal(animalId: AnimalId) {
  return ANIMAL_CATALOG[animalId]
}
