export const foundation = [
  {
    id: "competency-ksa", term: "Competency", title: "কাজটি করতে পারি কি?",
    example: "মিনা সেলাইয়ের ধাপ জানে। কাজের মান অনুযায়ী সোজা সেলাই করে দেখাল এবং কাপড় যত্নে ধরল।",
    prompt: "শুধু ধাপ মুখস্থ বললে মিনার কোন দুটি দিক দেখা বাকি থাকে?",
    answer: "Skill and attitude. Watch her sew and handle the fabric with care.",
    points: ["কাজটি করে দেখানো", "কাজের উপযুক্ত আচরণ"],
  },
  {
    id: "industry-competency-standards", term: "Competency standard", title: "কোন মানে কাজটি করতে হবে?",
    example: "প্রশিক্ষক কাজ শুরুর আগে মানদণ্ড দেখালেন। তাতে লেখা আছে কোন কাজটি কতটা ভালোভাবে করতে হবে।",
    prompt: "দুই প্রশিক্ষক একই কাজ যাচাই করবেন। কী দেখে তাঁরা প্রত্যাশিত মান ঠিক করবেন?",
    answer: "Use the competency standard. Its performance criteria describe the required performance.",
    points: ["Competency standard", "Performance criteria অনুযায়ী কাজের মান"],
  },
  {
    id: "rules-of-evidence", term: "Authenticity", title: "প্রমাণটি কার কাজ?",
    example: "রিনা একটি তৈরি ব্যাগ জমা দিল। ব্যাগটি সে নিজে তৈরি করেছে কি না assessor জানতে চান।",
    prompt: "একজন শিক্ষার্থী একটি spreadsheet জমা দিল। কীভাবে যাচাই করবেন কাজটি তার নিজের?",
    answer: "Ask the learner to explain the formulas and observe them doing the work.",
    points: ["নিজের কাজ কি না যাচাই", "কীভাবে করেছে বুঝিয়ে বলা বা সরাসরি করে দেখানো"],
  },
  {
    id: "choosing-assessment-methods", term: "Assessment method", title: "কীভাবে প্রমাণ নেব?",
    example: "কেউ মাপ নিতে পারে কি না দেখতে প্রশিক্ষক তাকে কাপড় মাপতে দিলেন। পদ্ধতিটির নাম observation।",
    prompt: "কেউ সোজা সেলাই করতে পারে কি না দেখার জন্য কোন method বাছবেন এবং কেন?",
    answer: "Use direct observation. Watch the learner sew and compare the work with the criteria.",
    points: ["Direct observation", "কাজটি মানদণ্ড অনুযায়ী হচ্ছে কি না দেখা"],
  },
  {
    id: "oral-questioning-tool", term: "Assessment tool", title: "কোন উপকরণে উত্তর যাচাই করব?",
    example: "মৌখিক প্রশ্ন করা একটি method। প্রশ্ন, প্রত্যাশিত উত্তর ও ফল লেখার জায়গাসহ ফর্মটি একটি tool।",
    prompt: "দুই assessor একই মৌখিক প্রশ্ন করবেন। tool-এ কী রাখলে উত্তর একই মানে যাচাই করা সহজ হবে?",
    answer: "Include the questions, expected answers and a place to record results.",
    points: ["নির্ধারিত প্রশ্ন ও প্রত্যাশিত উত্তর", "ফল লেখার জায়গা"],
  },
  {
    id: "assessment-decision", term: "Assessment decision", title: "প্রমাণ দেখে কী সিদ্ধান্ত নেব?",
    example: "একটি কাজের তিনটি আবশ্যিক মানদণ্ডের দুটির প্রমাণ পাওয়া গেছে। তৃতীয়টির প্রমাণও যাচাই করতে হবে।",
    prompt: "প্রার্থী একটি আবশ্যিক কাজ করে দেখায়নি। competent বলার আগে কী করবেন?",
    answer: "Identify the missing evidence. Collect and check it against the criteria before deciding.",
    points: ["কোন প্রমাণ বাকি বলা", "মানদণ্ডের সঙ্গে প্রমাণ মিলিয়ে সিদ্ধান্ত"],
  },
];

export type StudyPath = "foundation" | "weak" | "exam";
