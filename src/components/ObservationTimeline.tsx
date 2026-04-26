import type { PlantObservation } from '../types/plantDiary';

interface ObservationTimelineProps {
  observations: PlantObservation[];
  onDelete: (id: string) => void;
}

export default function ObservationTimeline({
  observations,
  onDelete
}: ObservationTimelineProps) {
  return (
    <section className="timeline-panel" aria-label="식물 관찰 타임라인">
      <div className="section-heading">
        <p className="eyebrow">관찰 카드</p>
        <h2>차곡차곡 쌓이는 성장 기록</h2>
      </div>
      {observations.length === 0 ? (
        <p className="empty-copy">오늘의 관찰을 저장하면 포스트잇 카드가 생겨요.</p>
      ) : (
        <div className="timeline-list">
          {observations.map((item) => (
            <article className="note-card" key={item.id}>
              {item.photoDataUrl && (
                <img src={item.photoDataUrl} alt={`${item.date} 식물 사진`} />
              )}
              <div className="note-card-body">
                <time dateTime={item.date}>{item.date}</time>
                <strong>{item.heightCm}cm</strong>
                <p>{item.note}</p>
              </div>
              <button type="button" onClick={() => onDelete(item.id)}>
                {item.date} 기록 삭제
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
