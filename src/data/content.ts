import { Building2, FileText, ReceiptText, Send } from "lucide-react";

export const services = [
  {
    icon: FileText,
    title: "PSA online assistance",
    description:
      "Request assistance for CENOMAR, death certificates, marriage certificates, and birth certificates.",
    items: [
      "CENOMAR",
      "Death certificate",
      "Marriage certificate",
      "Birth certificate",
    ],
  },
  {
    icon: Send,
    title: "TrueMoney online",
    description:
      "Send or claim domestic and international remittances through the cooperative office.",
    items: [
      "Money Padala",
      "Domestic remittances",
      "International remittances",
      "Claims",
    ],
  },
  {
    icon: ReceiptText,
    title: "Bills payment",
    description:
      "Access selected payment and electronic loading services in one convenient location.",
    items: ["Mobile load", "Cable", "Airlines", "Internet"],
  },
  {
    icon: Building2,
    title: "Government service assistance",
    description:
      "Get assistance with selected online government transactions and voluntary contributions.",
    items: [
      "DFA",
      "LTO",
      "NBI",
      "Pag-IBIG",
      "SSS",
      "PhilHealth voluntary contributions",
    ],
  },
];

export const coreValues = [
  ["T", "Trustworthy"],
  ["I", "Integrity"],
  ["M", "Model cooperative"],
  ["G", "God-fearing"],
  ["A", "Articulate"],
  ["S", "Sincerity"],
];

export const objectives = [
  "Provide financial support to members who want additional capital for their businesses and an additional source of income.",
  "Develop the self-help mentality and self-employment capacity of individual members.",
  "Help members overcome dependency on moneylenders.",
  "Introduce an alternative system of banking to poor communities.",
  "Improve the lives of poor communities through participation in community and related activities.",
  "Cover program implementation costs through interest income and attain institutional self-reliance.",
];

export const socialGoals = [
  "A viable cooperative equipped with complete facilities and empowered in the pursuit of sustainable rural development.",
  "An institutionalized training program that develops and improves the cooperative's systems, policies, and procedures.",
];

export const announcements = [
  {
    id: 1,
    category: "Member advisory",
    date: "August 12, 2026",
    title: "General assembly set for September 14",
    excerpt:
      "Members are invited to review the agenda and confirm attendance at the cooperative office.",
  },
  {
    id: 2,
    category: "Program update",
    date: "August 5, 2026",
    title: "Farm input assistance opens this month",
    excerpt:
      "Qualified members can now submit requests for the next planting cycle.",
  },
  {
    id: 3,
    category: "Training",
    date: "July 28, 2026",
    title: "Financial literacy workshop for members",
    excerpt:
      "A practical session on budgeting, savings, and responsible borrowing.",
  },
];

export const principles = [
  [
    "Member-owned",
    "Every member has a voice. Decisions are made democratically and for our shared benefit.",
  ],
  [
    "Community-rooted",
    "We invest in local livelihoods and respond to the real needs of the communities we serve.",
  ],
  [
    "Future-focused",
    "We balance responsible growth today with a resilient, sustainable future for the next generation.",
  ],
];
