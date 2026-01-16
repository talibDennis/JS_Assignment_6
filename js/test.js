
// const toggle1 = document.getElementById('myToggle');

// window.onload = function () {
//   const toggle1 = document.getElementById("myToggle");
//   console.log("Initial toggle1 state:", toggle1.checked);
// };


// let blah
// const toggle2 = document.getElementById('switch-button-checkbox')


// toggle1.addEventListener("change", function () {
//   console.log("Toggle1 value:", toggle1.checked);
// });

// toggle2.addEventListener("change", function () {
//   console.log("Toggle2 value:", toggle2.checked);
// });


// toggle1.addEventListener("change", () => {
//   if (toggle1.checked) {
//     blah =  "week"
//   } else {
//     blah =  "day"
//   }
//   console.log(blah);
//   const res = (`trending/tv/${blah}?api_key=`);
// });

// toggle2.addEventListener("change", () => {
//   if (toggle2.checked) {
//     blah =  "week"
//   } else {
//     blah =  "day"
//   }
//   console.log(blah);
//   const res = (`trending/tv/${blah}?api_key=`);
// });



// ===== Toggle & helpers =====
const toggle1 = document.getElementById('switch-button-checkbox');

function getPeriod() {
  // Checked => "week", Unchecked => "day"
  return toggle1?.checked ? 'week' : 'day';
}

// Let main.js decide what to do when the toggle changes
export function wireMovieToggle(onChange) {
  if (!toggle1) return;
  toggle1.addEventListener('change', () => {
    onChange?.(getPeriod());
  });
}

// ===== Public API: loadShows =====
export async function loadTV({ apiKey, baseUrl, max = 6 }) {
  const period = getPeriod() ?? 'day';
  const url = `${baseUrl}trending/tv/${period}?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const items = (data.results ?? []).map(TVShow.fromJson);
    renderTV(items, max);
  } catch (err) {
    console.error('Failed to load tv shows:', err);
    renderTV([], 0); // degrade gracefully
  }
}