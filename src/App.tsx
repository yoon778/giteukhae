import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  getNextAnimalUnlock,
  getNextPraiseRevision,
  getUnlockedAnimalIds,
  MAX_ENTRY_TEXT_LENGTH,
  pickAnimalId,
  removeEntry,
  shouldShowUnclearReaction,
  type JournalEntry,
} from './praise.ts'
import { isAiPraiseConfigured, requestPraise } from './praise-api.ts'
import { ANIMALS, type AnimalId } from './animals.ts'
import {
  EMPTY_PROGRESS,
  creditDate,
  mergeProgressWithEntries,
  type PraiseProgress,
} from './progress.ts'
import {
  loadEntries,
  loadProgress,
  loadSeenAnimals,
  saveEntries,
  saveProgress,
  saveSeenAnimals,
} from './storage.ts'
import { shiftDate, toDateKey } from './date.ts'
import { Calendar, EntryModal, Mascot, Stamp } from './components.tsx'
import { getVisual } from './visual.ts'
import './App.css'

function App() {
  const [baseToday, setBaseToday] = useState(() => new Date())
  const [devDayOffset, setDevDayOffset] = useState(() => {
    if (!import.meta.env.DEV) return 0
    return Number(sessionStorage.getItem('giteukhae.devDayOffset') ?? 0) || 0
  })
  const today = useMemo(() => shiftDate(baseToday, devDayOffset), [baseToday, devDayOffset])
  const todayKey = toDateKey(today)
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({})
  const [text, setText] = useState('')
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [activeTab, setActiveTab] = useState<'write' | 'calendar'>('write')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isStamping, setIsStamping] = useState(false)
  const [progress, setProgress] = useState<PraiseProgress>(EMPTY_PROGRESS)
  const [seenAnimalIds, setSeenAnimalIds] = useState<AnimalId[]>([])
  const [greetingAnimalId, setGreetingAnimalId] = useState<AnimalId | null>(null)
  const [storageError, setStorageError] = useState('')
  const greetingChecked = useRef(false)

  useEffect(() => {
    let cancelled = false
    void Promise.all([loadEntries(), loadSeenAnimals(), loadProgress()]).then(([saved, seen, storedProgress]) => {
      if (cancelled) return
      const mergedProgress = mergeProgressWithEntries(storedProgress, saved)
      setEntries(saved)
      setProgress(mergedProgress)
      setSeenAnimalIds(seen)
      setText(saved[todayKey]?.text ?? '')
      setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
      if (!greetingChecked.current) {
        const greeting = getUnlockedAnimalIds(mergedProgress.creditedDates.length).find((animalId) => !seen.includes(animalId))
        setGreetingAnimalId(greeting ?? null)
        greetingChecked.current = true
      }
      if (mergedProgress.creditedDates.length !== storedProgress.creditedDates.length) {
        void saveProgress(mergedProgress).catch(() => {
          if (!cancelled) setStorageError('해금 진행도를 저장하지 못했어요')
        })
      }
      setIsLoading(false)
    }).catch(() => {
      if (cancelled) return
      setStorageError('저장된 기록을 불러오지 못했어요')
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [today, todayKey])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date()
      setBaseToday((current) => toDateKey(current) === toDateKey(now) ? current : now)
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  async function dismissGreeting() {
    if (!greetingAnimalId) return
    const isPersistedFriend = getUnlockedAnimalIds(progress.creditedDates.length).includes(greetingAnimalId)
    if (devDayOffset !== 0 || !isPersistedFriend) {
      setGreetingAnimalId(null)
      return
    }
    const next = seenAnimalIds.includes(greetingAnimalId) ? seenAnimalIds : [...seenAnimalIds, greetingAnimalId]
    setGreetingAnimalId(null)
    setSeenAnimalIds(next)
    try {
      await saveSeenAnimals(next)
    } catch {
      setStorageError('첫인사를 기억하지 못했어요')
    }
  }

  const totalCount = Object.keys(entries).length
  const progressCount = progress.creditedDates.length
  const demoCount = Object.values(entries).filter((entry) => entry.isDemo).length
  const experienceCount = progressCount + (import.meta.env.DEV ? demoCount : 0)
  const todayEntry = entries[todayKey]
  const selectedEntry = selectedKey ? entries[selectedKey] : undefined
  const todayAnimalId = todayEntry?.animalId ?? pickAnimalId(todayKey, Math.max(experienceCount + 1, 1))
  const todayVisual = getVisual(todayKey, todayAnimalId)
  const showTodayPraise = Boolean(todayEntry && text.trim() === todayEntry.text)
  const unlockedAnimalIds = getUnlockedAnimalIds(experienceCount)
  const nextUnlock = getNextAnimalUnlock(experienceCount)
  const formattedToday = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(today)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isSaving || isStamping) return

    setIsSaving(true)

    const isDemo = import.meta.env.DEV && devDayOffset !== 0
    const nextCount = todayEntry ? experienceCount : experienceCount + 1
    const animalId = todayEntry?.animalId ?? pickAnimalId(todayKey, nextCount)
    const praiseRevision = getNextPraiseRevision(todayEntry, trimmed)
    const praiseResult = await requestPraise({
      text: trimmed,
      count: nextCount,
      animalId,
      revision: praiseRevision,
    })
    const nextProgress = creditDate(progress, todayKey, isDemo)
    const next = {
      ...entries,
      [todayKey]: {
        date: todayKey,
        text: trimmed,
        praise: praiseResult.comment,
        praiseRevision,
        responseKind: praiseResult.kind,
        animalId,
        isDemo: todayEntry?.isDemo ?? isDemo,
      },
    }

    try {
      await saveEntries(next)
    } catch {
      setStorageError('기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요')
      setIsSaving(false)
      return
    }

    let progressError = ''
    if (!isDemo) {
      try {
        await saveProgress(nextProgress)
      } catch {
        progressError = '기록은 저장했지만 해금 진행도 저장이 늦어지고 있어요'
      }
    }
    setEntries(next)
    setProgress(nextProgress)
    setStorageError(progressError)
    setIsSaving(false)
    setIsStamping(true)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => setIsStamping(false), reduceMotion ? 80 : 2100)
  }

  async function handleDelete(date: string) {
    if (!window.confirm('이 칭찬 기록을 지울까요? 지운 기록은 복구할 수 없어요')) return

    const next = removeEntry(entries, date)
    try {
      await saveEntries(next)
      setEntries(next)
      setSelectedKey(null)
      if (date === todayKey) setText('')
      setStorageError('')
    } catch {
      setStorageError('기록을 지우지 못했어요. 잠시 후 다시 시도해 주세요')
    }
  }

  async function handleClearAll() {
    if (!window.confirm('모든 칭찬 기록을 지울까요? 만난 동물과 해금 진행도는 유지돼요')) return

    try {
      await saveEntries({})
      setEntries({})
      setText('')
      setSelectedKey(null)
      setStorageError('')
    } catch {
      setStorageError('기록을 지우지 못했어요. 잠시 후 다시 시도해 주세요')
    }
  }

  function moveDemoDay(offset: number) {
    setDevDayOffset((current) => {
      const next = Math.max(0, current + offset)
      sessionStorage.setItem('giteukhae.devDayOffset', String(next))
      return next
    })
  }

  function resetDemoDay() {
    sessionStorage.removeItem('giteukhae.devDayOffset')
    setDevDayOffset(0)
  }

  async function clearDemoEntries() {
    const next = Object.fromEntries(Object.entries(entries).filter(([, entry]) => !entry.isDemo))
    try {
      await saveEntries(next)
      setEntries(next)
      setSelectedKey(null)
      setText('')
      resetDemoDay()
      setStorageError('')
    } catch {
      setStorageError('테스트 기록을 지우지 못했어요')
    }
  }

  async function resetAllData() {
    if (!window.confirm('기록, 해금 동물, 첫인사를 모두 초기화할까요? 되돌릴 수 없어요')) return

    try {
      await Promise.all([saveEntries({}), saveProgress(EMPTY_PROGRESS), saveSeenAnimals([])])
      setEntries({})
      setProgress(EMPTY_PROGRESS)
      setSeenAnimalIds([])
      setGreetingAnimalId('rabbit')
      setSelectedKey(null)
      setText('')
      resetDemoDay()
      setStorageError('')
    } catch {
      setStorageError('앱 데이터를 초기화하지 못했어요')
    }
  }

  function selectTab(tab: 'write' | 'calendar') {
    setActiveTab(tab)
    setSelectedKey(null)
  }

  if (isLoading) return <main className="loading">칭찬 동물 고르는 중…</main>

  return (
    <main className="app-shell">
      <header className="brand-bar">
        <img src={todayVisual.animal.assets.character} alt="" aria-hidden="true" />
        <div>
          <strong>기특해</strong>
          <span>오늘도 잘한 게 하나는 있어</span>
        </div>
      </header>

      <nav className="app-tabs" role="tablist" aria-label="기특해 메뉴">
        <button
          id="write-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'write'}
          aria-controls="write-panel"
          onClick={() => selectTab('write')}
        >
          오늘 기록
        </button>
        <button
          id="calendar-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'calendar'}
          aria-controls="calendar-panel"
          onClick={() => selectTab('calendar')}
        >
          칭찬 달력
          {totalCount > 0 && <span>{totalCount}</span>}
        </button>
      </nav>

      {activeTab === 'write' ? (
        <div id="write-panel" role="tabpanel" aria-labelledby="write-tab">
          <section className="hero-card" style={{ '--hero-tint': todayVisual.animal.colors.heroTint } as CSSProperties}>
            <div className="hero-copy">
              <p className="date-label">{formattedToday}</p>
              <h1>{todayEntry ? '오늘도 일단 잘했음' : '오늘 뭐가 기특했나요?'}</h1>
              <p>대단하지 않아도 한 줄이면 도장 찍어줌</p>
            </div>
            <Mascot seed={todayKey} animalId={todayAnimalId} className="hero-mascot" />
          </section>

          <section className={`journal-card${isStamping ? ' journal-card--stamping' : ''}`} aria-labelledby="journal-title">
            <div className="paper-tape" aria-hidden="true" />
            <p className="eyebrow">오늘의 장한 일</p>
            <h2 id="journal-title">한 줄 칭찬 일기</h2>

            <form onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="proud-note">오늘 잘한 일</label>
              <div className={`note-paper${showTodayPraise ? ' note-paper--praised' : ''}`}>
                <textarea
                  id="proud-note"
                  value={text}
                  maxLength={MAX_ENTRY_TEXT_LENGTH}
                  onChange={(event) => {
                    setText(event.target.value)
                  }}
                  placeholder="예: 귀찮았지만 설거지를 바로 했다"
                  rows={3}
                />
                {showTodayPraise && todayEntry && (
                  <div className="note-stamp-guide" aria-hidden="true">
                    {text}
                    <div className="note-stamp">
                      <Stamp seed={todayEntry.date} animalId={todayEntry.animalId ?? todayAnimalId} />
                    </div>
                  </div>
                )}
              </div>
              <div className="form-meta">
                <span>{text.length}/{MAX_ENTRY_TEXT_LENGTH}</span>
                <span>{isAiPraiseConfigured() ? '기록은 기기에 저장 · 한 줄은 AI에 전송' : '내 기기에만 보관됨'}</span>
              </div>
              {showTodayPraise && todayEntry && (
                <div
                  className={`teacher-comment${shouldShowUnclearReaction(todayEntry.responseKind) ? ' teacher-comment--confused' : ''}`}
                  style={{ '--teacher-ink': todayVisual.animal.colors.ink } as CSSProperties}
                  aria-live="polite"
                >
                  {shouldShowUnclearReaction(todayEntry.responseKind) && <strong className="reaction-mark" aria-hidden="true">?</strong>}
                  <div>
                    <span>오늘의 한마디</span>
                    <p>{todayEntry.praise}</p>
                  </div>
                </div>
              )}
              <button className="stamp-button" type="submit" disabled={!text.trim() || isSaving || isStamping}>
                {isSaving ? '한마디 고르는 중…' : todayEntry ? '칭찬 다시 받기' : '칭찬 도장 받기'}
              </button>
            </form>

            {todayEntry && <button className="delete-button today-delete" type="button" onClick={() => void handleDelete(todayKey)}>오늘 기록 지우기</button>}
            {storageError && <p className="storage-error" role="alert">{storageError}</p>}
          </section>

          <section className="progress-card" aria-label="도장 수집 현황">
            <div><strong>{experienceCount}</strong><span>번의 기특함</span></div>
            <div className="progress-status">
              <p>오늘 담당 <b>{todayVisual.animal.name}</b></p>
              <small>{nextUnlock ? `${nextUnlock.name}까지 ${nextUnlock.min - experienceCount}일` : '모든 친구 해금 완료'}</small>
            </div>
          </section>
        </div>
      ) : (
        <div id="calendar-panel" role="tabpanel" aria-labelledby="calendar-tab">
          <section className="calendar-intro">
            <div>
              <p className="eyebrow">모아보니 은근 많음</p>
              <h1>{totalCount}개의 기특한 날</h1>
              <span>도장을 누르면 그날 기록이 크게 열려요</span>
            </div>
            <div className="mascot-parade" aria-hidden="true">
              {ANIMALS.filter((animal) => unlockedAnimalIds.includes(animal.id)).map((animal) => <img src={animal.assets.character} alt="" key={animal.id} />)}
            </div>
          </section>
          <Calendar
            entries={entries}
            month={month}
            onMonthChange={(offset) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))}
            onSelect={setSelectedKey}
          />
          {totalCount === 0 && <p className="calendar-empty-copy">아직 받은 도장이 없음<br />오늘 기록부터 하나 남겨보기</p>}
          {storageError && <p className="storage-error" role="alert">{storageError}</p>}
        </div>
      )}

      <footer>
        <p>작은 일도 알아봐 주면, 제법 대단해짐</p>
        {totalCount > 0 && <button type="button" onClick={() => void handleClearAll()}>모든 기록 지우기</button>}
      </footer>

      {selectedEntry && (
        <EntryModal entry={selectedEntry} onClose={() => setSelectedKey(null)} onDelete={(date) => void handleDelete(date)} />
      )}

      {isStamping && (
        <div className="stamp-overlay" role="status" aria-label="칭찬 도장을 찍고 있어요">
          <div className="stamp-scene" aria-hidden="true">
            <div className="doodle-stamper">
              <Mascot seed={todayKey} animalId={todayAnimalId} />
              <div className="doodle-tool"><i /></div>
            </div>
            <div className="stamp-impression"><Stamp seed={todayKey} animalId={todayAnimalId} large /></div>
            <strong>쾅!</strong>
          </div>
        </div>
      )}

      {greetingAnimalId && (
        <button
          className={`greeting-scene greeting-scene--${greetingAnimalId}`}
          type="button"
          onClick={() => void dismissGreeting()}
          aria-label={`${getVisual(todayKey, greetingAnimalId).animal.name}의 첫인사 닫기`}
        >
          <span className="greeting-bubble">
            <svg viewBox="0 0 140 80" preserveAspectRatio="none" aria-hidden="true">
              <path d="M70 4C108 4 134 14 134 31C134 47 112 58 77 59L53 73L57 57C26 54 6 45 6 30C6 14 33 4 70 4Z" />
            </svg>
            <span>{getVisual(todayKey, greetingAnimalId).animal.greeting}</span>
          </span>
          <Mascot seed={`${todayKey}-greeting`} animalId={greetingAnimalId} />
          <small>화면을 누르면 시작</small>
        </button>
      )}

      {import.meta.env.DEV && (
        <details className="dev-tools">
          <summary>DEV 체험 도구</summary>
          <p>개발 화면에만 표시 · 배포 빌드 자동 제외</p>
          <strong>체험 날짜 {todayKey}</strong>
          <div>
            <button type="button" onClick={() => moveDemoDay(1)}>다음 날 +1</button>
            <button type="button" onClick={() => moveDemoDay(5)}>다음 날 +5</button>
            <button type="button" onClick={resetDemoDay}>실제 오늘로</button>
            <button type="button" onClick={() => setGreetingAnimalId(todayAnimalId)}>현재 동물 첫인사</button>
            <button type="button" onClick={() => void clearDemoEntries()}>테스트 기록 제거</button>
            <button type="button" onClick={() => void resetAllData()}>앱 데이터 전체 초기화</button>
          </div>
        </details>
      )}
    </main>
  )
}

export default App
