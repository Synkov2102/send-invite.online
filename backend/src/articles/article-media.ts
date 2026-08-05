import type { Article, ArticleBlock } from "@invite/shared";
import { blogImageKeyPrefix, isS3ObjectRef, parseS3ObjectRef } from "../storage/s3-storage.service";

/**
 * MongoDB stores `s3://bucket/blog-images/<id>`; the frontend must never see that.
 * The key maps 1:1 onto the public path, so serving needs no extra lookup.
 */
export function getPublicArticleImageUrl(src: string) {
  if (!isS3ObjectRef(src)) {
    return src;
  }

  const parsed = parseS3ObjectRef(src);

  if (!parsed || !parsed.key.startsWith(blogImageKeyPrefix)) {
    return "";
  }

  return `/api/blog-images/${parsed.key.slice(blogImageKeyPrefix.length)}`;
}

function withPublicBlockImages(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks.map((block) =>
    block.kind === "image" ? { ...block, src: getPublicArticleImageUrl(block.src) } : block,
  );
}

/** Rewrites every stored image reference in an article into its public path. */
export function withPublicArticleImages(article: Article): Article {
  return {
    ...article,
    cover: article.cover
      ? { ...article.cover, src: getPublicArticleImageUrl(article.cover.src) }
      : null,
    intro: withPublicBlockImages(article.intro),
    sections: article.sections.map((section) => ({
      ...section,
      blocks: withPublicBlockImages(section.blocks),
    })),
  };
}
