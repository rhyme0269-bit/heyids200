// ===== Types =====

export interface SiteSettings {
  name: string;
  phone: string;
  mobile: string;
  email: string;
  lineId: string;
  lineUrl: string;
  address: string;
  googleMapUrl: string;
  googleMapEmbed: string;
  scrivenerName: string;
  licenseNumber: string;
  logoSize: string;
}

export interface About {
  introduction: string;
  philosophy: string;
  features: string[];
  qualifications: string[];
  experience: string[];
  specialties: string[];
}

export interface Service {
  _id: string;
  title: string;
  description: string;
}

export interface ServiceFlow {
  _id: string;
  stepName: string;
  stepDescription: string;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
}

export interface FeeItem {
  id: number;
  service: string;
  fee: string;
  payer: string;
  note: string;
}

// ===== Site Settings =====

export const defaultSiteSettings: SiteSettings = {
  name: "合一地政士事務所",
  phone: "02-2282-6600",
  mobile: "0915195429",
  email: "heyids200@gmail.com",
  lineId: "@240mvtlq",
  lineUrl: "https://line.me/R/ti/p/@240mvtlq",
  address: "新北市蘆洲區長安街200號",
  googleMapUrl: "https://maps.app.goo.gl/TnpryxjWD7y53Mbx7?g_st=ic",
  googleMapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.5!2d121.473!3d25.085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5ZCI5LiA5Zyw5pS_5aOr5LqL5YuZ5omA!5e0!3m2!1szh-TW!2stw!4v1",
  scrivenerName: "胡玉芬",
  licenseNumber: "（108）新北府地士字第003204號（換發）",
  logoSize: "medium",
};

// ===== About =====

export const defaultAbout: About = {
  introduction:
    "合一地政士事務所由胡玉芬地政士主持，民國 87 年通過國家考試取得地政士資格，執業至今已逾 26 年。長期與多家知名房仲品牌合作，累積豐富的不動產登記實務經驗，服務範圍涵蓋全台。",
  philosophy:
    "「專業、誠信、效率」——以超過 26 年的專業經驗，為每一位客戶提供最安心的不動產登記服務。我們相信，每一筆交易的背後都承載著客戶的信任與期待，合一地政士事務所將以嚴謹的態度、透明的流程，守護您的不動產權益。",
  features: [
    "超過 26 年不動產登記實務經驗",
    "全台服務，北北基桃以外地區亦可承辦",
    "與多家知名房仲品牌長期合作",
    "一對一專人服務，流程透明有保障",
  ],
  qualifications: [
    "87年地政士國家考試及格",
    "永慶不動產特約地政士",
    "有巢氏房屋特約地政士",
    "永義房屋特約地政士",
    "台慶不動產特約地政士",
    "台灣房屋特約地政士",
    "全國不動產特約地政士",
    "第一建經特約地政士",
    "合泰建經特約地政士",
    "僑馥建經特約地政士",
    "安新建經特約地政士",
  ],
  experience: [
    "正業地政士聯合事務所蘆洲所經理",
    "正業地政士聯合事務所板橋所經理",
    "住商不動產特約地政士",
    "太平洋房屋特約地政士",
    "東森房屋特約地政士",
    "中信房屋特約地政士",
    "大家房屋特約地政士",
    "21世紀房屋特約地政士",
  ],
  specialties: [
    "不動產買賣移轉登記",
    "繼承規劃與登記",
    "贈與及節稅規劃",
    "抵押權設定與塗銷",
    "信託登記與規劃",
    "房地合一稅節稅規劃",
  ],
};

// ===== Services =====

export const defaultServices: Service[] = [
  {
    _id: "service-1",
    title: "不動產買賣移轉登記",
    description:
      "協助買賣雙方完成不動產所有權移轉登記，確保交易安全與權益保障。",
  },
  {
    _id: "service-2",
    title: "繼承登記",
    description:
      "處理不動產繼承相關登記事務，協助繼承人順利完成產權移轉。",
  },
  {
    _id: "service-3",
    title: "贈與登記",
    description:
      "辦理不動產贈與移轉登記，並提供節稅規劃建議。",
  },
  {
    _id: "service-4",
    title: "抵押權設定／塗銷",
    description:
      "協助辦理銀行或私人抵押權設定及塗銷登記，保障債權債務雙方權益。",
  },
  {
    _id: "service-5",
    title: "房地合一稅",
    description:
      "房地合一稅申辦、節稅、規劃，協助您合法降低稅務負擔。",
  },
  {
    _id: "service-6",
    title: "共有物分割",
    description:
      "處理共有不動產之分割登記，協助共有人釐清產權歸屬。",
  },
  {
    _id: "service-7",
    title: "信託登記",
    description:
      "辦理不動產信託登記，保障委託人與受益人之權益。",
  },
  {
    _id: "service-8",
    title: "節稅規劃",
    description:
      "提供不動產相關稅務之節稅諮詢與規劃服務，合法降低稅務負擔。",
  },
  {
    _id: "service-9",
    title: "不動產相關諮詢",
    description:
      "提供各類不動產登記、稅務、法規等相關問題之專業諮詢服務。",
  },
];

// ===== Service Flow =====

export const defaultServiceFlow: ServiceFlow[] = [
  {
    _id: "flow-1",
    stepName: "諮詢與需求了解",
    stepDescription:
      "透過電話、LINE 或親臨事務所，了解您的需求並提供初步建議。",
  },
  {
    _id: "flow-2",
    stepName: "文件準備與審核",
    stepDescription:
      "協助準備所需文件，並詳細審核確認文件內容正確無誤。",
  },
  {
    _id: "flow-3",
    stepName: "送件申辦",
    stepDescription:
      "將備妥之文件送至地政機關或相關單位辦理登記。",
  },
  {
    _id: "flow-4",
    stepName: "進度追蹤與回報",
    stepDescription:
      "即時追蹤案件辦理進度，主動向客戶回報最新狀態。",
  },
  {
    _id: "flow-5",
    stepName: "完成交付",
    stepDescription:
      "登記完成後，將權狀及相關文件交付客戶，並說明後續注意事項。",
  },
];

// ===== FAQs =====

export const defaultFaqs: Faq[] = [
  {
    _id: "faq-1",
    question: "買賣過戶需要多久時間？",
    answer:
      "一般不動產買賣移轉登記約需 30～45 天，視案件複雜程度、銀行貸款、地政機關作業時間而定。外縣市案件會看地區另有車馬費。",
  },
  {
    _id: "faq-2",
    question: "辦理過戶需要準備哪些文件？",
    answer:
      "一般需要身分證正本、印鑑證明、土地及建物權狀正本等。依案件類型不同所需文件有所差異，歡迎來電或加 LINE 詢問，我們會詳細告知您需要準備的文件清單。",
  },
  {
    _id: "faq-3",
    question: "地政士費用怎麼計算？",
    answer:
      "費用依案件類型而定，請參考本所收費標準頁面。實際費用會在了解您的案件內容後提供正式報價，絕不額外加價。",
  },
  {
    _id: "faq-4",
    question: "你們服務的範圍涵蓋哪些地區？",
    answer:
      "我們的服務範圍涵蓋全台，主要服務區域為北北基桃地區。外縣市案件亦可承辦，依路程遠近酌收車馬費。",
  },
  {
    _id: "faq-5",
    question: "繼承登記有期限嗎？",
    answer:
      "依法繼承登記應自繼承開始之日起 6 個月內辦理。逾期未辦理者，地政機關得處以罰鍰，建議儘早辦理以避免額外費用。",
  },
  {
    _id: "faq-6",
    question: "可以用 LINE 諮詢嗎？",
    answer:
      "當然可以！歡迎加入我們的官方 LINE 帳號（ID: @240mvtlq），即可線上諮詢。我們會盡快回覆您的問題。",
  },
  {
    _id: "faq-7",
    question: "房地合一稅如何申報？",
    answer:
      "房地合一稅應在不動產完成移轉登記之日起 30 日內申報。稅額計算涉及取得成本、持有期間、自用住宅優惠等因素，建議委託專業地政士協助申報，以確保正確申報並合法節稅。",
  },
];

// ===== Fee Schedule =====

export const defaultFeeSchedule: FeeItem[] = [
  {
    id: 1,
    service: "買賣簽約費",
    fee: "1,500",
    payer: "買賣雙方",
    note: "繁複案件或訂約人數超過3人以上得酌加",
  },
  {
    id: 2,
    service: "實價登錄",
    fee: "3,000",
    payer: "買賣雙方",
    note: "雙方各分擔1/2",
  },
  {
    id: 3,
    service: "土地+建物買賣/贈與移轉登記",
    fee: "14,000",
    payer: "買方",
    note: "土地每增加一筆加收1,000元；建物每增加一筆加收2,000元；多登記一人加3,000",
  },
  {
    id: 4,
    service: "銀行抵押權設定登記",
    fee: "5,000",
    payer: "買方",
    note: "每件係指土地及建物各一筆，如筆數增加每超過一筆加收1,250元",
  },
  {
    id: 5,
    service: "私人抵押權設定登記",
    fee: "6,000",
    payer: "所有權人",
    note: "每件係指土地及建物各一筆，如筆數增加每超過一筆加收1,500元",
  },
  {
    id: 6,
    service: "代申請水電瓦斯更名",
    fee: "1,000",
    payer: "買方",
    note: "若申辦買賣、贈與移轉登記則免費優待",
  },
  {
    id: 7,
    service: "抵押權塗銷登記",
    fee: "2,000",
    payer: "賣方",
    note: "每件係指土地及建物各一筆，如筆數增加每超過一筆加收500元",
  },
  {
    id: 8,
    service: "一生一次／一生一屋 增值稅自用優惠稅率申報",
    fee: "3,000",
    payer: "賣方",
    note: "",
  },
  {
    id: 9,
    service: "地價稅自用住宅優惠稅率申請",
    fee: "1,000",
    payer: "賣方",
    note: "若申辦買賣、贈與移轉登記則免費優待",
  },
  {
    id: 10,
    service: "房地合一稅申報",
    fee: "5,000",
    payer: "賣方",
    note: "若有重購退稅、其他節稅規劃則另行報價",
  },
  {
    id: 11,
    service: "增值稅重購退稅申請",
    fee: "6,000",
    payer: "賣方",
    note: "",
  },
  {
    id: 12,
    service: "申請房屋稅籍證明",
    fee: "1,000",
    payer: "所有權人",
    note: "若申辦買賣、贈與移轉登記則免費優待",
  },
  {
    id: 13,
    service:
      "產權調查/分區使用證明 (含申請登記簿、地籍圖、建物平面圖謄本)",
    fee: "2,000",
    payer: "所有權人",
    note: "若申辦買賣、贈與移轉登記則免費優待",
  },
  {
    id: 14,
    service: "土地買賣移轉登記",
    fee: "10,000",
    payer: "買方",
    note: "土地以1人一筆為計收單位，每增加1筆土地加收1,000元；多登記一人加3,000",
  },
  {
    id: 15,
    service: "建物買賣移轉登記",
    fee: "10,000",
    payer: "買方",
    note: "建物以1人一建號為計收單位，每增加1建號加收2,000元；多登記一人加3,000",
  },
  {
    id: 16,
    service: "未登記建物買賣稅籍變更",
    fee: "6,000",
    payer: "買方",
    note: "",
  },
  {
    id: 17,
    service: "土地贈與移轉登記",
    fee: "10,000",
    payer: "買方",
    note: "",
  },
  {
    id: 18,
    service: "建物贈與移轉登記",
    fee: "10,000",
    payer: "買方",
    note: "",
  },
  {
    id: 19,
    service: "申報贈與稅",
    fee: "3,000",
    payer: "所有權人",
    note: "辦理贈與登記參照第3項計費方式",
  },
  {
    id: 20,
    service: "他項權利內容變更登記/他項權利移轉登記",
    fee: "5,000",
    payer: "所有權人",
    note: "",
  },
  {
    id: 21,
    service: "繼承登記",
    fee: "14,000",
    payer: "繼承人",
    note: "同第3項；繁複案件價格另議",
  },
  {
    id: 22,
    service: "拋棄繼承權申辦",
    fee: "8,000",
    payer: "繼承人",
    note: "人數增加時，參照第2項計費方式加收",
  },
  {
    id: 23,
    service: "申報遺產稅、申報贈與稅(主張買賣)",
    fee: "10,000",
    payer: "繼承人",
    note: "若有不動產以外之其他資產須依案件繁複程度報價",
  },
  {
    id: 24,
    service: "遺產稅節稅規劃",
    fee: "另議",
    payer: "繼承人",
    note: "除免稅額及配偶、直系血親卑親屬、父母之扣除額、農用之農地、喪葬費用外依節稅額15%計收",
  },
  {
    id: 25,
    service: "房屋稅設籍申報",
    fee: "2,000",
    payer: "所有權人",
    note: "與「建物所有權第一次登記」一併委託者，得合併議價",
  },
  {
    id: 26,
    service: "夫妻剩餘財產差額分配請求權登記",
    fee: "18,000",
    payer: "雙方協議",
    note: "離婚亦適用",
  },
  {
    id: 27,
    service: "地上權、典權、地役權設定登記",
    fee: "5,000",
    payer: "所有權人",
    note: "案情繁複時得酌加",
  },
  {
    id: 28,
    service: "權利書狀補給登記",
    fee: "3,000",
    payer: "所有權人",
    note: "土地以1人一筆為計收單位，每增加1人或1筆土地加收1,000元",
  },
  {
    id: 29,
    service: "權利書狀換給登記",
    fee: "2,000",
    payer: "所有權人",
    note: "土地以1人一筆為計收單位，每增加1人或1筆土地加收1,000元",
  },
  {
    id: 30,
    service: "土地鑑界、土地複丈",
    fee: "4,000",
    payer: "所有權人",
    note: "需現場指界、領丈時，得另酌收車馬費",
  },
  {
    id: 31,
    service: "建物測量、門牌號勘查",
    fee: "4,000",
    payer: "所有權人",
    note: "需現場指界、領丈時，得另酌收車馬費",
  },
  {
    id: 32,
    service: "土地建物分割、合併申請 (含標示變更登記)",
    fee: "8,000",
    payer: "所有權人",
    note: "",
  },
  {
    id: 33,
    service: "土地、建物交換登記",
    fee: "10,000",
    payer: "所有權人",
    note: "",
  },
  {
    id: 34,
    service: "共有物所有權分割登記",
    fee: "10,000",
    payer: "所有權人",
    note: "以分割後筆數參照第3項計費方式加收，繁複案件價格另議",
  },
  {
    id: 35,
    service: "姓名、住址標示變更登記",
    fee: "3,000",
    payer: "所有權人",
    note: "",
  },
  {
    id: 36,
    service: "更正登記",
    fee: "3,000",
    payer: "所有權人",
    note: "以有案可稽者為準，如無案可稽者之更正，視案件繁雜程度另議",
  },
  {
    id: 37,
    service: "預告登記",
    fee: "6,000",
    payer: "所有權人",
    note: "",
  },
  {
    id: 38,
    service: "塗銷預告登記",
    fee: "3,000",
    payer: "權利人",
    note: "",
  },
  {
    id: 39,
    service: "信託、受託人變更塗銷信託信託歸屬登記",
    fee: "14,000",
    payer: "權利人",
    note: "",
  },
  {
    id: 40,
    service: "公、認證之代理申請",
    fee: "8,000",
    payer: "所有權人",
    note: "視複雜性與難易度議定",
  },
  {
    id: 41,
    service: "存證信函之擬訂",
    fee: "6,000",
    payer: "",
    note: "視複雜性與難易度議定",
  },
  {
    id: 42,
    service: "案件撤銷申請",
    fee: "6,000",
    payer: "雙方協議",
    note: "中途撤銷",
  },
];

// ===== Fee Notes =====

export const defaultFeeNotes: string[] = [
  "皆未含政府規費、稅費、銀行手續費、火險地震險費、履保費。",
  "如需前往北北基桃以外地區辦理，依路程遠近酌收車馬費。",
  "因不動產之規劃執行需要考量的層面很廣且項目繁多，並依照當事人面臨的情況不同、考量的方向也會有所差異，為了避免造成您的誤會，建議提供相關資料後由我們提供報價給您，資料絕對保密，請依正式報價單為主，依個案情形另享優惠。",
];
