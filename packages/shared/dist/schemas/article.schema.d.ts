import { z } from "zod";
export declare const articleSlugSchema: z.ZodString;
export declare const articleSpanSchema: z.ZodObject<{
    bold: z.ZodOptional<z.ZodBoolean>;
    href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    bold?: boolean | undefined;
    href?: string | undefined;
}, {
    text: string;
    bold?: boolean | undefined;
    href?: string | undefined;
}>;
export declare const articleBlockSchema: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    kind: z.ZodLiteral<"paragraph">;
    spans: z.ZodArray<z.ZodObject<{
        bold: z.ZodOptional<z.ZodBoolean>;
        href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    kind: "paragraph";
    spans: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[];
}, {
    kind: "paragraph";
    spans: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[];
}>, z.ZodObject<{
    items: z.ZodArray<z.ZodArray<z.ZodObject<{
        bold: z.ZodOptional<z.ZodBoolean>;
        href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }>, "many">, "many">;
    kind: z.ZodLiteral<"list">;
    ordered: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    kind: "list";
    items: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[][];
    ordered: boolean;
}, {
    kind: "list";
    items: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[][];
    ordered: boolean;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"quote">;
    spans: z.ZodArray<z.ZodObject<{
        bold: z.ZodOptional<z.ZodBoolean>;
        href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    kind: "quote";
    spans: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[];
}, {
    kind: "quote";
    spans: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[];
}>, z.ZodObject<{
    alt: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"image">;
    src: z.ZodString;
}, "strip", z.ZodTypeAny, {
    kind: "image";
    alt: string;
    src: string;
    caption?: string | undefined;
}, {
    kind: "image";
    alt: string;
    src: string;
    caption?: string | undefined;
}>, z.ZodObject<{
    href: z.ZodEffects<z.ZodString, string, string>;
    kind: z.ZodLiteral<"cta">;
    label: z.ZodString;
    spans: z.ZodArray<z.ZodObject<{
        bold: z.ZodOptional<z.ZodBoolean>;
        href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }, {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    href: string;
    kind: "cta";
    spans: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[];
    label: string;
}, {
    href: string;
    kind: "cta";
    spans: {
        text: string;
        bold?: boolean | undefined;
        href?: string | undefined;
    }[];
    label: string;
}>]>;
export declare const articleSectionSchema: z.ZodObject<{
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"paragraph">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        items: z.ZodArray<z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">, "many">;
        kind: z.ZodLiteral<"list">;
        ordered: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"quote">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        alt: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"image">;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }>, z.ZodObject<{
        href: z.ZodEffects<z.ZodString, string, string>;
        kind: z.ZodLiteral<"cta">;
        label: z.ZodString;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }>]>, "many">;
    heading: z.ZodString;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blocks: ({
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    } | {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    } | {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    })[];
    heading: string;
    id: string;
}, {
    blocks: ({
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    } | {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    } | {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    })[];
    heading: string;
    id: string;
}>;
export declare const articleFaqItemSchema: z.ZodObject<{
    answer: z.ZodString;
    question: z.ZodString;
}, "strip", z.ZodTypeAny, {
    answer: string;
    question: string;
}, {
    answer: string;
    question: string;
}>;
export declare const articleCoverSchema: z.ZodObject<{
    alt: z.ZodString;
    src: z.ZodString;
}, "strip", z.ZodTypeAny, {
    alt: string;
    src: string;
}, {
    alt: string;
    src: string;
}>;
export declare const articleStatusSchema: z.ZodEnum<["draft", "published"]>;
export declare const articleSchema: z.ZodObject<{
    cover: z.ZodNullable<z.ZodObject<{
        alt: z.ZodString;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        alt: string;
        src: string;
    }, {
        alt: string;
        src: string;
    }>>;
    description: z.ZodString;
    excerpt: z.ZodString;
    faq: z.ZodArray<z.ZodObject<{
        answer: z.ZodString;
        question: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        answer: string;
        question: string;
    }, {
        answer: string;
        question: string;
    }>, "many">;
    intro: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"paragraph">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        items: z.ZodArray<z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">, "many">;
        kind: z.ZodLiteral<"list">;
        ordered: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"quote">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        alt: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"image">;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }>, z.ZodObject<{
        href: z.ZodEffects<z.ZodString, string, string>;
        kind: z.ZodLiteral<"cta">;
        label: z.ZodString;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }>]>, "many">;
    publishedAt: z.ZodEffects<z.ZodString, string, string>;
    readingMinutes: z.ZodNumber;
    related: z.ZodArray<z.ZodString, "many">;
    sections: z.ZodArray<z.ZodObject<{
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"paragraph">;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }, {
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }>, z.ZodObject<{
            items: z.ZodArray<z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">, "many">;
            kind: z.ZodLiteral<"list">;
            ordered: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        }, {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"quote">;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }, {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }>, z.ZodObject<{
            alt: z.ZodString;
            caption: z.ZodOptional<z.ZodString>;
            kind: z.ZodLiteral<"image">;
            src: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        }, {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        }>, z.ZodObject<{
            href: z.ZodEffects<z.ZodString, string, string>;
            kind: z.ZodLiteral<"cta">;
            label: z.ZodString;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        }, {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        }>]>, "many">;
        heading: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }, {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }>, "many">;
    seoTitle: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    status: z.ZodEnum<["draft", "published"]>;
    tags: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    updatedAt: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "published";
    cover: {
        alt: string;
        src: string;
    } | null;
    description: string;
    excerpt: string;
    faq: {
        answer: string;
        question: string;
    }[];
    intro: ({
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    } | {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    } | {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    })[];
    publishedAt: string;
    readingMinutes: number;
    related: string[];
    sections: {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }[];
    seoTitle: string | null;
    slug: string;
    tags: string[];
    title: string;
    updatedAt: string;
}, {
    status: "draft" | "published";
    cover: {
        alt: string;
        src: string;
    } | null;
    description: string;
    excerpt: string;
    faq: {
        answer: string;
        question: string;
    }[];
    intro: ({
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    } | {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    } | {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    })[];
    publishedAt: string;
    readingMinutes: number;
    related: string[];
    sections: {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }[];
    seoTitle: string | null;
    slug: string;
    tags: string[];
    title: string;
    updatedAt: string;
}>;
/** Listing payload — no body, so `/blog` stays light. */
export declare const articleSummarySchema: z.ZodObject<Pick<{
    cover: z.ZodNullable<z.ZodObject<{
        alt: z.ZodString;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        alt: string;
        src: string;
    }, {
        alt: string;
        src: string;
    }>>;
    description: z.ZodString;
    excerpt: z.ZodString;
    faq: z.ZodArray<z.ZodObject<{
        answer: z.ZodString;
        question: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        answer: string;
        question: string;
    }, {
        answer: string;
        question: string;
    }>, "many">;
    intro: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"paragraph">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        items: z.ZodArray<z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">, "many">;
        kind: z.ZodLiteral<"list">;
        ordered: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"quote">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        alt: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"image">;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }>, z.ZodObject<{
        href: z.ZodEffects<z.ZodString, string, string>;
        kind: z.ZodLiteral<"cta">;
        label: z.ZodString;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }>]>, "many">;
    publishedAt: z.ZodEffects<z.ZodString, string, string>;
    readingMinutes: z.ZodNumber;
    related: z.ZodArray<z.ZodString, "many">;
    sections: z.ZodArray<z.ZodObject<{
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"paragraph">;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }, {
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }>, z.ZodObject<{
            items: z.ZodArray<z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">, "many">;
            kind: z.ZodLiteral<"list">;
            ordered: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        }, {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"quote">;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }, {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }>, z.ZodObject<{
            alt: z.ZodString;
            caption: z.ZodOptional<z.ZodString>;
            kind: z.ZodLiteral<"image">;
            src: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        }, {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        }>, z.ZodObject<{
            href: z.ZodEffects<z.ZodString, string, string>;
            kind: z.ZodLiteral<"cta">;
            label: z.ZodString;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        }, {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        }>]>, "many">;
        heading: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }, {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }>, "many">;
    seoTitle: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    status: z.ZodEnum<["draft", "published"]>;
    tags: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    updatedAt: z.ZodEffects<z.ZodString, string, string>;
}, "cover" | "description" | "excerpt" | "publishedAt" | "readingMinutes" | "slug" | "tags" | "title" | "updatedAt">, "strip", z.ZodTypeAny, {
    cover: {
        alt: string;
        src: string;
    } | null;
    description: string;
    excerpt: string;
    publishedAt: string;
    readingMinutes: number;
    slug: string;
    tags: string[];
    title: string;
    updatedAt: string;
}, {
    cover: {
        alt: string;
        src: string;
    } | null;
    description: string;
    excerpt: string;
    publishedAt: string;
    readingMinutes: number;
    slug: string;
    tags: string[];
    title: string;
    updatedAt: string;
}>;
export declare const articleSitemapEntrySchema: z.ZodObject<Pick<{
    cover: z.ZodNullable<z.ZodObject<{
        alt: z.ZodString;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        alt: string;
        src: string;
    }, {
        alt: string;
        src: string;
    }>>;
    description: z.ZodString;
    excerpt: z.ZodString;
    faq: z.ZodArray<z.ZodObject<{
        answer: z.ZodString;
        question: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        answer: string;
        question: string;
    }, {
        answer: string;
        question: string;
    }>, "many">;
    intro: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"paragraph">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        items: z.ZodArray<z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">, "many">;
        kind: z.ZodLiteral<"list">;
        ordered: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }, {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"quote">;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }, {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    }>, z.ZodObject<{
        alt: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"image">;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }, {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    }>, z.ZodObject<{
        href: z.ZodEffects<z.ZodString, string, string>;
        kind: z.ZodLiteral<"cta">;
        label: z.ZodString;
        spans: z.ZodArray<z.ZodObject<{
            bold: z.ZodOptional<z.ZodBoolean>;
            href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }, {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }, {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    }>]>, "many">;
    publishedAt: z.ZodEffects<z.ZodString, string, string>;
    readingMinutes: z.ZodNumber;
    related: z.ZodArray<z.ZodString, "many">;
    sections: z.ZodArray<z.ZodObject<{
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"paragraph">;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }, {
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }>, z.ZodObject<{
            items: z.ZodArray<z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">, "many">;
            kind: z.ZodLiteral<"list">;
            ordered: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        }, {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"quote">;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }, {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        }>, z.ZodObject<{
            alt: z.ZodString;
            caption: z.ZodOptional<z.ZodString>;
            kind: z.ZodLiteral<"image">;
            src: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        }, {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        }>, z.ZodObject<{
            href: z.ZodEffects<z.ZodString, string, string>;
            kind: z.ZodLiteral<"cta">;
            label: z.ZodString;
            spans: z.ZodArray<z.ZodObject<{
                bold: z.ZodOptional<z.ZodBoolean>;
                href: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }, {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        }, {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        }>]>, "many">;
        heading: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }, {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }>, "many">;
    seoTitle: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    status: z.ZodEnum<["draft", "published"]>;
    tags: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    updatedAt: z.ZodEffects<z.ZodString, string, string>;
}, "publishedAt" | "slug" | "updatedAt">, "strip", z.ZodTypeAny, {
    publishedAt: string;
    slug: string;
    updatedAt: string;
}, {
    publishedAt: string;
    slug: string;
    updatedAt: string;
}>;
export type ArticleSpan = z.infer<typeof articleSpanSchema>;
export type ArticleBlock = z.infer<typeof articleBlockSchema>;
export type ArticleSection = z.infer<typeof articleSectionSchema>;
export type ArticleFaqItem = z.infer<typeof articleFaqItemSchema>;
export type ArticleCover = z.infer<typeof articleCoverSchema>;
export type ArticleStatus = z.infer<typeof articleStatusSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ArticleSummary = z.infer<typeof articleSummarySchema>;
export type ArticleSitemapEntry = z.infer<typeof articleSitemapEntrySchema>;
export declare const isArticle: (value: unknown) => value is {
    status: "draft" | "published";
    cover: {
        alt: string;
        src: string;
    } | null;
    description: string;
    excerpt: string;
    faq: {
        answer: string;
        question: string;
    }[];
    intro: ({
        kind: "paragraph";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "list";
        items: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[][];
        ordered: boolean;
    } | {
        kind: "quote";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
    } | {
        kind: "image";
        alt: string;
        src: string;
        caption?: string | undefined;
    } | {
        href: string;
        kind: "cta";
        spans: {
            text: string;
            bold?: boolean | undefined;
            href?: string | undefined;
        }[];
        label: string;
    })[];
    publishedAt: string;
    readingMinutes: number;
    related: string[];
    sections: {
        blocks: ({
            kind: "paragraph";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "list";
            items: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[][];
            ordered: boolean;
        } | {
            kind: "quote";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
        } | {
            kind: "image";
            alt: string;
            src: string;
            caption?: string | undefined;
        } | {
            href: string;
            kind: "cta";
            spans: {
                text: string;
                bold?: boolean | undefined;
                href?: string | undefined;
            }[];
            label: string;
        })[];
        heading: string;
        id: string;
    }[];
    seoTitle: string | null;
    slug: string;
    tags: string[];
    title: string;
    updatedAt: string;
};
export declare const isArticleSummary: (value: unknown) => value is {
    cover: {
        alt: string;
        src: string;
    } | null;
    description: string;
    excerpt: string;
    publishedAt: string;
    readingMinutes: number;
    slug: string;
    tags: string[];
    title: string;
    updatedAt: string;
};
export declare const isArticleSitemapEntry: (value: unknown) => value is {
    publishedAt: string;
    slug: string;
    updatedAt: string;
};
