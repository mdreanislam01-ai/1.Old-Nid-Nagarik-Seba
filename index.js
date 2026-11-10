const response = await fetch('https://sgeduufs.vercel.app/api/generate-pdf', {
  method: 'POST', // ⬅️ এটি অবশ্যই POST হতে হবে
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Md Shafiqul Islam",
    father: "Md Karim Uddin",
    mother: "Mst Amena Begum",
    dob: "1968-06-14",
    dod: "2023-12-27",
    cause: "Heart attack",
    regNo: "19832015478026451",
    regDate: "2026-11-06",
    office: "Batadanga Uttara"
  })
});
