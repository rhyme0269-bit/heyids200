import type { Block } from "@/lib/cms-types";
import HeroBannerRenderer from "./renderers/HeroBannerRenderer";
import TextHeadingRenderer from "./renderers/TextHeadingRenderer";
import TextBodyRenderer from "./renderers/TextBodyRenderer";
import ImageRenderer from "./renderers/ImageRenderer";
import ImageGalleryRenderer from "./renderers/ImageGalleryRenderer";
import ListRenderer from "./renderers/ListRenderer";
import KeyValueListRenderer from "./renderers/KeyValueListRenderer";
import TableRenderer from "./renderers/TableRenderer";
import FaqAccordionRenderer from "./renderers/FaqAccordionRenderer";
import StepsFlowRenderer from "./renderers/StepsFlowRenderer";
import ContactFormRenderer from "./renderers/ContactFormRenderer";
import MapEmbedRenderer from "./renderers/MapEmbedRenderer";
import ContactInfoRenderer from "./renderers/ContactInfoRenderer";
import CtaSectionRenderer from "./renderers/CtaSectionRenderer";
import StatsStripRenderer from "./renderers/StatsStripRenderer";
import CustomHtmlRenderer from "./renderers/CustomHtmlRenderer";
import ProfileCardRenderer from "./renderers/ProfileCardRenderer";
import TwoColumnListRenderer from "./renderers/TwoColumnListRenderer";
import TwoColumnFlowRenderer from "./renderers/TwoColumnFlowRenderer";
import ContactLayoutRenderer from "./renderers/ContactLayoutRenderer";

const RENDERERS: Record<string, React.ComponentType<{ data: Record<string, unknown> }>> = {
  hero_banner: HeroBannerRenderer,
  text_heading: TextHeadingRenderer,
  text_body: TextBodyRenderer,
  image: ImageRenderer,
  image_gallery: ImageGalleryRenderer,
  list: ListRenderer,
  key_value_list: KeyValueListRenderer,
  table: TableRenderer,
  faq_accordion: FaqAccordionRenderer,
  steps_flow: StepsFlowRenderer,
  contact_form: ContactFormRenderer,
  map_embed: MapEmbedRenderer,
  contact_info: ContactInfoRenderer,
  cta_section: CtaSectionRenderer,
  stats_strip: StatsStripRenderer,
  custom_html: CustomHtmlRenderer,
  profile_card: ProfileCardRenderer,
  two_column_list: TwoColumnListRenderer,
  two_column_flow: TwoColumnFlowRenderer,
  contact_layout: ContactLayoutRenderer,
};

const BG_VARIANTS: Record<string, string> = {
  white: "bg-white",
  gray: "bg-stone-50",
  dark: "bg-stone-900 text-white",
};

const MAX_WIDTHS: Record<string, string> = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const PADDINGS: Record<string, string> = {
  none: "",
  sm: "py-8",
  md: "py-16",
  lg: "py-20 md:py-28",
};

interface BlockRendererProps {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.config.hidden) return null;

        const Renderer = RENDERERS[block.blockType];
        if (!Renderer) return null;

        const isFullWidth =
          block.blockType === "hero_banner" ||
          block.blockType === "cta_section" ||
          block.blockType === "stats_strip";

        if (isFullWidth) {
          return <Renderer key={block.id} data={block.data} />;
        }

        const bg = BG_VARIANTS[block.config.bgVariant ?? "white"] ?? "bg-white";
        const maxW = MAX_WIDTHS[block.config.maxWidth ?? "xl"] ?? "max-w-7xl";
        const pad = PADDINGS[block.config.padding ?? "md"] ?? "py-16";

        /*
         * Consecutive blocks of the same type on the same background each carry
         * their own vertical padding, so the gap between them doubles. On the
         * links page that put ~128px between three short link groups, which read
         * as the page being empty rather than as generous spacing (#25 二十一).
         * Drop the leading padding when a block continues the previous one.
         */
        const prev = index > 0 ? blocks[index - 1] : null;
        const continuesPrev =
          !!prev &&
          !prev.config.hidden &&
          prev.blockType === block.blockType &&
          (prev.config.bgVariant ?? "white") === (block.config.bgVariant ?? "white");

        return (
          <section key={block.id} className={`${bg} ${pad} ${continuesPrev ? "pt-0" : ""}`}>
            <div className={`${maxW} mx-auto px-4 sm:px-6 lg:px-8`}>
              <Renderer data={block.data} />
            </div>
          </section>
        );
      })}
    </>
  );
}
