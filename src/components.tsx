import { useEffect, useState, type CSSProperties } from 'react'
import { ANIMAL_UNLOCKS, type AnimalId } from './animals.ts'
import { pickAnimalId, type JournalEntry } from './praise.ts'
import { toDateKey } from './date.ts'
import { getVisual } from './visual.ts'
import { getFamilyPhotoImage, getFamilyPhotoState } from './family-photo.ts'

function FamilyPhotoScene({ count, src }: { count: number; src: string }) {
  return (
    <div className="family-photo-scene" role="img" aria-label={`${count}마리 동물이 함께 있는 가족사진`}>
      <img className="family-photo-image" src={src} alt="" aria-hidden="true" />
    </div>
  )
}

export function FamilyPhoto({ unlockDayCount }: { unlockDayCount: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const state = getFamilyPhotoState(unlockDayCount)
  const count = state.unlockedIds.length
  const image = getFamilyPhotoImage(unlockDayCount)

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
      <section className="family-photo-card" aria-labelledby="family-photo-title">
        <button type="button" onClick={() => setIsOpen(true)} aria-label="가족사진 크게 보기">
          <FamilyPhotoScene count={count} src={image} />
          <span className="family-photo-caption">
            <span>우리 집 가족사진</span>
            <strong id="family-photo-title">{count === 0 ? '아직 빈자리' : `${count}마리와 함께`}</strong>
            <small>{state.nextName ? `${state.nextName}까지 ${state.remainingDays}일` : '모두 모였어요'}</small>
          </span>
        </button>
      </section>

      {isOpen && (
        <div className="family-photo-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}>
          <section className="family-photo-modal" role="dialog" aria-modal="true" aria-labelledby="family-photo-modal-title">
            <button className="modal-close" type="button" onClick={() => setIsOpen(false)} aria-label="가족사진 닫기">×</button>
            <p className="eyebrow">하나씩 채워지는 중</p>
            <h2 id="family-photo-modal-title">기특해 가족사진</h2>
            <FamilyPhotoScene count={count} src={image} />
            <p>{state.nextName ? `${state.nextName}도 ${state.remainingDays}일 뒤에 같이 찍어요` : '다섯 친구가 모두 모였어요'}</p>
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
  const entryCount = Object.keys(entries).length
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
        <div className="modal-visuals"><Stamp seed={entry.date} animalId={animalId} large /></div>
        <div className="modal-note">
          <span>이날 내가 잘한 일</span>
          <h2 id="entry-modal-title">{entry.text}</h2>
        </div>
        <div className="modal-comment">
          <span>그날의 한마디</span>
          <p>“{entry.praise}”</p>
        </div>
        <button className="delete-button" type="button" onClick={() => onDelete(entry.date)}>이 기록 지우기</button>
      </section>
    </div>
  )
}
