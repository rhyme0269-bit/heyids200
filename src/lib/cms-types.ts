export type BlockType =
  | "hero_banner"
  | "text_heading"
  | "text_body"
  | "image"
  | "image_gallery"
  | "list"
  | "key_value_list"
  | "table"
  | "faq_accordion"
  | "steps_flow"
  | "contact_form"
  | "map_embed"
  | "contact_info"
  | "cta_section"
  | "stats_strip"
  | "custom_html"
  | "profile_card"
  | "two_column_list"
  | "two_column_flow"
  | "contact_layout";

export type PageStatus = "published" | "draft";
export type HeroMode = "default" | "image" | "color";

export interface Page {
  id: string;
  templateId: string | null;
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  heroMode: HeroMode;
  heroColor: string;
  isSystem: boolean;
  seedKey: string | null;
  showInNav: boolean;
  navOrder: number;
  status: PageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  pageId: string;
  blockType: BlockType;
  sortOrder: number;
  data: Record<string, unknown>;
  config: BlockConfig;
  createdAt: string;
  updatedAt: string;
}

export interface BlockConfig {
  bgColor?: string;
  bgVariant?: "white" | "gray" | "dark";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  hidden?: boolean;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  defaultBlocks: Array<{
    blockType: BlockType;
    defaultData: Record<string, unknown>;
    defaultConfig?: BlockConfig;
  }>;
}

// Block-specific data shapes

export interface HeroBannerData {
  title: string;
  subtitle: string;
  bgMode: HeroMode;
  bgColor: string;
  bgImageKey: string | null;
}

export interface TextHeadingData {
  text: string;
  level: "h1" | "h2" | "h3";
}

export interface TextBodyData {
  html: string;
}

export interface ImageData {
  imageKey: string;
  alt: string;
  caption: string;
}

export interface ImageGalleryData {
  title: string;
  images: Array<{ imageKey: string; alt: string }>;
}

export interface ListData {
  title: string;
  style: "bullet" | "numbered" | "check" | "tag";
  items: string[];
}

export interface KeyValueListData {
  title: string;
  items: Array<{ label: string; value: string; icon?: string; url?: string }>;
}

export interface TableData {
  title: string;
  columns: Array<{
    key: string;
    label: string;
    align?: "left" | "center" | "right";
  }>;
  rows: Array<Record<string, string>>;
  footerNotes: string[];
}

export interface FaqAccordionData {
  title: string;
  items: Array<{ question: string; answer: string }>;
}

export interface StepsFlowData {
  title: string;
  steps: Array<{ name: string; description: string }>;
}

export interface ContactFormData {
  title: string;
  googleFormUrl?: string;
}

export interface MapEmbedData {
  title: string;
  address: string;
  embedUrl: string;
}

export interface ContactInfoData {
  title: string;
}

export interface CtaSectionData {
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface StatsStripData {
  items: Array<{ value: string; label: string }>;
}

export interface CustomHtmlData {
  html: string;
}

export interface ProfileCardData {
  introduction: string;
  quote: string;
  imageKey: string;
  imageName: string;
  imageSubtitle: string;
}

export interface TwoColumnListData {
  leftTitle: string;
  leftItems: string[];
  leftStyle: "check" | "bullet";
  rightTitle: string;
  rightItems: string[];
  rightStyle: "check" | "bullet" | "circle-check";
}

/**
 * Stage-by-stage flow with two parallel columns of work (e.g. 地政士作業 vs
 * 買賣雙方作業). Column text is one entry per line rather than an array, so the
 * editor is a plain textarea and a stage can hold any number of entries.
 */
export interface TwoColumnFlowData {
  title: string;
  leftLabel: string;
  rightLabel: string;
  defaultOpen: boolean;
  stages: Array<{
    name: string;
    left: string;
    right: string;
  }>;
}

export interface ContactLayoutData {
  formTitle: string;
  infoTitle: string;
  mapAddress: string;
  mapEmbedUrl: string;
}

// Nav item for dynamic navigation
export interface NavItem {
  slug: string;
  title: string;
  href: string;
  navOrder: number;
  isExternal?: boolean;
}

// Custom nav link (not tied to a CMS page)
export interface NavLink {
  id: string;
  label: string;
  href: string;
  navOrder: number;
  isExternal: boolean;
  createdAt: string;
}
