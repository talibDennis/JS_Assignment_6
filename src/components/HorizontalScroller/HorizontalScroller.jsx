
// HorizontalScroller.jsx
import { useRef } from "react";
import "./HorizontalScroller.css";

export default function HorizontalScroller({ title, items, renderItem, itemWidth = 180, gap = 16 }) {
  const scrollerRef = useRef(null);

  const scrollByPage = (direction = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const visibleWidth = el.clientWidth;
    // We scroll approximately one view width minus one card, so we don’t “overshoot”.
    const delta = direction * (visibleWidth - (itemWidth + gap));
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="scroller-section" aria-label={title}>
      <div className="scroller-header">
        <h2 className="scroller-title">{title}</h2>
        <div className="scroller-controls" aria-hidden="false" role="group" aria-label={`${title} controls`}>
          <button
            type="button"
            className="scroller-btn"
            aria-label="Scroll left"
            onClick={() => scrollByPage(-1)}
          >
            ◀
          </button>
          <button
            type="button"
            className="scroller-btn"
            aria-label="Scroll right"
            onClick={() => scrollByPage(1)}
          >
            ▶
          </button>
        </div>
      </div>

      <div
        className="scroller"
        ref={scrollerRef}
        role="list"
        tabIndex={0}
        aria-roledescription="Horizontal scroller"
        aria-label={title}
      >
        {items.map((item, i) => (
          <div
            key={item.id ?? i}
            className="scroller-item"
            role="listitem"
            aria-label={item.title ?? item.name ?? `Item ${i + 1}`}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
