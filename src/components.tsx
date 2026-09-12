import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ANIMAL_UNLOCKS, getAnimal, type AnimalId } from './animals.ts'
import { pickAnimalId, type JournalEntry } from './praise.ts'
import { toDateKey } from './date.ts'
import { getVisual } from './visual.ts'
import { getFamilyPhotoImage, getFamilyPhotoState, type FamilySeason } from './family-photo.ts'
import { countEntriesInMonth } from './progress.ts'
import { getDefaultMemoryDates, getMonthlyEntries, toggleMemoryDate } from './memory.ts'
import { saveMonthlyMemoryCard } from './memory-card.ts'
import { logProductEvent } from './analytics.ts'

function FamilyPhotoScene({ count, src }: { count: number; src: string }) {
  return (
    <div className="family-photo-scene" role="img" aria-label={`${count}마리 동물이 함께 있는 가족사진`}>
      <img className="family-photo-image" src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </div>
  )
}

const FAMILY_PHOTO_COPY = {
  1: { label: '시즌 1 · 우리 집', title: '기특해 가족사진' },
  2: { label: '시즌 2 · 별빛 우체국', title: '별빛 우체국 가족사진' },
} as const

export function FamilyPhoto({
  unlockDayCount,
  season = 1,
}: {
  unlockDayCount: number
  season?: FamilySeason
}) {
  const [isOpen, setIsOpen] = useState(false)
  const state = getFamilyPhotoState(unlockDayCount, season)
  const count = state.unlockedIds.length
  const image = getFamilyPhotoImage(unlockDayCount, season)
  const copy = FAMILY_PHOTO_COPY[season]
  const cardTitleId = `family-photo-title-${season}`
  const modalTitleId = `family-photo-modal-title-${season}`

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <section className="family-photo-card" aria-labelledby={cardTitleId}>
        <button type="button" onClick={() => setIsOpen(true)} aria-label="가족사진 크게 보기">
          <FamilyPhotoScene count={count} src={image} />
          <span className="family-photo-caption">
            <span>{copy.label}</span>
            <strong id={cardTitleId}>{count === 0 ? '아직 빈자리' : `${count}마리와 함께`}</strong>
            <small>{state.nextName ? `${state.nextName}까지 ${state.remainingDays}일` : '모두 모였어요'}</small>
          </span>
        </button>
      </section>

      {isOpen && (
        <div className="family-photo-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}>
          <section className="family-photo-modal" role="dialog" aria-modal="true" aria-labelledby={modalTitleId}>
            <button className="modal-close" type="button" onClick={() => setIsOpen(false)} aria-label="가족사진 닫기">×</button>
            <p className="eyebrow">하나씩 채워지는 중</p>
            <h2 id={modalTitleId}>{copy.title}</h2>
            <FamilyPhotoScene count={count} src={image} />
            <p>{state.nextName ? `${state.nextName}도 ${state.remainingDays}일 뒤에 같이 찍어요` : `${count}마리 친구가 모두 모였어요`}</p>
          </section>
        </div>
      )}
    </>
  )
}

export function Mascot({ seed, animalId, className = '' }: { seed: string; animalId?: AnimalId; className?: string }) {
  const { animal } = getVisual(seed, animalId)
  return (
    <img
      className={`mascot ${className}`.trim()}
      src={animal.assets.character}
      alt={`${animal.name} 캐릭터`}
      width="1024"
      height="1024"
      draggable="false"
    />
  )
}

export function Stamp({ seed, animalId, large = false }: { seed: string; animalId?: AnimalId; large?: boolean }) {
  const visual = getVisual(seed, animalId)
  const style = {
    '--stamp-ink': visual.animal.colors.ink,
    '--stamp-tint': visual.animal.colors.tint,
    '--stamp-turn': `${visual.turn}deg`,
  } as CSSProperties

  return (
    <div className={`stamp${large ? ' stamp--large' : ''}`} style={style} role="img" aria-label={`${visual.animal.name} 칭찬 도장`}>
      <img src={visual.animal.assets.stamp} alt="" aria-hidden="true" draggable="false" />
    </div>
  )
}

export function DiaryDrawing({ entry, compact = false }: {
  entry: JournalEntry
  compact?: boolean
}) {
  if (!entry.drawingDataUrl) return null

  return (
    <figure className={`diary-drawing${compact ? ' diary-drawing--compact' : ''}`}>
      <span className="drawing-tape" aria-hidden="true" />
      <img
        src={entry.drawingDataUrl}
        alt="오늘의 한 줄을 동물 친구들이 표현한 파스텔 그림"
        draggable="false"
      />
    </figure>
  )
}

export function DrawingLoading({ animalIds }: { animalIds: AnimalId[] }) {
  return (
    <div className="drawing-loading" role="status" aria-live="polite">
      <div className="drawing-loading-scene" aria-hidden="true">
        <div className="drawing-loading-paper"><i /><i /><i /></div>
        <span className="drawing-loading-crayon" />
        <div
          className="drawing-loading-friends"
          style={{ '--drawing-friend-count': animalIds.length } as CSSProperties}
        >
          {animalIds.map((animalId, index) => (
            <img
              key={animalId}
              src={getAnimal(animalId).assets.character}
              alt=""
              style={{ '--drawing-friend-index': index } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <strong>동물 친구들이 그림 그리는 중…</strong>
      <small>삐뚤빼뚤 색칠하고 있어요</small>
    </div>
  )
}

function MiniStamp({ seed, animalId }: { seed: string; animalId?: AnimalId }) {
  const { animal, turn } = getVisual(seed, animalId)
  return (
    <span
      className="mini-stamp"
      style={{ '--stamp-ink': animal.colors.ink, '--stamp-turn': `${turn}deg` } as CSSProperties}
      aria-hidden="true"
    >
      <img src={animal.assets.character} alt="" />
    </span>
  )
}

export function MonthlyMemoryCard({ entries, month }: {
  entries: Record<string, JournalEntry>
  month: Date
}) {
  const monthlyEntries = useMemo(() => getMonthlyEntries(entries, month), [entries, month])
  const [selectedDates, setSelectedDates] = useState(() => getDefaultMemoryDates(monthlyEntries))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  if (monthlyEntries.length === 0) return null
  const selectedEntries = monthlyEntries.filter((entry) => selectedDates.includes(entry.date))

  async function handleSave() {
    if (selectedEntries.length === 0 || saveState === 'saving') return
    setSaveState('saving')
    try {
      await saveMonthlyMemoryCard(selectedEntries, month)
      setSaveState('saved')
      logProductEvent('memory_card_saved', { entry_count: selectedEntries.length })
    } catch {
      setSaveState('error')
    }
  }

  return (
    <section className="monthly-memory-card" aria-labelledby="monthly-memory-title">
      <p className="eyebrow">이번 달 다시 보기</p>
      <h2 id="monthly-memory-title">기특한 순간 카드</h2>
      <p>간직하고 싶은 기록을 최대 3개 골라요</p>
      <div className="monthly-memory-options">
        {monthlyEntries.map((entry) => {
          const selected = selectedDates.includes(entry.date)
          return (
            <button
              key={entry.date}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setSelectedDates((current) => toggleMemoryDate(current, entry.date))
                setSaveState('idle')
              }}
            >
              <span>{Number(entry.date.slice(-2))}일</span>
              <strong>{entry.text}</strong>
              <i aria-hidden="true">{selected ? '✓' : '+'}</i>
            </button>
          )
        })}
      </div>
      <button className="monthly-memory-save" type="button" disabled={selectedEntries.length === 0 || saveState === 'saving'} onClick={() => void handleSave()}>
        {saveState === 'saving' ? '카드 만드는 중…' : saveState === 'saved' ? '카드를 저장했어요' : '카드 이미지 저장하기'}
      </button>
      {saveState === 'error' && <small className="monthly-memory-error" role="alert">카드를 저장하지 못했어요. 잠시 후 다시 눌러 주세요</small>}
    </section>
  )
}

export function Calendar({
  entries,
  month,
  onMonthChange,
  onSelect,
}: {
  entries: Record<string, JournalEntry>
  month: Date
  onMonthChange: (offset: number) => void
  onSelect: (dateKey: string) => void
}) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const entryCount = countEntriesInMonth(entries, month)
  const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
    const day = index - firstWeekday + 1
    return day > 0 ? day : null
  })

  return (
    <section className="calendar-card" aria-labelledby="calendar-title">
      <div className="calendar-head">
        <div>
          <p className="eyebrow">날마다 모인 도장</p>
          <div className="calendar-title-row">
            <h2 id="calendar-title">{year}년 {monthIndex + 1}월</h2>
            <span>{entryCount}개의 기특한 날</span>
          </div>
        </div>
        <div className="calendar-nav" aria-label="달력 이동">
          <button type="button" onClick={() => onMonthChange(-1)} aria-label="이전 달">‹</button>
          <button type="button" onClick={() => onMonthChange(1)} aria-label="다음 달">›</button>
        </div>
      </div>

      <div className="weekdays" aria-hidden="true">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {cells.map((day, index) => {
          if (!day) return <span className="calendar-empty" key={`empty-${index}`} />
          const key = toDateKey(new Date(year, monthIndex, day))
          const entry = entries[key]
          return (
            <button
              className={`calendar-day${entry ? ' calendar-day--done' : ''}`}
              type="button"
              key={key}
              onClick={() => entry && onSelect(key)}
              disabled={!entry}
              aria-label={entry ? `${monthIndex + 1}월 ${day}일 기록 자세히 보기` : `${monthIndex + 1}월 ${day}일`}
            >
              <span>{day}</span>
              {entry && <MiniStamp seed={entry.date} animalId={entry.animalId} />}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function EntryModal({
  entry,
  onClose,
  onDelete,
}: {
  entry: JournalEntry
  onClose: () => void
  onDelete: (date: string) => void
}) {
  const animalId = entry.animalId ?? pickAnimalId(entry.date, ANIMAL_UNLOCKS.at(-1)?.min ?? 10)
  const date = new Date(`${entry.date}T12:00:00`)
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="entry-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="entry-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="기록 닫기">×</button>
        <p className="modal-date">{formattedDate}</p>
        <div className="modal-note">
          <span>이날 내가 잘한 일</span>
          <h2 id="entry-modal-title">{entry.text}</h2>
          <span className="modal-note-stamp" aria-hidden="true">
            <Stamp seed={entry.date} animalId={animalId} />
          </span>
        </div>
        <DiaryDrawing entry={entry} compact />
        <div className="modal-comment">
          <span>그날의 한마디</span>
          <p>“{entry.praise}”</p>
        </div>
        <button className="delete-button" type="button" onClick={() => onDelete(entry.date)}>이 기록 지우기</button>
      </section>
    </div>
  )
}
