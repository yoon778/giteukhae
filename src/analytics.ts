import { Analytics } from '@apps-in-toss/web-framework'

export type ProductEventName =
  | 'app_open'
  | 'tab_selected'
  | 'entry_saved'
  | 'drawing_requested'
  | 'drawing_succeeded'
  | 'drawing_failed'
  | 'friend_invitation_shown'
  | 'friend_invitation_opened'
  | 'memory_card_saved'

type EventValue = string | number | boolean | null | undefined

export function logProductEvent(name: ProductEventName, params: Record<string, EventValue> = {}) {
  try {
    void Analytics.log({ log_name: name, log_type: 'event', params }).catch(() => undefined)
  } catch {
    // 브라우저 미리보기나 미지원 토스 버전에서는 분석 실패를 무시한다.
  }
}
