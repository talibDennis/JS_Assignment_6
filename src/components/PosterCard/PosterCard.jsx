
import React from "react";
import "./PosterCard.css";

export default function PosterCard({
  imageUrl,
  title,
  subtitle,
  rating,      // number 0–10 from TMDB
  onClick,     // optional
}) {
  const roundedRating = typeof rating === "number" ? Math.round(rating * 10) / 10 : null;
  const starCount = Math.round((rating ?? 0) / 2); // 0–5 stars
  const placeholder =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'>
        <rect width='100%' height='100%' fill='#1f2937'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='sans-serif' font-size='16'>No Image</text>
      </svg>
    `);

  return (
    <article className="poster-card" onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="poster-thumb">
        <img
          src={imageUrl || placeholder}
          alt={title ? `${title} poster` : "Poster"}
          loading="lazy"
          width="300"
          height="450"
        />
        {roundedRating != null && (
          <div className="poster-badge" aria-label={`Rating ${roundedRating} out of 10`}>
            ★ {roundedRating}
          </div>
        )}
      </div>

      <div className="poster-meta">
        <h3 className="poster-title" title={title}>{title}</h3>
        {subtitle && <p className="poster-sub">{subtitle}</p>}

        {/* Optional stars row */}
        {typeof rating === "number" && (
          <div className="poster-stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < starCount ? "star filled" : "star"}>★</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}